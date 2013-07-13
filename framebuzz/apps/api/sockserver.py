import django
import json
import tornadoredis
import tornado.gen

from framebuzz.apps.api import tasks
from framebuzz.apps.api.event_types import PLAYER_EVENT_TYPES
from sockjs.tornado import SockJSConnection

CONNECTION_POOL = tornadoredis.ConnectionPool(max_connections=500,
                                              wait_for_available=True)

class ConnectionHandler(SockJSConnection):
    """
    Our sockjs connection class.
    sockjs-tornado will create new a instance for every connected client.
    """

    def __init__(self, *args, **kwargs):
        super(ConnectionHandler, self).__init__(*args, **kwargs)
        self.user_channel = None
        self.video_channel = None
        self.session_channel = None
 
    
    @tornado.gen.engine
    def listen(self):
        """
        Create a Redis connection for each client.
        """
        self.client = tornadoredis.Client(connection_pool=CONNECTION_POOL)
        self.client.connect()

        if self.session_channel:
            yield tornado.gen.Task(self.client.subscribe, self.session_channel)

        if self.user_channel:
            yield tornado.gen.Task(self.client.subscribe, self.user_channel)

        if self.video_channel:
            yield tornado.gen.Task(self.client.subscribe, self.video_channel)

        self.client.listen(self.on_chan_message)


    def on_open(self, info):
        """
        Connect the user to the Redis server,
        and subscribe them to all the nessessary channels.
        """
        self.get_current_user(info)

    def on_message(self, msg):
        """
        This is a message broadcast from the client.
        Pass it on to Celery as these requests may generage
        large Django queries and we don't want to block the server.       
        """
        json_message = json.loads(msg)
        eventType = json_message.get('eventType', None)

        if eventType:
            if eventType == PLAYER_EVENT_TYPES[0]:
                self.video_channel = json_message.get('channel', None)
                if self.video_channel:
                    video_id = self.video_channel.lstrip('/framebuzz/video/').rstrip('/')
                    json_message['video_id'] = video_id
                    tasks.initialize_video_player.delay(video_id=video_id, channel=self.session_channel)
                    self.listen()
        else:
            tasks.parse_inbound_message.delay(message=msg)
        
    def on_chan_message(self, msg):
        """
        This is a message broadcast from Redis.
        Send it to the client.
        """
        if msg.kind == 'message':
            self.send(msg.body)

    def get_current_user(self, info):
        """
        Grabs the current Django user from the Redis backend.
        """
        engine = django.utils.importlib.import_module(django.conf.settings.SESSION_ENGINE)
        session_key = str(info.get_cookie(django.conf.settings.SESSION_COOKIE_NAME)).split('=')[1]
        self.session_channel = '/framebuzz/session/%s' % session_key 

        class Dummy(object):
            pass

        django_request = Dummy()
        django_request.session = engine.SessionStore(session_key)
        user = django.contrib.auth.get_user(django_request)

        if not isinstance(user, django.contrib.auth.models.AnonymousUser):
            self.user_channel = '/framebuzz/user/%s' % user.username 

        return user
 
    def on_close(self):
        """
        Runs when the user gets disconnected.
        """
        if self.client.subscribed:
            self.client.unsubscribe(self.session_channel)
            self.client.unsubscribe(self.user_channel)
            self.client.unsubscribe(self.video_channel)

            self.client.disconnect()