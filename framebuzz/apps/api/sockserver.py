import redis

from sockjs.tornado import SockJSConnection


class PlayerConnection(SockJSConnection):
    def on_open(self, request):
        """
        Connect the user to the Redis server,
        and subscribe them to all the nessessary channels.
        """
        #r = redis.StrictRedis(host='localhost', port=6379, db=0)
        print 'open!'
        pass

    def on_message(self, message):
        """
        Depending upon the PlayerEvent enum, save the activity,
        then delegate the message to the proper function.
        """
        pass

    def on_close(self):
        """
        Unsubscribe from Redis.
        """
        pass