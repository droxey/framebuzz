import celery
import redis

@celery.task
def execute_player_task(message):
    logger = execute_player_task.get_logger()
    logger.info('Running execute_player_task.')

    print message

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    channel = '/test_channel'
    response = message
    r.publish(channel, response)
    
    return 1