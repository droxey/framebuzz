import json

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt

from actstream import action
from actstream.models import Action, followers, following
from pure_pagination import Paginator, PageNotAnInteger
from templated_email import send_templated_mail

from framebuzz.apps.api.models import MPTTComment, UserVideo, Video
from framebuzz.apps.api.backends.youtube import get_or_create_video
from framebuzz.apps.api.utils import errors_to_json, get_total_shares
from framebuzz.apps.profiles.forms import UserProfileForm, AddVideoForm


VALID_FEED_VERBS = ['commented on', 'started following', 'added to favorites',
                    'replied to comment', 'added video to library']


def get_profile_header(username):
    user = User.objects.get(username__iexact=username)
    actions = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [a.action_object_object_id for a in actions]
    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    profile_conversations = MPTTComment.objects.filter(user=user, parent=None)
    profile_followers = followers(user)
    profile_following = following(user)
    profile_library = UserVideo.objects.filter(user=user)
    ct = ContentType.objects.get(model='user')

    return {
        'profile_favorites': profile_favorites,
        'profile_conversations': profile_conversations,
        'profile_followers': profile_followers,
        'profile_following': profile_following,
        'profile_user': user,
        'profile_library': profile_library,
        'user_content_type': ct
    }


def video_share(request, username=None, video_id=None):
    video, created = get_or_create_video(video_id)
    context = dict()

    valid_verbs = ['commented on', 'replied to comment']
    actions = Action.objects.filter(verb__in=valid_verbs,
                                    target_object_id=video.id)
    commenters = [a.actor for a in actions]
    found_by = UserVideo.objects.filter(video=video).order_by('added_on')[:1]

    context['video'] = video
    context['is_share'] = True
    context['commenters'] = commenters
    context['path'] = request.path

    if len(found_by) > 0:
        context['found_by'] = found_by[0].user

    if username is not None:
        request.session['share'] = context
        return HttpResponseRedirect(
            reverse('profiles-home', args=[username, ]))
    else:
        template = 'marketing/share.html'
        context['shares'] = get_total_shares(request.path)
        return render_to_response(template,
                                  context,
                                  context_instance=RequestContext(request))


def logged_in(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(
            reverse('profiles-home', args=[request.user.username, ]))
    else:
        return HttpResponseRedirect(reverse('account_login'))


def home(request, username):
    context = get_profile_header(username)

    share_context = request.session.get('share', None)
    if share_context:
        share_context['shares'] = get_total_shares(share_context['path'])
        context.update(share_context)
        del request.session['share']

    return render_to_response('profiles/base.html',
                              context,
                              context_instance=RequestContext(request))


def activity(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    actions = Action.objects.filter(verb__in=VALID_FEED_VERBS,
                                    actor_object_id=user.id).order_by('-timestamp')
    p = Paginator(actions, 12, request=request)

    if request.is_ajax() and page > 1:
        template = 'profiles/snippets/item.html'
    else:
        template = 'profiles/snippets/activity.html'

    return render_to_response(template, {
                              'profile_user': user,
                              'page_obj': p.page(page),
                              }, context_instance=RequestContext(request))


def profile_followers(request, username):
    user = User.objects.get(username__iexact=username)
    user_followers = followers(user)
    profile_followers = dict()

    for followed_user in user_followers:
        latest_comments = MPTTComment.objects.filter(
            user=followed_user).order_by('-submit_date')[:1]
        profile_followers[followed_user.username] = {
            'user': followed_user,
            'comments': latest_comments,
        }

    ct = ContentType.objects.get(model='user')
    return render_to_response('profiles/snippets/followers.html', {
        'profile_user': user,
        'followers': profile_followers,
        'user_content_type': ct,
    }, context_instance=RequestContext(request))


def profile_following(request, username):
    user = User.objects.get(username__iexact=username)
    user_following = following(user)
    profile_following = dict()

    for following_user in user_following:
        latest_comments = MPTTComment.objects.filter(
            user=following_user).order_by('-submit_date')[:1]
        profile_following[following_user.username] = {
            'user': following_user,
            'comments': latest_comments,
        }

    ct = ContentType.objects.get(model='user')
    return render_to_response('profiles/snippets/following.html', {
        'profile_user': user,
        'following': profile_following,
        'user_content_type': ct,
    }, context_instance=RequestContext(request))


def feed(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_following = following(user)
    following_ids = [f.id for f in user_following]
    following_ids.append(user.id)

    feed = Action.objects.filter(verb__in=VALID_FEED_VERBS,
                                 action_object_object_id__in=following_ids
                                 ).order_by('-timestamp')
    p = Paginator(feed, 12, request=request)

    if request.is_ajax() and page > 1:
        template = 'profiles/snippets/item.html'
    else:
        template = 'profiles/snippets/feed.html'

    return render_to_response(template, {
        'profile_user': user,
        'page_obj': p.page(page),
    }, context_instance=RequestContext(request))


def conversations(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)
    conversations = MPTTComment.objects.filter(user=user, parent=None)

    favorites = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [int(f.action_object_object_id)for f in favorites]

    p = Paginator(conversations, 12, request=request)
    featured_video_ids = [uv.video.id for uv in user_videos if uv.is_featured]

    if request.is_ajax() and page > 1:
        template = 'profiles/snippets/video.html'
    else:
        template = 'profiles/snippets/conversations.html'

    return render_to_response(template, {
        'profile_user': user,
        'page_obj': p.page(page),
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': featured_video_ids,
        'favorite_comment_ids': favorite_comment_ids,
        'show_favorite_button': True,
        'error': "hasn't posted any comments yet!",
    }, context_instance=RequestContext(request))


def favorites(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)

    favorites = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [int(f.action_object_object_id) for f in favorites]

    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    p = Paginator(profile_favorites, 12, request=request)
    featured_video_ids = [uv.video.id for uv in user_videos if uv.is_featured]

    if request.is_ajax() and page > 1:
        template = 'profiles/snippets/video.html'
    else:
        template = 'profiles/snippets/favorites.html'

    return render_to_response(template, {
        'profile_user': user,
        'page_obj': p.page(page),
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': featured_video_ids,
        'favorite_comment_ids': favorite_comment_ids,
        'show_favorite_button': True,
        'error': "hasn't added any favorites yet!",
    }, context_instance=RequestContext(request))


def videos(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)
    all_videos = [uv.video for uv in user_videos]
    video_comments = list()

    favorites = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [int(f.action_object_object_id) for f in favorites]

    for video in all_videos:
        comments = MPTTComment.objects.filter(user=user, object_pk=video.id)
        if len(comments) > 0:
            video_comments.append(comments[0])
        else:
            fake_comment = MPTTComment()
            fake_comment.content_object = video
            video_comments.append(fake_comment)

    p = Paginator(video_comments, 12, request=request)
    featured_video_ids = [uv.video.id for uv in user_videos if uv.is_featured]

    if request.is_ajax() and page > 1:
        template = 'profiles/snippets/video.html'
    else:
        template = 'profiles/snippets/videos.html'

    return render_to_response(template, {
        'profile_user': user,
        'page_obj': p.page(page),
        'is_adding_video': False,
        'show_embed_button': False,
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': featured_video_ids,
        'favorite_comment_ids': favorite_comment_ids,
        'show_favorite_button': False,
        'error': "hasn't added any videos to their library yet!",
    }, context_instance=RequestContext(request))


@login_required
@csrf_exempt
def edit_profile(request, username):
    if username != request.user.username:
        return HttpResponseRedirect(
            reverse('profiles-edit', args=[request.user.username, ]))

    user = User.objects.get(username=username)
    submitted = request.method == 'POST'
    success = False
    profile = user.get_profile()

    if submitted:
        form = UserProfileForm(instance=profile,
                               data=request.POST)
        success = form.is_valid()

        if success:
            profile = form.save()
            action.send(
                request.user, verb='updated profile',
                action_object=request.user)
            outbound_message = {
                'msg': 'success',
                'status': 'success',
            }
            return HttpResponse(json.dumps(outbound_message),
                                content_type="application/json")
        else:
            errors = json.loads(errors_to_json(form.errors))
            outbound_message = {
                'msg': errors,
                'status': 'error',
            }
            return HttpResponse(json.dumps(outbound_message),
                                content_type="application/json")
    return HttpResponse()


@login_required
def add_video_to_library(request, username):
    submitted = request.method == 'POST'
    success = False

    if submitted:
        form = AddVideoForm(data=request.POST, request=request)
        success = form.is_valid()

        if success:
            request.session['show_new_video'] = True
            return HttpResponse()
    else:
        form = AddVideoForm(request=request)

    return render_to_response('profiles/snippets/add_video.html', {
        'form': form,
        'success': success,
        'submitted': submitted
    }, context_instance=RequestContext(request))


@login_required
def toggle_video_featured(request, username, video_id):
    user = User.objects.get(username=username)
    video = Video.objects.get(video_id=video_id)

    user_videos = UserVideo.objects.filter(user=user, video=video)
    if len(user_videos) > 0:
        user_video = user_videos[0]
        if user_video.is_featured:
            user_video.is_featured = False
        else:
            user_video.is_featured = True
        user_video.save()

    if len(user_videos) == 0:
        user_video = UserVideo()
        user_video.video = video
        user_video.user = user
        user_video.is_featured = True
        user_video.save()

    return HttpResponse()


@login_required
def toggle_video_library(request, username, video_id):
    user = User.objects.get(username=username)
    video = Video.objects.get(video_id=video_id)

    try:
        user_videos = UserVideo.objects.filter(user=user, video=video)
        if len(user_videos) > 0:
            user_video = user_videos[0]
            user_video.delete()
    except UserVideo.DoesNotExist:
        user_video = UserVideo()
        user_video.video = video
        user_video.user = user
        user_video.save()

    return HttpResponse()


@login_required
def toggle_comment_favorite(request, username, comment_id):
    thread = MPTTComment.objects.get(pk=comment_id)
    video = thread.content_object
    user = request.user

    is_favorite = Action.objects.actor(user,
                                       verb='added to favorites',
                                       action_object_object_id=comment_id)

    if is_favorite:
        action_name = 'removed from favorites'
        is_favorite.delete()
    else:
        action_name = 'added to favorites'

    action.send(user,
                verb=action_name,
                action_object=thread, target=video)

    if thread.user.id != user.id and thread.user.email:
        send_templated_mail(
            template_name='favorites-notification',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[thread.user.email],
            context={
                'comment': thread,
                'site': Site.objects.get_current(),
                'recipient': thread.user,
                'user': user,
            })
    return HttpResponse()
