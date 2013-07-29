import celery
import datetime
import json
import redis

from django.conf import settings
from django.contrib import auth
from django.contrib.comments.models import CommentFlag
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.utils import importlib

from actstream import action
from actstream.models import Action, Follow, followers, following
from actstream.actions import follow, unfollow
from rest_framework.renderers import JSONRenderer
from templated_email import send_templated_mail

from framebuzz.apps.api import EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY, TIMELINE_BLOCKS, SIGNIFICANCE_FACTOR
from framebuzz.apps.api.forms import MPTTCommentForm
from framebuzz.apps.api.models import MPTTComment, Video, UserVideo
from framebuzz.apps.api.serializers import VideoSerializer, MPTTCommentSerializer, MPTTCommentReplySerializer, UserSerializer
from framebuzz.apps.api.backends.youtube import get_or_create_video


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
    logger = message_outbound.get_logger()
    
    event_type = message.get(EVENT_TYPE_KEY, None)
    channel = message.get(CHANNEL_KEY, None)
    context = message.get(DATA_KEY, None)

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    response = json.dumps(message)
    r.publish(channel, response)


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
    rank_per_block = list()
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    user = context.get('user', None)

    # Get Video.
    video, created = get_or_create_video(video_id)
    seconds_per_block = float(video.duration) / float(TIMELINE_BLOCKS)
    content_type = ContentType.objects.get_for_model(video)
    comments = MPTTComment.objects.filter(content_type=content_type, 
                                          object_pk = video.id, 
                                          is_removed=False)

    rank_1 = (float(comments.count()) + SIGNIFICANCE_FACTOR) / 3.0
    rank_2 = rank_1 - (rank_1 / 7.0)
    rank_3 = rank_2 - (rank_1 / 7.0)
    rank_4 = rank_3 - (rank_1 / 7.0)
    rank_5 = rank_4 - (rank_1 / 7.0)
    rank_6 = rank_5 - (rank_1 / 7.0)
    rank_7 = rank_6 - (rank_1 / 7.0)

    for block in range(0, TIMELINE_BLOCKS):
        start = float(block) * seconds_per_block
        end = start + seconds_per_block
        comments_in_block = comments.filter(time__gte=start, time__lt=end)
        finalCount = comments_in_block.count()

        if finalCount == 0:
            class_name = 'rank-8'
        elif finalCount > rank_1:
            class_name = 'rank-1'
        else:
            if rank_2 > finalCount >= rank_3:
                class_name = 'rank-2'
            elif rank_3 > finalCount >= rank_4:
                class_name = 'rank-3'
            elif rank_4 > finalCount >= rank_5:
                class_name = 'rank-4'
            elif rank_5 > finalCount >= rank_6:
                class_name = 'rank-5'
            elif rank_6 > finalCount >= rank_7:
                class_name = 'rank-6'
            else:
                class_name = 'rank-7'

        rank_per_block.append({'block': block, 'className': class_name})        
    
    threads = comments.filter(parent=None).order_by('-time')
    videoSerializer = VideoSerializer(video)
    videoSerialized = JSONRenderer().render(videoSerializer.data)
    threadsSerializer = MPTTCommentSerializer(threads, context={ 'user': user })
    threadsSerialized = JSONRenderer().render(threadsSerializer.data)

    data = { }
    data['video'] = json.loads(videoSerialized)
    data['heatmap'] = rank_per_block
    data['threads'] = json.loads(threadsSerialized)
    data['is_authenticated'] = isinstance(user, auth.models.AnonymousUser) is False

    if data['is_authenticated']:
        userSerializer = UserSerializer(user, context={ 'video': video })
        userSerialized = JSONRenderer().render(userSerializer.data)
        data['user'] = json.loads(userSerialized)
    else:
        data['user'] = {}

    outbound_message = dict()
    outbound_message[EVENT_TYPE_KEY] = 'FB_INITIALIZE_VIDEO'
    outbound_message[CHANNEL_KEY] = channel
    outbound_message[DATA_KEY] = data
    return outbound_message


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

    if comment:
        if not comment.parent:
            action.send(user, verb='commented on', action_object=video)

            threadSerializer = MPTTCommentSerializer(comment, context={ 'user': user })
            threadSerialized = JSONRenderer().render(threadSerializer.data)
            return_data = { 'thread': json.loads(threadSerialized) }
        else:
            action.send(user, verb='replied to comment', action_object=comment.parent, target=video)

            # Send a notification to the thread's owner that someone has replied to their comment.
            if comment.parent.user.id != user.id and comment.parent.user.email:
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
            return_data = { 'reply': json.loads(replySerialized) }
        
        outbound_message = dict()
        outbound_message[EVENT_TYPE_KEY] = 'FB_POST_NEW_COMMENT'
        outbound_message[CHANNEL_KEY] = channel
        outbound_message[DATA_KEY] = return_data
        
        return outbound_message


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

    outbound_message = dict()
    outbound_message[EVENT_TYPE_KEY] = 'FB_COMMENT_ACTION'
    outbound_message[CHANNEL_KEY] = channel

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
                    send_templated_mail(
                        template_name='following-notification',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[thread.user.email],
                        context={
                            'follower': user,
                            'site': Site.objects.get_current()
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
                    send_templated_mail(
                        template_name='favorites-notification',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[thread.user.email],
                        context={
                            'comment': thread,
                            'site': Site.objects.get_current()
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

        outbound_message[DATA_KEY] = { 'action': action_name, 'thread': json.loads(threadSerialized) }
        return outbound_message

@celery.task
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

    valid_verbs = ['started following', 'added to favorites', 'removed from favorites', 'stopped following', 'replied to comment', 'added video to library']
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
                    'target_object': activity.target.__unicode__()
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

    outbound_message = dict()
    outbound_message[EVENT_TYPE_KEY] = 'FB_ACTIVITY_STREAM'
    outbound_message[CHANNEL_KEY] = channel
    outbound_message[DATA_KEY] = { 'activities': stream_data }

    return outbound_message

@celery.task
def get_user_profile(context):
    context_data = context.get(DATA_KEY, None)
    channel = context.get('outbound_channel', None)

    if context_data.get('username', None):
        user = auth.models.User.objects.get(username=context_data['username'])
    else:
        user = context.get('user', None)

    favorite_comments = [action.action_object for action in Action.objects.favorite_comments_stream(user) if action.action_object is not None]
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

    outbound_message = dict()
    outbound_message[EVENT_TYPE_KEY] = 'FB_USER_PROFILE'
    outbound_message[CHANNEL_KEY] = channel
    outbound_message[DATA_KEY] = {
        'favorite_comments': len(favorite_comments),
        'total_comments': len(total_comments),
        'user_followers': len(user_followers),
        'user_following': len(user_following),
        'favorites_list': json.loads(favoritesSerialized),
        'comments_list': json.loads(commentsSerialized),
        'followers_list': json.loads(followersSerialized),
        'following_list': json.loads(followingSerialized),
        'user': json.loads(userSerialized)
    }

    return outbound_message


@celery.task
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
    pass

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

    outbound_message = dict()
    outbound_message[EVENT_TYPE_KEY] = 'FB_ADD_TO_LIBRARY'
    outbound_message[CHANNEL_KEY] = channel
    outbound_message[DATA_KEY] = {
        'message': message,
        'user': json.loads(userSerialized)
    }

    return outbound_message