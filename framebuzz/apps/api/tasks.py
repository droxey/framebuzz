import celery
import json
import tornadoredis
import datetime

CONNECTION_POOL = tornadoredis.ConnectionPool(max_connections=500,
                                              wait_for_available=True)

@celery.task
def parse_inbound_message(message):
    logger = parse_inbound_message.get_logger()
    logger.info('Running parse_inbound_message.')

    print message


    
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

    c = tornadoredis.Client(connection_pool=CONNECTION_POOL)
    c.connect()
    c.publish(channel, response)

    return response