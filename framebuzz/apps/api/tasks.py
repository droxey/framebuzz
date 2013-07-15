import celery
import json
import redis

from django.conf import settings
from django.contrib import auth
from django.contrib.contenttypes.models import ContentType
from django.utils import importlib
from rest_framework.renderers import JSONRenderer

from framebuzz.apps.api import EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY, TIMELINE_BLOCKS, SIGNIFICANCE_FACTOR
from framebuzz.apps.api.forms import MPTTCommentForm
from framebuzz.apps.api.models import MPTTComment, Video
from framebuzz.apps.api.serializers import VideoSerializer, MPTTCommentSerializer, UserSerializer
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
    
    logger.info('Running message_outbound with the following parameters:')
    logger.info('EventType: %s | Channel: %s | Context: %s' % (event_type, channel, context))

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    response = json.dumps(message)
    r.publish(channel, response)


@celery.task
def get_user_by_session_key(session_key, extra_context=None):
    logger = get_user_by_session_key.get_logger()
    logger.info('Running get_user_by_session_key with the following parameters:')
    logger.info('Session Key: %s | Extra Context: %s' % (session_key, extra_context))
    
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
    rank_per_block = list()
    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    user = context.get('user', None)

    

    logger.info('Running initialize_video_player with the following parameters:')
    logger.info('Video ID: %s | Channel: %s' % (video_id, channel))

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

        if block == 0:
            parents = comments_in_block.filter(parent=None).values_list('id')
            parent_list = [x[0] for x in parents]
            children = comments.filter(parent__id__in=parent_list)
            finalCount = children.count() + parents.count()

        if rank_1 > finalCount >= rank_2:
            class_name = 'rank-1'
        elif rank_2 > finalCount >= rank_3:
            class_name = 'rank-2'
        elif rank_3 > finalCount >= rank_4:
            class_name = 'rank-3'
        elif rank_4 > finalCount >= rank_5:
            class_name = 'rank-4'
        elif rank_5 > finalCount >= rank_6:
            class_name = 'rank-5'
        elif rank_6 > finalCount >= rank_7:
            class_name = 'rank-6'
        elif rank_7 > finalCount > 0:
            class_name = 'rank-7'
        else:
            class_name = 'rank-8'

        rank_per_block.append({'block': block, 'className': class_name})        
    
    # Get the first parent comment that occurs within .5 seconds.
    threads = comments.filter(parent=None, is_visible=True).order_by('-time')
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
        userSerializer = UserSerializer(user)
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
def post_new_thread(context):
    logger = post_new_thread.get_logger()
    thread_data = context.get(DATA_KEY, None)
    comment = None

    video_id = context.get('video_id', None)
    channel = context.get('outbound_channel', None)
    user = context.get('user', None)

    if thread_data:
        video = Video.objects.get(video_id=video_id)

        comment_form = MPTTCommentForm(video, data=thread_data)
        if comment_form.is_valid():
            data = comment_form.get_comment_create_data()
            data['user'] = user
            comment = MPTTComment(**data)
            comment.save()


    if comment:
        threadSerializer = MPTTCommentSerializer(comment, context={ 'user': user })
        threadSerialized = JSONRenderer().render(threadSerializer.data)
        
        outbound_message = dict()
        outbound_message[EVENT_TYPE_KEY] = 'FB_POST_NEW_THREAD'
        outbound_message[CHANNEL_KEY] = channel
        outbound_message[DATA_KEY] = { 'thread': json.loads(threadSerialized) }
        
        return outbound_message
