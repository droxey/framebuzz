import celery
import datetime
import json
import redis

from django.conf import settings
from django.contrib import auth
from django.contrib.comments.models import CommentFlag
from django.contrib.sites.models import Site
from django.utils import importlib

from actstream import action
from actstream.models import Action, Follow, followers, following
from actstream.actions import follow, unfollow
from rest_framework.renderers import JSONRenderer
from templated_email import send_templated_mail

from framebuzz.apps.api import EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY
from framebuzz.apps.api.forms import MPTTCommentForm
from framebuzz.apps.api.models import MPTTComment, Video, UserVideo
from framebuzz.apps.api.serializers import VideoSerializer, MPTTCommentSerializer, MPTTCommentReplySerializer, UserSerializer


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
    channel = message.get(CHANNEL_KEY, None)
    _send_to_channel.delay(channel = channel, message = message)


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
    The general idea is to show a warmer color for areas of the video with more comment activity while accounting for videos with fewer comments.

    Each video is split into a number of equal time buckets (B). In the example, it's set to 30 and would be a site-wide setting.
    The total number of comments for an entire video is TC and is recalculated every time a comment is added or deleted.
    The total number of comments per bucket is calculated (C1, C2, C3, etc.)
    A minimum significance number is set as S (20 in the example and would be a site-wide setting). This accounts for videos with fewer comments.


    The algorithm calculates 8 levels of significance for the overall video every time TC changes:

        Rank 1: (TC+S)/3
        Rank 2: Rank 1 - (Rank 1 / 7)
        Rank 3: Rank 2 - (Rank 1 / 7)
        Rank 4: Rank 3 - (Rank 1 / 7)
        Rank 5: Rank 4 - (Rank 1 / 7)
        Rank 6: Rank 5 - (Rank 1 / 7)
        Rank 7: Rank 6 - (Rank 1 / 7)
        Rank 8: 0


    For each bucket, it's assigned a rank number based upon the values C1, C2, C3 etc. Each rank number maps to a background color for the bucket.
    '''
    logger = initialize_video_player.get_logger()
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    user = context.get('user', None)

    logger.info(video_id)

    # Get Video.
    video = Video.objects.get(video_id=video_id) 
    threads = MPTTComment.objects.filter(object_pk=video.id, is_removed=False, parent=None).order_by('-time')
    videoSerializer = VideoSerializer(video)
    videoSerialized = JSONRenderer().render(videoSerializer.data)
    threadsSerializer = MPTTCommentSerializer(threads, context={ 'user': user })
    threadsSerialized = JSONRenderer().render(threadsSerializer.data)

    data = { }
    data['video'] = json.loads(videoSerialized)
    data['heatmap'] = video.heatmap()
    data['threads'] = json.loads(threadsSerialized)
    data['is_authenticated'] = isinstance(user, auth.models.AnonymousUser) is False

    if data['is_authenticated']:
        userSerializer = UserSerializer(user, context={ 'video': video })
        userSerialized = JSONRenderer().render(userSerializer.data)
        data['user'] = json.loads(userSerialized)
    else:
        data['user'] = {}

    return construct_message('FB_INITIALIZE_VIDEO', channel, data)

@celery.task
def post_new_comment(context):
    thread_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    comment = None
    video = Video.objects.get(video_id=video_id)

    if thread_data.get('username', None):
        user = auth.models.User.objects.get(username=thread_data['username'])
    else:
        user = context.get('user', None)

    if thread_data:
        comment_form = MPTTCommentForm(video, data=thread_data)
        if comment_form.is_valid():
            data = comment_form.get_comment_create_data()
            data['user'] = user
            comment = MPTTComment(**data)
            comment.save()
        else:
            logger = post_new_comment.get_logger()
            logger.info(comment_form._errors)

    if comment:
        return_data = dict()
        return_data['heatmap'] = video.heatmap()
        return_data['channel'] = channel

        if not comment.parent:
            action.send(user, verb='commented on', action_object=comment, target=video)

            threadSerializer = MPTTCommentSerializer(comment, context={ 'user': user })
            threadSerialized = JSONRenderer().render(threadSerializer.data)
            return_data['thread'] = json.loads(threadSerialized)
        else:
            action.send(user, verb='replied to comment', action_object=comment.parent, target=video)

            # Send a notification to the thread's owner that someone has replied to their comment.
            if comment.parent.user.id != user.id:
                user_channel = '/framebuzz/%s/user/%s' % (video.video_id, comment.parent.user.username)
                notification = { 'message': 'You have 1 new reply!', 'objectType': 'reply', 'objectId': comment.id }
                message = construct_message('FB_USER_NOTIFICATION', user_channel, notification)
                _send_to_channel.delay(channel = user_channel, message = message)

                if comment.parent.user.email:
                    send_templated_mail(
                        template_name='reply-notification',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[comment.parent.user.email],
                        context={
                            'comment': comment,
                            'site': Site.objects.get_current()
                        })

            replySerializer = MPTTCommentReplySerializer(comment, context={ 'user': user })
            replySerialized = JSONRenderer().render(replySerializer.data)
            return_data['reply'] = json.loads(replySerialized)
        
        return construct_message('FB_POST_NEW_COMMENT', channel, return_data)

@celery.task
def add_comment_action(context):
    thread_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)
    video_id = context.get('video_id', None)
    video = Video.objects.get(video_id=video_id)
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
                    user_channel = '/framebuzz/%s/user/%s' % (video.video_id, thread.user.username)
                    message_text = '%s is now following you!' % user.username
                    notification = { 'message': message_text, 'objectType': 'follow', 'objectId': None }
                    message = construct_message('FB_USER_NOTIFICATION', user_channel, notification)
                    _send_to_channel.delay(channel = user_channel, message = message)

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
            is_favorite = Action.objects.actor(user, verb='added to favorites', action_object_object_id=thread.id)

            if is_favorite:
                action_name = 'removed_favorite'
                action.send(user, verb='removed from favorites', action_object=thread, target=video)
                is_favorite.delete()
            else:
                action_name = 'added_favorite'
                action.send(user, verb='added to favorites', action_object=thread, target=video)

                if thread.user.id != user.id and thread.user.email:
                    user_channel = '/framebuzz/%s/user/%s' % (video.video_id, thread.user.username)
                    message_text = '%s added your comment to favorites!' % user.username
                    notification = { 'message': message_text, 'objectType': 'favorite', 'objectId': None }
                    message = construct_message('FB_USER_NOTIFICATION', user_channel, notification)
                    _send_to_channel.delay(channel = user_channel, message = message)

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
                comment = thread,
                user = user,
                flag = CommentFlag.SUGGEST_REMOVAL
            )

            if created:
                action_name = 'flagged_comment'
                action.send(user, verb='flagged comment', action_object=thread, target=video)
            else:
                action_name = 'unflagged_comment'
                action.send(user, verb='unflagged comment', action_object=thread, target=video)
                commentFlag.delete()
        else:
            pass

        updatedThread = MPTTComment.objects.get(id=thread_data.get('threadId'))
        returnThread = updatedThread if updatedThread.parent is None else updatedThread.parent

        threadSerializer = MPTTCommentSerializer(returnThread, context={ 'user': user })
        threadSerialized = JSONRenderer().render(threadSerializer.data)

        return_data = { 'action': action_name, 'thread': json.loads(threadSerialized) }
        return construct_message('FB_COMMENT_ACTION', channel, return_data)


@celery.task()
def toggle_user_follow(context):
    thread_data = context.get(DATA_KEY, None)
    user = context.get('user', None)
    video_id = context.get('video_id', None)

    if thread_data.get('user_to_toggle', None):
        user_to_toggle = auth.models.User.objects.get(username=thread_data['user_to_toggle'])

        check_following = Follow.objects.is_following(user, user_to_toggle)
        if check_following:
            unfollow(user, user_to_toggle)
        else:
            follow(user, user_to_toggle)

            if user_to_toggle.id != user.id and user_to_toggle.email:
                user_channel = '/framebuzz/%s/user/%s' % (video_id, user_to_toggle.username)
                message_text = '%s is now following you!' % user.username
                notification = { 'message': message_text, 'objectType': 'follow', 'objectId': None }
                message = construct_message('FB_USER_NOTIFICATION', user_channel, notification)
                _send_to_channel.delay(channel = user_channel, message = message)

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


@celery.task(ignore_result=True)
def add_player_action(context):
    player_data = context.get(DATA_KEY, None)
    player_action = player_data.get('action', None)
    video_id = context.get('video_id', None)
    video = Video.objects.get(video_id=video_id)
    verb = None

    if player_data.get('username', None):
        user = auth.models.User.objects.get(username=player_data['username'])
    else:
        user = context.get('user', None)

    if player_action == 'player_playing':
        verb = 'played video'
    elif player_action == 'player_paused':
        verb = 'paused video'
    else:
        pass

    if verb:
        action.send(user, verb=verb, action_object=video, target=None, time=float(player_data.get('time')))


@celery.task
def get_activity_stream(context):
    context_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    valid_verbs = ['started following', 'added to favorites', 'replied to comment', 'added video to library']
    last_login_minus_day = user.last_login - datetime.timedelta(days=1)
    user_activity_stream = Action.objects.filter(verb__in=valid_verbs, timestamp__gte = last_login_minus_day)

    stream_data = list()
    for activity in user_activity_stream:
        if activity.action_object is not None and activity.actor.id != user.id:
            if activity.action_object_content_type.model == 'mpttcomment' and activity.action_object.user.id == user.id:
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

    return_data = { 'activities': stream_data }
    return construct_message('FB_ACTIVITY_STREAM', channel, return_data)


@celery.task
def get_user_profile(context):
    context_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)
    current_user = context.get('current_user', None)
    user = auth.models.User.objects.get(username=context_data['username'])

    if not current_user:
        current_user = context.get('user', None)

    favorite_comment_ids = [action.action_object_object_id for action in Action.objects.favorite_comments_stream(user)]
    favorite_comments = MPTTComment.objects.filter(id__in=favorite_comment_ids)

    total_comments = MPTTComment.objects.filter(user=user)
    user_followers = followers(user)
    user_following = following(user)

    userSerializer = UserSerializer(user)
    userSerialized = JSONRenderer().render(userSerializer.data)

    favoritesSerializer = MPTTCommentSerializer(favorite_comments, context={ 'user': user })
    favoritesSerialized = JSONRenderer().render(favoritesSerializer.data)

    commentsSerializer = MPTTCommentSerializer(total_comments, context={ 'user': user })
    commentsSerialized = JSONRenderer().render(commentsSerializer.data)

    followersSerializer = UserSerializer(user_followers)
    followersSerialized = JSONRenderer().render(followersSerializer.data)

    followingSerializer = UserSerializer(user_following)
    followingSerialized = JSONRenderer().render(followingSerializer.data)

    if current_user and not isinstance(current_user, auth.models.AnonymousUser):
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
    video = Video.objects.get(video_id=video_id)
    share_with_email = context_data.get('shareWithEmail', None)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    if share_with_email:
        send_templated_mail(
            template_name='share-email',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[share_with_email],
            context={
                'shared_by': user,
                'video': video,
                'site': Site.objects.get_current()
            })

@celery.task
def add_to_library(context):
    context_data = context.get(DATA_KEY, None)
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    video = Video.objects.get(video_id=video_id)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    user_video, created = UserVideo.objects.get_or_create(video=video, user=user)
    
    if not created:
        old_action = Action.objects.actor(user, verb='added video to library', action_object_object_id=video.id)
        old_action.delete()
        user_video.delete()
        message = 'Video removed from library.'
    else:
        action.send(user, verb='added video to library', action_object=video, target=user_video)
        message = 'Video added to library.'

    userSerializer = UserSerializer(user, context={ 'video': video })
    userSerialized = JSONRenderer().render(userSerializer.data)
    return_data = {
        'message': message,
        'user': json.loads(userSerialized)
    }
    return construct_message('FB_ADD_TO_LIBRARY', channel, return_data)