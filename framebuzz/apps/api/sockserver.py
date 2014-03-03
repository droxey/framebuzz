import django
import json
import tornadoredis
import tornado.gen
import tornado.wsgi

from framebuzz.apps.api import tasks, EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY
from sockjs.tornado import SockJSConnection
from raven.contrib.tornado import SentryMixin

class ConnectionHandler(SentryMixin, SockJSConnection):
    """
    Our sockjs connection class.
    sockjs-tornado will create new a instance for every connected client.
    """

    def __init__(self, *args, **kwargs):
        super(ConnectionHandler, self).__init__(*args, **kwargs)
        self.username = None
        self.user_channel = None
        self.video_channel = None
        self.session_channel = None
        self.session_key = None
        self.request = None


    @tornado.gen.engine
    def listen(self):
        """
        Create a Redis connection for each client.
        """
        subscribe_tasks = list()
        self.client = tornadoredis.Client()
        self.client.connect()

        if self.session_channel:
            print 'user connected to channel: %s' % self.session_channel
            subscribe_tasks.append(tornado.gen.Task(self.client.subscribe, self.session_channel))

        if self.user_channel:
            print 'user connected to channel: %s' % self.user_channel
            subscribe_tasks.append(tornado.gen.Task(self.client.subscribe, self.user_channel))

        if self.video_channel:
            print 'user connected to channel: %s' % self.video_channel
            subscribe_tasks.append(tornado.gen.Task(self.client.subscribe, self.video_channel))

        yield subscribe_tasks
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
            task_chain = None

            if event_type == 'FB_INITIALIZE_VIDEO':
                video_id = channel.split('/')[3]
                private_session_key = data.get('private_session_key', None)

                self.session_channel = '/framebuzz/%s/session/%s' \
                    % (video_id, self.session_key)

                if self.username:
                    self.user_channel = '/framebuzz/%s/user/%s' \
                        % (video_id, self.username)

                # Filter based on private conversations.
                if private_session_key:
                    self.video_channel = '/framebuzz/%s/convo/%s' \
                        % (video_id, private_session_key)
                else:
                    self.video_channel = channel

                self.listen()

                task_chain = tasks.get_user_by_session_key.s(
                        session_key=self.session_key,
                        extra_context={
                            'video_id': video_id,
                            'outbound_channel': self.session_channel,
                            'data': data
                        }) \
                    | tasks.initialize_video_player.s() \
                    | tasks.message_outbound.s()
            else:
                video_id = self.video_channel.split('/')[3]

                if event_type == 'FB_POST_NEW_COMMENT':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'video_id': video_id,
                                'data': data,
                                'outbound_channel': self.video_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.post_new_comment.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_COMMENT_ACTION':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None),
                                'video_id': video_id
                            }) \
                        | tasks.add_comment_action.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_TOGGLE_FOLLOW':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None),
                                'video_id': video_id
                            }) \
                        | tasks.toggle_user_follow.s() \
                        | tasks.get_user_profile.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_PLAYER_ACTION':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'video_id': video_id,
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.add_player_action.s()
                elif event_type == 'FB_ACTIVITY_STREAM':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.get_activity_stream.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_USER_PROFILE':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.get_user_profile.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_EMAIL_SHARE':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'video_id': video_id,
                                'data': data,
                                'outbound_channel': self.session_channel
                            }) \
                        | tasks.email_share.s()
                elif event_type == 'FB_ADD_TO_LIBRARY':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'video_id': video_id,
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.add_to_library.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_SEARCH_USERS':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'video_id': video_id,
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.search_user_list.s() \
                        | tasks.message_outbound.s()
                elif event_type == 'FB_START_PRIVATE_CONVO':
                    task_chain = tasks.get_user_by_session_key.s(
                            session_key=self.session_key,
                            extra_context={
                                'video_id': video_id,
                                'data': data,
                                'outbound_channel': self.session_channel,
                                'username': data.get('username', None)
                            }) \
                        | tasks.start_private_convo.s() \
                        | tasks.message_outbound.s()
                else:
                    pass

            if task_chain:
                task_chain.apply_async()

    def on_chan_message(self, msg):
        """
        This is a message broadcast from Redis.
        Send it to the client.
        """
        if msg.kind == 'message':
            self.send(msg.body)

    def get_request(self):
        engine = django.utils.importlib.import_module(django.conf.settings.SESSION_ENGINE)

        class DummyRequest(object):
            pass

        django_request = DummyRequest()
        django_request.session = engine.SessionStore(self.session_key)
        return django_request

    def get_current_user(self, info):
        """
        Grabs the current Django user from the Redis backend.
        """
        self.session_key = str(info.get_cookie(django.conf.settings.SESSION_COOKIE_NAME)).split('=')[1]
        django_request = self.get_request()
        user = django.contrib.auth.get_user(django_request)

        if not isinstance(user, django.contrib.auth.models.AnonymousUser):
            self.username = user.username

        return user

    def on_close(self):
        """
        Runs when the user gets disconnected.
        """
        self.client.disconnect()
