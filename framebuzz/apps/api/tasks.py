import datetime
import json

import celery
import redis
from actstream import action
from actstream.actions import follow, unfollow
from actstream.models import Action, Follow, followers, following
from django.conf import settings
from django.contrib import auth
from django.contrib.comments.models import CommentFlag
from django.contrib.sites.models import Site
from django.core.exceptions import ValidationError
from django.core.urlresolvers import reverse
from django.core.validators import validate_email
from django.db.models import Q
from django.utils import importlib
from framebuzz.apps.api import CHANNEL_KEY, DATA_KEY, EVENT_TYPE_KEY
from framebuzz.apps.api.forms import MPTTCommentForm
from framebuzz.apps.api.models import (MPTTComment, PrivateSession,
                                       SessionInvitation, UserProfile,
                                       UserVideo, Video)
from framebuzz.apps.api.serializers import (MPTTCommentReplySerializer,
                                            MPTTCommentSerializer,
                                            PrivateSessionSerializer,
                                            SessionInvitationSerializer,
                                            UserSerializer, VideoSerializer)
from rest_framework.renderers import JSONRenderer
from templated_email import send_templated_mail


def construct_message(event_type, channel, data):
    outbound_message = dict()
    outbound_message[EVENT_TYPE_KEY] = event_type
    outbound_message[CHANNEL_KEY] = channel
    outbound_message[DATA_KEY] = data
    return outbound_message


@celery.task(ignore_result=True)
def _send_to_channel(channel, message):
    logger = _send_to_channel.get_logger()
    logger.info('Sending message to channel %s' % channel)

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    response = json.dumps(message)
    r.publish(channel, response)


@celery.task(ignore_result=True)
def message_outbound(message):
    """
    Constructs a JSON message and sends it to the
    proper channel via Redis.

    Sample Message:
    {
        'eventType': 'subscribeToChannel',
        'channel': '/framebuzz/users/droxey',
        'data': {
            'subscribed': true
        }
    }
    """
    if message is not None:
        channel = message.get(CHANNEL_KEY, None)
        _send_to_channel.delay(channel=channel, message=message)


@celery.task
def get_user_by_session_key(session_key, extra_context=None):
    # Get the user from the session_id.
    engine = importlib.import_module(settings.SESSION_ENGINE)

    class Dummy(object):
        pass

    django_request = Dummy()
    django_request.session = engine.SessionStore(session_key)
    user = auth.get_user(django_request)

    if extra_context:
        extra_context['user'] = user
        return extra_context
    return user


@celery.task
def initialize_video_player(context):
    '''
    The general idea is to show a warmer color for areas of the video with more
    comment activity while accounting for videos with fewer comments.

    Each video is split into a number of equal time buckets (B).
    In the example,it's set to 30 and would be a site-wide setting.
    The total number of comments for an entire video is TC and is recalculated
    every time a comment is added or deleted.
    The total number of comments per bucket is calculated (C1, C2, C3, etc.)
    A minimum significance number is set as S (20 in the example and would be a
    site-wide setting). This accounts for videos with fewer comments.

    The algorithm calculates 8 levels of significance for the overall
    video every time TC changes:

        Rank 1: (TC+S)/3
        Rank 2: Rank 1 - (Rank 1 / 7)
        Rank 3: Rank 2 - (Rank 1 / 7)
        Rank 4: Rank 3 - (Rank 1 / 7)
        Rank 5: Rank 4 - (Rank 1 / 7)
        Rank 6: Rank 5 - (Rank 1 / 7)
        Rank 7: Rank 6 - (Rank 1 / 7)
        Rank 8: 0


    For each bucket, it's assigned a rank number based upon the values
    C1, C2, C3 etc. Each rank number maps to a background color for the bucket.
    '''
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    video_channel = context.get('video_channel', None)
    user = context.get('user', None)
    init_data = context.get(DATA_KEY, None)
    session_key = init_data.get('session_key', None)
    is_authenticated = isinstance(user, auth.models.AnonymousUser) is False

    # Get Video and associated MPTTComments.
    video = Video.objects.get(slug=video_id)
    threads = MPTTComment.objects.filter(object_pk=video.id,
                                         is_removed=False,
                                         parent=None)

    # Filter based on public/private comments.
    if session_key:
        threads = threads.filter(session__slug=session_key,
                                 is_public=False)
    else:
        threads = threads.filter(session=None,
                                 is_public=True)

    # Serialize objects to JSON.
    threads = threads.order_by('-time')
    videoSerializer = VideoSerializer(video)
    videoSerialized = JSONRenderer().render(videoSerializer.data)

    threadsSerializer = MPTTCommentSerializer(threads, context={'user': user})
    threadsSerialized = JSONRenderer().render(threadsSerializer.data)

    viewer_profiles = UserProfile.objects.filter(is_online=True,
                                                 channel=video_channel)
    viewers = [p.user for p in viewer_profiles]
    viewersSerializer = UserSerializer(viewers, context={'video': video})
    viewersSerialized = JSONRenderer().render(viewersSerializer.data)

    data = {
        'video': json.loads(videoSerialized),
        'heatmap': video.heatmap(session_key=session_key),
        'threads': json.loads(threadsSerialized),
        'is_authenticated': is_authenticated,
        'private_session_key': session_key,
        'is_synchronized': False,
        'is_hosting': False,
        'viewers': json.loads(viewersSerialized),
        'viewing_session': {},
        'user': {}
    }

    if data['is_authenticated']:
        userSerializer = UserSerializer(user, context={'video': video})
        userSerialized = JSONRenderer().render(userSerializer.data)
        data['user'] = json.loads(userSerialized)

        profile = user.get_profile()
        profile.is_online = True
        profile.last_online_on = datetime.datetime.now()
        profile.channel = video_channel
        profile.save()

    if session_key:
        session = PrivateSession.objects.get(slug=session_key)
        data['is_synchronized'] = session.is_synchronized
        data['is_hosting'] = data['is_authenticated'] and session.owner.pk == user.pk

        sessionSerializer = PrivateSessionSerializer(session)
        sessionSerialized = JSONRenderer().render(sessionSerializer.data)
        data['viewing_session'] = json.loads(sessionSerialized)

    return construct_message('FB_INITIALIZE_VIDEO', channel, data)


@celery.task
def post_new_comment(context):
    thread_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    comment = None
    video = Video.objects.get(slug=video_id)
    session_key = thread_data.get('session_key', None)
    is_public = True

    if thread_data.get('username', None):
        user = auth.models.User.objects.get(username=thread_data['username'])
    else:
        user = context.get('user', None)

    if thread_data:
        comment_form = MPTTCommentForm(video, data=thread_data)
        if comment_form.is_valid():
            data = comment_form.get_comment_create_data()

            # If a session key is available,
            # this comment is part of a private conversation.
            if session_key:
                is_public = False

                try:
                    session = PrivateSession.objects.get(slug=session_key)
                    data['is_public'] = False
                    data['session'] = session
                except:
                    pass

            data['user'] = user
            comment = MPTTComment(**data)
            comment.save()
        else:
            logger = post_new_comment.get_logger()
            logger.info(comment_form._errors)

    if comment:
        return_data = dict()
        return_data['heatmap'] = video.heatmap(session_key=session_key)
        return_data['channel'] = channel

        if not comment.parent:
            # Send a notification to the video's owner that
            # someone has commented on their video.
            if video.found_by and video.found_by.id != user.id:
                if is_public:
                    user_channel = '/framebuzz/%s/user/%s' \
                        % (video.video_id, video.found_by.username)
                    notification = {
                        'message': 'You have 1 new comment!',
                        'objectType': 'reply',
                        'objectId': comment.id
                    }

                    # Send a Toast notification to the video owner.
                    message = construct_message('FB_USER_NOTIFICATION',
                                                user_channel, notification)
                    _send_to_channel.delay(channel=user_channel,
                                           message=message)

                    # Send an email to the video owner.
                    if video.found_by.email:
                        send_templated_mail(
                            template_name='comment-notification',
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[video.found_by.email],
                            context={
                                'comment': comment,
                                'site': Site.objects.get_current()
                            })

            # Record that a comment was made.
            action.send(user, verb='commented on',
                        action_object=comment, target=video, public=is_public)

            # Serialize the comment to JSON to return to the UI.
            threadSerializer = MPTTCommentSerializer(comment,
                                                     context={'user': user})
            threadSerialized = JSONRenderer().render(threadSerializer.data)
            return_data['thread'] = json.loads(threadSerialized)
        else:
            # Record that a reply was made.
            action.send(user, verb='replied to comment',
                        action_object=comment, target=video, public=is_public)

            # Send a notification to the thread's owner that someone has
            # replied to their comment.
            if comment.parent.user.id != user.id:
                if is_public:
                    user_channel = '/framebuzz/%s/user/%s' \
                        % (video.video_id, comment.parent.user.username)
                    notification = {
                        'message': 'You have 1 new reply!',
                        'objectType': 'reply',
                        'objectId': comment.id
                    }

                    # Send a Toast notification to the thread starter.
                    message = construct_message('FB_USER_NOTIFICATION',
                                                user_channel, notification)
                    _send_to_channel.delay(channel=user_channel, message=message)

                    # Send an email notification the thread starter.
                    if comment.parent.user.email:
                        send_templated_mail(
                            template_name='reply-notification',
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[comment.parent.user.email],
                            context={
                                'comment': comment,
                                'site': Site.objects.get_current()
                            })

            # Serialize the comment to JSON to return to the UI.
            rSerializer = MPTTCommentReplySerializer(comment,
                                                     context={'user': user})
            replySerialized = JSONRenderer().render(rSerializer.data)
            return_data['reply'] = json.loads(replySerialized)

        # Send completed message to the UI.
        return construct_message('FB_POST_NEW_COMMENT', channel, return_data)


@celery.task
def add_comment_action(context):
    thread_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)
    video_id = context.get('video_id', None)
    video = Video.objects.get(slug=video_id)
    action_name = None

    if thread_data.get('username', None):
        user = auth.models.User.objects.get(username=thread_data['username'])
    else:
        user = context.get('user', None)

    if thread_data:
        thread = MPTTComment.objects.get(id=thread_data.get('threadId'))
        thread_action = thread_data.get('action')

        if thread_action == 'follow':
            check_following = Follow.objects.is_following(user, thread.user)

            if check_following:
                action_name = 'unfollowed'
                unfollow(user, thread.user)
            else:
                action_name = 'followed'
                follow(user, thread.user)

                if thread.user.id != user.id and thread.user.email:
                    user_channel = '/framebuzz/%s/user/%s' \
                        % (video.video_id, thread.user.username)
                    message_text = '%s is now following you!' % user.username
                    notification = {
                        'message': message_text,
                        'objectType': 'follow',
                        'objectId': None
                    }
                    message = construct_message('FB_USER_NOTIFICATION',
                                                user_channel, notification)
                    _send_to_channel.delay(channel=user_channel,
                                           message=message)

                    send_templated_mail(
                        template_name='following-notification',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[thread.user.email],
                        context={
                            'follower': user,
                            'site': Site.objects.get_current(),
                            'recipient': thread.user,
                        })
        elif thread_action == 'favorite':
            is_public = True
            if thread.session is not None:
                is_public = False

            is_fav = Action.objects.actor(user, verb='added to favorites',
                                          action_object_object_id=thread.id)

            if is_fav:
                action_name = 'removed_favorite'
                action.send(user, verb='removed from favorites',
                            action_object=thread, target=video)
                is_fav.delete()
            else:
                action_name = 'added_favorite'
                action.send(user, verb='added to favorites',
                            action_object=thread, target=video, public=is_public)

                if thread.user.id != user.id and thread.user.email:
                    user_channel = '/framebuzz/%s/user/%s' \
                        % (video.video_id, thread.user.username)
                    message_text = '%s added your comment to favorites!' \
                        % user.username
                    notification = {
                        'message': message_text,
                        'objectType': 'favorite',
                        'objectId': None
                    }
                    message = construct_message('FB_USER_NOTIFICATION',
                                                user_channel, notification)
                    _send_to_channel.delay(channel=user_channel,
                                           message=message)

                    send_templated_mail(
                        template_name='favorites-notification',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[thread.user.email],
                        context={
                            'comment': thread,
                            'site': Site.objects.get_current(),
                            'recipient': thread.user,
                            'user': user,
                        })
        elif thread_action == 'flag':
            commentFlag, created = CommentFlag.objects.get_or_create(
                comment=thread,
                user=user,
                flag=CommentFlag.SUGGEST_REMOVAL
            )

            if created:
                action_name = 'flagged_comment'
                action.send(user, verb='flagged comment',
                            action_object=thread, target=video)
            else:
                action_name = 'unflagged_comment'
                action.send(user, verb='unflagged comment',
                            action_object=thread, target=video)
                commentFlag.delete()
        else:
            pass

        updatedThread = MPTTComment.objects.get(id=thread_data.get('threadId'))
        returnThread = updatedThread if updatedThread.parent is None \
            else updatedThread.parent

        threadSerializer = MPTTCommentSerializer(returnThread,
                                                 context={'user': user})
        threadSerialized = JSONRenderer().render(threadSerializer.data)

        return_data = {
            'action': action_name,
            'thread': json.loads(threadSerialized)
        }
        return construct_message('FB_COMMENT_ACTION', channel, return_data)


@celery.task()
def toggle_user_follow(context):
    thread_data = context.get(DATA_KEY, None)
    user = context.get('user', None)
    video_id = context.get('video_id', None)
    toggle_user = thread_data.get('user_to_toggle', None)

    if toggle_user:
        user_to_toggle = auth.models.User.objects.get(username=toggle_user)

        check_following = Follow.objects.is_following(user, user_to_toggle)
        if check_following:
            unfollow(user, user_to_toggle)
        else:
            follow(user, user_to_toggle)

            if user_to_toggle.id != user.id and user_to_toggle.email:
                user_channel = '/framebuzz/%s/user/%s' % \
                    (video_id, user_to_toggle.username)
                message_text = '%s is now following you!' % user.username
                notification = {
                    'message': message_text,
                    'objectType': 'follow',
                    'objectId': None
                }
                message = construct_message('FB_USER_NOTIFICATION',
                                            user_channel, notification)
                _send_to_channel.delay(channel=user_channel, message=message)

                send_templated_mail(
                    template_name='following-notification',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user_to_toggle.email],
                    context={
                        'follower': user,
                        'site': Site.objects.get_current(),
                        'recipient': user_to_toggle,
                    })
        new_context = context
        new_context[DATA_KEY]['username'] = user_to_toggle.username
        new_context['current_user'] = user
        return new_context


@celery.task
def add_player_action(context):
    player_data = context.get(DATA_KEY, None)
    player_action = player_data.get('action', None)
    video_id = context.get('video_id', None)
    video = Video.objects.get(slug=video_id)
    session_key = player_data.get('session_key', None)
    outbound_channel = context.get('outbound_channel', None)
    verb = None

    if player_data.get('username', None):
        user = auth.models.User.objects.get(username=player_data['username'])
    else:
        user = context.get('user', None)

    if isinstance(user, auth.models.AnonymousUser):
        user = auth.models.User.objects.get(username='AnonymousUser')

    if player_action == 'player_playing':
        verb = 'played video'
    elif player_action == 'player_paused':
        verb = 'paused video'
    elif player_action == 'player_share':
        verb = 'shared'
    else:
        pass

    if session_key is not None:
        session = PrivateSession.objects.get(slug=session_key)
        if session.is_synchronized:
            # Broadcast the action to all players listening,
            # if the session owner initiated the broadcast.
            if user.pk == session.owner.pk and player_action != 'player_share':
                message = construct_message('FB_SYNC_CHANNEL', outbound_channel, player_data)
                _send_to_channel.delay(channel=outbound_channel, message=message)

    if 'video' in verb:
        action.send(user,
                    verb=verb,
                    action_object=video,
                    target=None, time=float(player_data.get('time')))
    else:
        action.send(user, verb=verb, action_object=video)


@celery.task
def get_activity_stream(context):
    context_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    valid_verbs = ['started following', 'added to favorites',
                   'replied to comment', 'added video to library']
    last_login = user.last_login - datetime.timedelta(days=1)
    user_activity_stream = Action.objects.filter(verb__in=valid_verbs,
                                                 timestamp__gte=last_login,
                                                 public=True)

    stream_data = list()
    for activity in user_activity_stream:
        if activity.action_object is not None and activity.actor.id != user.id:
            if activity.action_object_content_type.model == 'mpttcomment' \
                    and activity.action_object.user.id == user.id:
                verb = activity.verb
                if verb == 'replied to comment':
                    verb = 'replied to your comment'
                elif verb == 'added to favorites':
                    verb = 'added your comment to favorites'
                elif verb == 'removed from favorites':
                    verb = 'removed your comment from favorites'

                act = {
                    'actor': activity.actor.username,
                    'verb': verb,
                    'timesince': activity.timesince(),
                    'action_object': activity.action_object.__unicode__(),
                    'target_object': activity.target.__unicode__(),
                    'thread_url': activity.action_object.get_absolute_url(),
                    'video_url': activity.target.get_absolute_url()
                }
                stream_data.append(act)
        else:
            if activity.target_object_id == user.id:
                act = {
                    'actor': activity.actor.username,
                    'verb': '%s you' % activity.verb,
                    'timesince': activity.timesince(),
                    'target_object': activity.target.username
                }
                stream_data.append(act)

    return_data = {'activities': stream_data}
    return construct_message('FB_ACTIVITY_STREAM', channel, return_data)


@celery.task
def get_user_profile(context):
    context_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)
    current_user = context.get('current_user', None)
    user = auth.models.User.objects.get(username=context_data['username'])

    if not current_user:
        current_user = context.get('user', None)

    all_actions = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [a.action_object_object_id for a in all_actions]
    favorite_comments = MPTTComment.objects.filter(id__in=favorite_comment_ids)

    total_comments = MPTTComment.objects.filter(user=user)
    user_followers = followers(user)
    user_following = following(user)

    userSerializer = UserSerializer(user)
    userSerialized = JSONRenderer().render(userSerializer.data)

    favoritesSerializer = MPTTCommentSerializer(favorite_comments,
                                                context={'user': user})
    favoritesSerialized = JSONRenderer().render(favoritesSerializer.data)

    commentsSerializer = MPTTCommentSerializer(total_comments,
                                               context={'user': user})
    commentsSerialized = JSONRenderer().render(commentsSerializer.data)

    followersSerializer = UserSerializer(user_followers)
    followersSerialized = JSONRenderer().render(followersSerializer.data)

    followingSerializer = UserSerializer(user_following)
    followingSerialized = JSONRenderer().render(followingSerializer.data)

    is_anon_user = isinstance(current_user, auth.models.AnonymousUser)
    if current_user and not is_anon_user:
        check_following = Follow.objects.is_following(current_user, user)
    else:
        check_following = False

    return_data = {
        'favorite_comments': len(favorite_comments),
        'total_comments': len(total_comments),
        'user_followers': len(user_followers),
        'user_following': len(user_following),
        'favorites_list': json.loads(favoritesSerialized),
        'comments_list': json.loads(commentsSerialized),
        'followers_list': json.loads(followersSerialized),
        'following_list': json.loads(followingSerialized),
        'user': json.loads(userSerialized),
        'following': check_following
    }

    return construct_message('FB_USER_PROFILE', channel, return_data)


@celery.task(ignore_result=True)
def email_share(context):
    context_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    video = Video.objects.get(slug=video_id)
    share_with_email = context_data.get('shareWithEmail', None)
    shared_by = None

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    if user and not isinstance(user, auth.models.AnonymousUser):
        action.send(user, verb='shared', action_object=video)
        shared_by = user

    if share_with_email:
        send_templated_mail(
            template_name='share-email',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[share_with_email],
            context={
                'shared_by': user,
                'video': video,
                'site': Site.objects.get_current(),
                'shared_by': shared_by,
            })


@celery.task
def add_to_library(context):
    context_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    video = Video.objects.get(slug=video_id)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    user_video, created = UserVideo.objects.get_or_create(video=video,
                                                          user=user)

    if not created:
        old_action = Action.objects.actor(user, verb='added video to library',
                                          action_object_object_id=video.id)
        old_action.delete()
        user_video.delete()
        message = 'Video removed from library.'
    else:
        action.send(user, verb='added video to library',
                    action_object=video, target=user_video)
        message = 'Video added to library.'

    userSerializer = UserSerializer(user, context={'video': video})
    userSerialized = JSONRenderer().render(userSerializer.data)
    return_data = {
        'message': message,
        'user': json.loads(userSerialized)
    }
    return construct_message('FB_ADD_TO_LIBRARY', channel, return_data)


@celery.task
def search_user_list(context):
    context_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    video = Video.objects.get(slug=video_id)
    term = context_data.get('term', None)
    channel = context.get('outbound_channel', None)
    username = context_data.get('username', None)
    return_data = dict()

    # Add the authenticated user's name to the filter.
    selected_users = context.get('selected_users', None) or list()
    selected_users.append(username)

    if term:
        profiles = UserProfile.objects.exclude(user__username__in=selected_users).filter(
            Q(user__username__startswith=term) |
            Q(display_name__startswith=term))
        users = [p.user for p in profiles]
        usersSerializer = UserSerializer(users, context={'video': video})
        usersSerialized = JSONRenderer().render(usersSerializer.data)
        return_data['users'] = json.loads(usersSerialized)
        return construct_message('FB_SEARCH_USERS', channel, return_data)

    return_data['users'] = []
    return construct_message('FB_SEARCH_USERS', channel, return_data)


@celery.task
def enter_password(context):
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    video = Video.objects.get(slug=video_id)
    password = context.get('password', None)
    success = False

    if password:
        if password == video.password:
            success = True

    return_data = {'success': success}
    return construct_message('FB_ENTER_PASSWORD', channel, return_data)


@celery.task
def start_private_convo(context):
    context_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    video = Video.objects.get(slug=video_id)
    invitees = context.get('invitees', None) or list()
    site = Site.objects.get_current()
    send_to_list = list()
    start_private_viewing = context.get('start_private_viewing', False)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    # Create the session.
    private_session = PrivateSession()
    private_session.video = video
    private_session.owner = user
    private_session.is_synchronized = start_private_viewing
    private_session.save()

    # Iterate over the invitees.
    for invitee in invitees:
        email_addr = None
        fbz_user = None

        try:
            is_email_address = validate_email(invitee)
            email_addr = invitee
        except ValidationError:
            is_email_address = False

        if is_email_address:
            fbz_user = auth.models.User.objects.get(email=email_addr)
        else:
            # Get the email addy from our db, if we can.
            fbz_user = auth.models.User.objects.get(username=invitee)
            if fbz_user and fbz_user.email is not None:
                email_addr = fbz_user.email

        if email_addr:
            # Create and send the invite.
            invite = SessionInvitation()
            invite.session = private_session
            invite.invitee = fbz_user
            invite.email = email_addr
            invite.save()

            send_to_list.append(email_addr)

    if private_session.is_synchronized:
        email_template = 'private-session-invite'
        action.send(user, verb='joined private viewing',
                    action_object=private_session, target=video)
    else:
        email_template = 'private-convo-invite'
        action.send(user, verb='joined private conversation',
                    action_object=private_session, target=video)

    site = Site.objects.get_current()

    if len(send_to_list) > 0:
        # Send notifications to receipients.
        send_templated_mail(
            template_name=email_template,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=send_to_list,
            context={
                'session': private_session,
                'site': site,
                'video': video,
                'send_to_list': send_to_list,
                'audience_total': len(send_to_list) - 1,
                'site': site
            })

    if private_session.is_synchronized:
        convo_embed_url = reverse('viewing-embed', args=[video.slug, private_session.slug])
    else:
        convo_embed_url = reverse('convo-embed', args=[video.slug, private_session.slug])

    url = '%s%s' % (site.domain, convo_embed_url)
    return_data = {'convo_url': url, 'syncControls': private_session.is_synchronized}
    return construct_message('FB_START_PRIVATE_CONVO', channel, return_data)


@celery.task
def leave_video(context):
    username = context.get('username', None)
    video_channel = context.get('video_channel', None)

    if username:
        # Set the user profile information appropriately when the user leaves.
        try:
            user = auth.models.User.objects.get(username=username)
            profile = user.get_profile()
            profile.is_online = False
            profile.last_online_on = datetime.datetime.now()
            profile.channel = None
            profile.save()

            return_data = {'action': 'leave', 'username': username or 'New User', 'channel': video_channel}
            return construct_message('FB_LEAVE_VIDEO', video_channel, return_data)
        except auth.models.User.DoesNotExist:
            pass
