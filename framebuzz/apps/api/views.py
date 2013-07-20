import json

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.clickjacking import xframe_options_exempt

from allauth.account.forms import SignupForm, LoginForm
from rest_framework.renderers import JSONRenderer

from framebuzz.apps.api import EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY
from framebuzz.apps.api.backends.youtube import get_or_create_video
from framebuzz.apps.api.serializers import UserSerializer
from framebuzz.apps.api.tasks import message_outbound


@xframe_options_exempt
def video_embed(request, video_id):
    video, created = get_or_create_video(video_id)

    return render_to_response('player/video_embed.html',
    {
        'close_window': request.GET.get('close', None),
        'video': video,
        'socket_port': settings.SOCKJS_PORT,
        'socket_channel': settings.SOCKJS_CHANNEL,
        'user_channel': '/framebuzz/session/%s' % request.session.session_key
    },
    context_instance=RequestContext(request))

@xframe_options_exempt
def video_login(request, video_id):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    video, created = get_or_create_video(video_id)
    login_success = False
    outbound_message = dict()
    outbound_message[DATA_KEY] = {}
    form = LoginForm(data=json.loads(request.raw_post_data))

    if form.is_valid():
        user = form.user
        form.login(request)
        login_success = True

        userSerializer = UserSerializer(user)
        userSerialized = JSONRenderer().render(userSerializer.data)
        outbound_message[DATA_KEY]['user'] = json.loads(userSerialized)
    else:
        outbound_message[DATA_KEY]['errors'] = form.errors
    
    outbound_message[EVENT_TYPE_KEY] = 'FB_LOGIN'
    outbound_message[CHANNEL_KEY] = '/framebuzz/session/%s' % request.session.session_key
    outbound_message[DATA_KEY]['login_success'] = login_success

    return HttpResponse(json.dumps(outbound_message), content_type="application/json")

@xframe_options_exempt
def video_logout(request, video_id):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    video, created = get_or_create_video(video_id)

    pass

@xframe_options_exempt
def video_signup(request, video_id):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    video, created = get_or_create_video(video_id)

    pass