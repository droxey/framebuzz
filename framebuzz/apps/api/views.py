from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.clickjacking import xframe_options_exempt

from framebuzz.apps.api.backends.youtube import get_or_create_video


@xframe_options_exempt
def video_embed(request, video_id):
    video, created = get_or_create_video(video_id)

    print request.user.is_authenticated()

    return render_to_response('player/video_embed.html',
    {
        'close_window': request.GET.get('close', None),
        'video': video,
        'socket_port': settings.SOCKJS_PORT,
        'socket_channel': settings.SOCKJS_CHANNEL,
        'user_channel': '/framebuzz/session/%s' % request.session.session_key
    },
    context_instance=RequestContext(request))