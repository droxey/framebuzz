import celery
import json
import redis
import datetime

from django.contrib.contenttypes.models import ContentType
from rest_framework.renderers import JSONRenderer

from framebuzz.apps.api.event_types import PLAYER_EVENT_TYPES
from framebuzz.apps.api.models import MPTTComment, Video, Thumbnail
from framebuzz.apps.api.serializers import VideoSerializer, MPTTCommentSerializer
from framebuzz.apps.api.backends.youtube import get_or_create_video


TIMELINE_BLOCKS = 29
SIGNIFICANCE_FACTOR = 20.0


@celery.task
def parse_inbound_message(message):
    logger = parse_inbound_message.get_logger()
    logger.info('Running parse_inbound_message.')

    message_json = json.loads(message)
    event_type = message_json.get('eventType', None)
    channel = message_json.get('channel', None)

    if event_type:
        pass
    
    return 0


@celery.task
def construct_outbound_message(event_type, channel, context={}):
    """
    Constructs a JSON message and sends it to the 
    proper channel via Redis.

    Sample Message:
    {
        'eventType': 'subscribeToChannel',
        'channel': '/framebuzz/users/droxey',
        'data': {
            'subscribed': true
        },
        'timestamp': 2013-07-07T19:20:30.45+01:00
    }
    """

    logger = construct_outbound_message.get_logger()
    logger.info('Running construct_outbound_message with the following parameters:')
    logger.info('EventType: %s | Channel: %s | Context: %s' % (event_type, channel, context))

    outbound_message = dict()
    outbound_message['eventType'] = event_type
    outbound_message['channel'] = channel
    outbound_message['data'] = context
    outbound_message['timestamp'] = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S +00:00")
    
    response = json.dumps(outbound_message)
    logger.info('Outbound Message: %s' % response)

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    response = json.dumps(outbound_message)
    r.publish(channel, response)



@celery.task(ignore_result=True)
def initialize_video_player(video_id, channel):
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
    logger.info('Running initialize_video_player with the following parameters:')
    logger.info('Video ID: %s | Channel: %s' % (video_id, channel))

    count_per_block = dict()
    rank_per_block = list()

    # Get Video.
    video, created = get_or_create_video(video_id)
    seconds_per_block = float(video.duration) / float(TIMELINE_BLOCKS)
    content_type = ContentType.objects.get_for_model(video)
    comments = MPTTComment.objects.filter(content_type = content_type, object_pk = video.id)

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

        count_per_block[block] = { 'count': finalCount, 'start': start, 'end': end, }

    for block, comment in count_per_block.items():
        comment_count = float(comment.get('count'))

        if rank_1 > comment_count >= rank_2:
            class_name = 'rank-1'
        elif rank_2 > comment_count >= rank_3:
            class_name = 'rank-2'
        elif rank_3 > comment_count >= rank_4:
            class_name = 'rank-3'
        elif rank_4 > comment_count >= rank_5:
            class_name = 'rank-4'
        elif rank_5 > comment_count >= rank_6:
            class_name = 'rank-5'
        elif rank_6 > comment_count >= rank_7:
            class_name = 'rank-6'
        elif rank_7 > comment_count > 0:
            class_name = 'rank-7'
        else:
            class_name = 'rank-8'
        rank_per_block.append({'block': block, 'className': class_name})
    
    # Make sure comments are in order.
    threads = comments.filter(parent = None).order_by('-time')
    videoSerializer = VideoSerializer(video)
    videoSerialized = JSONRenderer().render(videoSerializer.data)
    threadsSerializer = MPTTCommentSerializer(threads)
    threadsSerialized = JSONRenderer().render(threadsSerializer.data)

    data = { }
    data['video'] = json.loads(videoSerialized)
    data['heatmap'] = rank_per_block
    data['threads'] = json.loads(threadsSerialized)
    
    outbound_message = dict()
    outbound_message['eventType'] = 'FB_INITIALIZE_VIDEO'
    outbound_message['channel'] = channel
    outbound_message['data'] = data
    outbound_message['timestamp'] = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S +00:00")
    
    response = json.dumps(outbound_message)
    logger.info('Outbound Message: %s' % response)

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    response = json.dumps(outbound_message)
    r.publish(channel, response)