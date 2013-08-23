import json
import subprocess
import urllib

from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth import logout
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.clickjacking import xframe_options_exempt

from actstream import action
from allauth.account.forms import SignupForm, LoginForm
from allauth.account.utils import perform_login
from rest_framework.renderers import JSONRenderer

from framebuzz.apps.api import EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY
from framebuzz.apps.api.backends.youtube import get_or_create_video
from framebuzz.apps.api.serializers import UserSerializer


def video_share(request, video_id):
    video, created = get_or_create_video(video_id)

    return render_to_response('profiles/share.html',
    {
        'video': video,
    },
    context_instance=RequestContext(request))

@xframe_options_exempt
def video_embed(request, video_id):
    video, created = get_or_create_video(video_id)
    next_url = '%s?close=true' % reverse('video-embed', args=(video.video_id,))

    try:
        get_mp4 = 'youtube-dl -f 18 http://www.youtube.com/watch?v=%s --get-url' % video.video_id
        mp4_url = subprocess.check_output(get_mp4, shell=True)
    except:
        mp4_url = 'http://www.ytapi.com/api/%s/direct/18/' % video_id

    try:
        get_webm = 'youtube-dl -f 43 http://www.youtube.com/watch?v=%s --get-url' % video.video_id
        webm_url = subprocess.check_output(get_webm, shell=True)
    except:
        webm_url = 'http://www.ytapi.com/api/%s/direct/44/' % video_id

    if request.user.is_authenticated():
        # Send a signal that the user has viewed this video.
        action.send(request.user, verb='viewed video', action_object=video)

    return render_to_response('player/video_embed.html',
    {
        'close_window': request.GET.get('close', None),
        'video': video,
        'socket_port': settings.SOCKJS_PORT,
        'socket_channel': settings.SOCKJS_CHANNEL,
        'user_channel': '/framebuzz/session/%s' % request.session.session_key,
        'is_authenticated': request.user.is_authenticated(),
        'next_url': next_url,
        'mp4_url': mp4_url,
        'webm_url': webm_url,
    },
    context_instance=RequestContext(request))

def video_test(request, video_id):
    return render_to_response('player/video_test.html',
    {
        'video_id': video_id,
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

        action.send(user, verb='viewed video', action_object=video)

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

    logout(request)

    return HttpResponse(json.dumps({ 'logged_out': True }), content_type="application/json")

@xframe_options_exempt
def video_signup(request, video_id):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    video, created = get_or_create_video(video_id)
    login_success = False
    outbound_message = dict()
    outbound_message[DATA_KEY] = {}
    form = SignupForm(data=json.loads(request.raw_post_data))

    if form.is_valid():
        user = form.save(request)
        perform_login(request, user)
        login_success = True

        action.send(user, verb='registered account', action_object=video)
        action.send(user, verb='viewed video', action_object=video)

        userSerializer = UserSerializer(user)
        userSerialized = JSONRenderer().render(userSerializer.data)
        outbound_message[DATA_KEY]['user'] = json.loads(userSerialized)
    else:
        outbound_message[DATA_KEY]['errors'] = form.errors
    
    outbound_message[EVENT_TYPE_KEY] = 'FB_SIGNUP'
    outbound_message[CHANNEL_KEY] = '/framebuzz/session/%s' % request.session.session_key
    outbound_message[DATA_KEY]['login_success'] = login_success

    return HttpResponse(json.dumps(outbound_message), content_type="application/json")