import json

from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import logout
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt

from actstream import action
from allauth.account.forms import SignupForm, LoginForm
from allauth.account.utils import perform_login
from rest_framework.renderers import JSONRenderer

from framebuzz.apps.api import EVENT_TYPE_KEY, CHANNEL_KEY, DATA_KEY
from framebuzz.apps.api.backends.youtube import get_or_create_video
from framebuzz.apps.api.serializers import UserSerializer
from framebuzz.apps.api.utils import errors_to_json
from framebuzz.apps.api.models import PrivateSession


ITAG_MP4 = 18
ITAG_WEBM = 43


def video_test(request, slug, size="small"):
    video, created = get_or_create_video(slug)
    if size == 'small':
        embed_code = video.tumblr_embed_code
        height = 326
        width = 580
    elif size == 'large':
        embed_code == video.large_embed_code
        height = 445
        width = 700
    else:
        embed_code = video.embed_code
        height = 360
        width = 640
    return render_to_response('player/test.html', {
        'video': video,
        'embed': embed_code,
        'size': size,
        'height': height,
        'width': width,
    }, context_instance=RequestContext(request))


@xframe_options_exempt
def video_embed(request, slug, convo_slug=None, control_sync=False):
    try:
        v, created = get_or_create_video(slug)
        next_url = '%s?close=true' % reverse('video-embed', args=(v.slug,))
        user_channel = '/framebuzz/session/%s' % request.session.session_key
        start_private_viewing = convo_slug is None and control_sync is True
        private_viewing_enabled = request.user.is_authenticated() \
            and request.user.get_profile().dashboard_enabled \
            and control_sync is False
        is_hosting_viewing = False
        is_synchronized = False

        # Having a logout button does funky things when we're on our
        # own site. Hide it if we're coming from framebuzz.com.
        site = Site.objects.get_current()
        ref = request.META.get('HTTP_REFERER', None)
        viewing_on_fbz = ref and site.domain in ref

        # Get uploaded video url, or youtube url, alternately.
        mp4_url = v.get_video_url(ITAG_MP4)
        webm_url = v.get_video_url(ITAG_WEBM)

        # Track that the user viewed this video.
        if request.user.is_authenticated():
            action.send(request.user, verb='viewed video', action_object=v)

        # Handle private conversations and syncronized sessions.
        if convo_slug:
            private_session = PrivateSession.objects.get(slug=convo_slug)
            if private_session.is_synchronized:
                is_hosting_viewing = request.user.is_authenticated() \
                    and private_session.owner.pk == request.user.pk
            is_synchronized = private_session.is_synchronized
        return render_to_response('player/video_embed.html', {
            'debug': settings.DEBUG,
            'viewing_on_fbz': viewing_on_fbz,
            'close_window': request.GET.get('close', None),
            'start_private_viewing': start_private_viewing,
            'private_viewing_enabled': private_viewing_enabled,
            'is_hosting_viewing': is_hosting_viewing,
            'is_synchronized': is_synchronized,
            'video': v,
            'socket_port': settings.SOCKJS_PORT,
            'socket_channel': settings.SOCKJS_CHANNEL,
            'user_channel': user_channel,
            'is_authenticated': request.user.is_authenticated(),
            'next_url': next_url,
            'mp4_url': mp4_url,
            'webm_url': webm_url,
            'convo_slug': convo_slug,
            'ravenjs_dsn': settings.RAVENJS_DSN or None,
        }, context_instance=RequestContext(request))
    except TypeError:
        return HttpResponseRedirect(reverse('video-embed-error',
                                            args=(v.slug,)))


@xframe_options_exempt
def video_embed_error(request, slug):
    return render_to_response('player/error_player.html', {
        'video_id': slug,
    }, context_instance=RequestContext(request))


@xframe_options_exempt
@ensure_csrf_cookie
def video_login(request, slug):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    video, created = get_or_create_video(slug)
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
        outbound_message[DATA_KEY]['share_url'] = reverse('profiles-share',
                                                          args=[user.username,
                                                                slug, ])
    else:
        outbound_message[DATA_KEY]['errors'] = \
            json.loads(errors_to_json(form.errors))

    outbound_message[EVENT_TYPE_KEY] = 'FB_LOGIN'
    outbound_message[CHANNEL_KEY] = \
        '/framebuzz/session/%s' % request.session.session_key
    outbound_message[DATA_KEY]['login_success'] = login_success

    return HttpResponse(json.dumps(outbound_message),
                        content_type="application/json")


@xframe_options_exempt
@csrf_exempt
def video_logout(request, slug):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    logout(request)
    share_url = reverse('video-share', args=[slug, ])
    context = {'logged_out': True, 'share_url': share_url}

    return HttpResponse(json.dumps(context),
                        content_type="application/json")


@xframe_options_exempt
@ensure_csrf_cookie
def video_signup(request, slug):
    if not request.method == 'POST':
        raise Exception('This view is meant to be called via a POST request.')

    video, created = get_or_create_video(slug)
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
        outbound_message[DATA_KEY]['share_url'] = reverse('profiles-share',
                                                          args=[user.username,
                                                                slug, ])
    else:
        outbound_message[DATA_KEY]['errors'] = \
            json.loads(errors_to_json(form.errors))

    outbound_message[EVENT_TYPE_KEY] = 'FB_SIGNUP'
    outbound_message[CHANNEL_KEY] = \
        '/framebuzz/session/%s' % request.session.session_key
    outbound_message[DATA_KEY]['login_success'] = login_success

    return HttpResponse(json.dumps(outbound_message),
                        content_type="application/json")
