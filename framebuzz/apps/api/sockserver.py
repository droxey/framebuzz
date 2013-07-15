import django
import json
import tornadoredis
import tornado.gen

from celery import chain
from framebuzz.apps.api import tasks, EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY
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
        Pass it on to Celery as these requests may generate
        large Django queries and we don't want to block the server.       
        """
        json_message = json.loads(msg)
        event_type = json_message.get(EVENT_TYPE_KEY, None)
        channel = json_message.get(CHANNEL_KEY, None)
        data = json_message.get(DATA_KEY, None)

        if event_type and channel:
            if event_type == 'FB_INITIALIZE_VIDEO':
                self.video_channel = channel
                self.listen()

                video_id = self.video_channel.lstrip('/framebuzz/video/').rstrip('/')
                session_key = self.session_channel.lstrip('/framebuzz/session/').rstrip('/')
                
                test = tasks.get_user_by_session_key.s(session_key=session_key, extra_context={'video_id': video_id, 'outbound_channel': self.session_channel}) | tasks.initialize_video_player.s() | tasks.message_outbound.s()
                test.apply_async()
            elif event_type == 'FB_POST_NEW_THREAD':
                pass
            else:
                pass
        
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