import json

from django.core.urlresolvers import reverse
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext

from actstream.models import Action

from framebuzz.apps.api.models import UserProfile, Video, UserVideo
from framebuzz.apps.profiles.forms import AddVideoForm, UploadVideoForm
from framebuzz.apps.dashboard.decorators import require_dashboard

VALID_FEED_VERBS = ['commented on', 'replied to comment',
                    'added video to library', ]


def _get_pending_uploads(username):
    pending_uploads = Video.objects.exclude(
        Q(Q(fp_url=None) | Q(job_id=None))).filter(
        added_by__username=username, processing=True)
    return pending_uploads


def _get_videos(username):
    user_videos = UserVideo.objects.filter(user__username=username)
    videos = [uv.video for uv in user_videos]
    return videos


@require_dashboard
def dashboard_home(request, username):
    videos = [v.id for v in _get_videos(username)]
    activities = Action.objects.filter(Q(
        Q(action_object_object_id__in=videos) |
        Q(target_object_id__in=videos)),
        Q(verb__in=VALID_FEED_VERBS)
    ).order_by('-timestamp')[:20]

    return render_to_response('dashboard/home.html', {
        'activities': activities,
    }, context_instance=RequestContext(request))


@require_dashboard
def dashboard_profile(request, username):
    return render_to_response('dashboard/profile.html', {
    }, context_instance=RequestContext(request))


@require_dashboard
def dashboard_videos(request, username):
    videos = _get_videos(username)

    return render_to_response('dashboard/videos.html', {
        'videos': videos,
    }, context_instance=RequestContext(request))


@require_dashboard
def dashboard_comments(request, username):
    return render_to_response('dashboard/comments.html', {
    }, context_instance=RequestContext(request))


@require_dashboard
def dashboard_settings(request, username):
    return render_to_response('dashboard/settings.html', {
    }, context_instance=RequestContext(request))


@require_dashboard
def video_details(request, slug):
    video = Video.objects.get(slug=slug)
    return render_to_response('dashboard/snippets/video_details.html', {
        'video': video,
    }, context_instance=RequestContext(request))


def dashboard_login(request):
    return render_to_response('dashboard/login.html', {
    }, context_instance=RequestContext(request))
