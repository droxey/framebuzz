import json

from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from actstream.models import Action

from framebuzz.apps.api.forms import MPTTCommentForm
from framebuzz.apps.api.models import Video, UserVideo, MPTTComment
from framebuzz.apps.dashboard.decorators import require_dashboard

VALID_FEED_VERBS = ['commented on', 'replied to comment',
                    'added video to library', ]


def _get_videos(username):
    user_videos = UserVideo.objects.filter(user__username=username)
    video_ids = [uv.video.id for uv in user_videos]
    videos = Video.objects.filter(id__in=video_ids).order_by('-added_on')
    return videos


@require_dashboard
def dashboard_home(request, username):
    return HttpResponseRedirect(reverse('dashboard-videos',
                                args=[username, ]))
    # videos = [v.id for v in _get_videos(username)]
    # activities = Action.objects.filter(Q(
    #     Q(action_object_object_id__in=videos) |
    #     Q(target_object_id__in=videos)),
    #     Q(verb__in=VALID_FEED_VERBS)
    # ).order_by('-timestamp')[:20]

    # # most_played = Action.objects.filter(
    # #     verb='viewed video',
    # #     action_object_object_id__in=videos
    # #     ).values('action_object_object_id') \
    # #     .annotate(views=Count('id')) \
    # #     .order_by('-views')

    # # if len(most_played) > 0:
    # #     most_played = most_played[0]

    # # total_views = Action.objects.filter(
    # #     verb='viewed video',
    # #     action_object_object_id__in=videos
    # # ).aggregate(num_views=Count('id'))

    # # most_played_video = Video.objects.filter(
    # #     id=most_played['action_object_object_id'])[0]
    # # print most_played_video.default_thumbnail

    # return render_to_response('dashboard/home.html', {
    #     'activities': activities,
    #     # 'most_played': {
    #     #     'total': total_views.get('num_views'),
    #     #     'current': most_played.get('views'),
    #     #     'video': most_played_video,
    #     # },
    #     'videos': _get_videos(username),
    # }, context_instance=RequestContext(request))


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

    valid_verbs = ['commented on', 'replied to comment']
    actions = Action.objects.filter(verb__in=valid_verbs,
                                    target_object_id=video.id)

    action_ids = [a.actor_object_id for a in actions]
    commenters = User.objects.filter(id__in=action_ids)
    plays = len(Action.objects.filter(verb='played video',
                                      action_object_object_id=video.id))

    unread_comments = MPTTComment.objects.filter(
        Q(object_pk=video.id),
        Q(is_public=True),
        Q(is_removed=False),
        Q(Q(parent=None) | Q(parent__user=request.user))).order_by('time')

    return render_to_response('dashboard/snippets/video_details.html', {
        'video': video,
        'commenters': commenters,
        'plays': plays,
        'unread_comments': unread_comments,
    }, context_instance=RequestContext(request))


def dashboard_login(request):
    return render_to_response('dashboard/login.html', {
    }, context_instance=RequestContext(request))


@require_dashboard
def post_comment_reply(request, slug):
    comment = None
    video = Video.objects.get(slug=slug)

    if request.method == 'POST':
        comment_form = MPTTCommentForm(video, data=request.POST)

        if comment_form.is_valid():
            data = comment_form.get_comment_create_data()
            data['user'] = request.user
            comment = MPTTComment(**data)
            comment.save()

            if comment.parent:
                comment.parent.is_read = True
                comment.parent.save()
        else:
            print comment_form.errors

    return render_to_response('dashboard/snippets/comments/list_item.html', {
        'com': comment.parent,
        'is_ajax_request': request.is_ajax(),
        'is_reply': True
    }, context_instance=RequestContext(request))


@require_dashboard
def mark_comment_read(request, comment_id):
    comment = MPTTComment.objects.get(id=comment_id)
    comment.is_read = True
    comment.save()

    return render_to_response('dashboard/snippets/comments/list_item.html', {
        'com': comment,
        'is_ajax_request': request.is_ajax(),
        'is_reply': False
    }, context_instance=RequestContext(request))


@require_dashboard
def delete_comment(request, comment_id):
    comment = MPTTComment.objects.get(id=comment_id)
    comment.is_removed = True
    comment.save()

    return HttpResponse(200)


@require_dashboard
def play_video(request, slug):
    video = Video.objects.get(slug=slug)

    return render_to_response('dashboard/snippets/play_video.html', {
        'video': video,
    }, context_instance=RequestContext(request))


@require_dashboard
def change_video_password(request, slug):
    try:
        video = Video.objects.get(slug=slug)

        if request.method == 'POST':
            password = request.POST.get('password', None)
            video.password = password
            video.save()
            return HttpResponse('ok')
    except:
        return HttpResponse('error')
    return HttpResponse('error')
