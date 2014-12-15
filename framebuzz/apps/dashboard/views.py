from django.conf import settings
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from actstream.models import Action
from templated_email import send_templated_mail

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
    latest_videos = _get_videos(username)[:3]
    return render_to_response('dashboard/home.html', {
        'latest_videos': latest_videos
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


@require_dashboard
def change_video_notifications(request, slug):
    try:
        video = Video.objects.get(slug=slug)

        if request.method == 'POST':
            emails = request.POST.get('notify_emails', None)
            video.notify_emails = emails
            video.save()

            if video.notify_emails:
                send_to = video.notify_emails.split(',')

                send_templated_mail(
                    template_name='share-email',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=send_to,
                    context={
                        'shared_by': request.user,
                        'video': video,
                        'site': Site.objects.get_current()
                    })
            return HttpResponse('ok')
    except:
        return HttpResponse('error')
    return HttpResponse('error')


@require_dashboard
def delete_video(request, slug):
    try:
        video = Video.objects.get(slug=slug)
        user_video = UserVideo.objects.filter(
            user=request.user,
            video=video)
        user_video.delete()

        return HttpResponse('ok')
    except:
        return HttpResponse('error')


@require_dashboard
def dashboard_uploads(request, username):
    return render_to_response('dashboard/uploads.html', {
    }, context_instance=RequestContext(request))
