import django
import tornadoredis

from sockjs.tornado import SockJSConnection
from framebuzz.apps.api import tasks


CONNECTION_POOL = tornadoredis.ConnectionPool(max_connections=500,
                                              wait_for_available=True)


class ConnectionHandler(SockJSConnection):
    """
    Our sockjs connection class.
    sockjs-tornado will create new a instance for every connected client.
    """

    def __init__(self, *args, **kwargs):
        """
        Create a Redis connection for each client.
        """
        super(ConnectionHandler, self).__init__(*args, **kwargs)
        self.client = tornadoredis.Client(connection_pool=CONNECTION_POOL)
        self.client.connect()
 
    def on_open(self, info):
        """
        Connect the user to the Redis server,
        and subscribe them to all the nessessary channels.
        """
        user = self.get_current_user(info)

        if not isinstance(user, django.contrib.auth.models.AnonymousUser):
            user_channel = '/framebuzz/user/%s' % user.username 
            self.client.subscribe(user_channel, self.on_chan_message)

        self.client.subscribe('/test_channel', self.on_chan_message)

    def on_message(self, msg):
        """
        This is a message broadcast from the client.
        Pass it on to Celery as these requests may generage
        large Django queries and we don't want to block the server.       
        """
        tasks.execute_player_task.delay(message=msg)
 
    def on_chan_message(self, msg):
        """
        This is a message broadcast from Redis.
        Send it to the client.
        """
        print msg
        self.send(msg)

    def get_current_user(self, info):
        engine = django.utils.importlib.import_module(django.conf.settings.SESSION_ENGINE)
        session_key = str(info.get_cookie(django.conf.settings.SESSION_COOKIE_NAME)).split('=')[1]

        class Dummy(object):
            pass

        django_request = Dummy()
        django_request.session = engine.SessionStore(session_key)
        user = django.contrib.auth.get_user(django_request)
        return user
 
    def on_close(self):
        self.client.unsubscribe('text_stream')
        self.client.disconnect()