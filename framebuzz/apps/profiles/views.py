import json

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from actstream import action
from actstream.models import Action, Follow, followers, following
from pure_pagination import Paginator, PageNotAnInteger

from framebuzz.apps.api.models import MPTTComment, UserVideo, Video
from framebuzz.apps.profiles.forms import UserProfileForm, AddVideoForm


def logged_in(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('profiles-home', args=[request.user.username,]))


def home(request, username):
    user = User.objects.get(username__iexact=username)

    favorite_comment_ids = [favorite.action_object_object_id for favorite in Action.objects.favorite_comments_stream(user)]
    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    profile_conversations = MPTTComment.objects.filter(user=user, parent=None)
    profile_followers = followers(user)
    profile_following = following(user)
    
    return render_to_response('profiles/home.html',
    {
        'profile_favorites': profile_favorites,
        'profile_conversations': profile_conversations,
        'profile_followers': profile_followers,
        'profile_following': profile_following,
        'profile_user': user,
    },
    context_instance=RequestContext(request))


def activity(request, username):
    user = User.objects.get(username__iexact=username)

    user_videos = UserVideo.objects.filter(user=user).order_by('-is_featured')[:3]
    latest_videos_comments = list()

    for uv in user_videos:
        comments = MPTTComment.objects.filter(user=user, object_pk=uv.id)
        if len(comments) > 0:
            comment = comments[0]
            latest_videos_comments.append(comment)
        else:
            fake_comment = MPTTComment()
            fake_comment.content_object = uv.video
            latest_videos_comments.append(fake_comment)

    latest_following = Follow.objects.filter(user=user).order_by('-started')[:3]
    latest_comments = MPTTComment.objects.filter(user=user).order_by('-submit_date')[:3]

    return render_to_response('profiles/snippets/activity.html',
    {
        'profile_user': user,
        'latest_videos': latest_videos_comments,
        'latest_comments': latest_comments,
        'latest_following': latest_following,
        'can_delete': request.user.is_authenticated() and request.user.id == user.id,
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': [uv.video.id for uv in user_videos if uv.is_featured]
    },
    context_instance=RequestContext(request))


def profile_followers(request, username):
    user = User.objects.get(username__iexact=username)
    user_followers = followers(user)
    profile_followers = dict()

    for followed_user in user_followers:
        latest_comments = MPTTComment.objects.filter(user=followed_user).order_by('-submit_date')[:2]
        profile_followers[followed_user.username] = {
            'user': followed_user,
            'comments': latest_comments,
        }

    return render_to_response('profiles/snippets/followers.html',
    {
        'profile_user': user,
        'followers': profile_followers,
    },
    context_instance=RequestContext(request))


def profile_following(request, username):
    user = User.objects.get(username__iexact=username)
    user_following = following(user)
    profile_following = dict()

    for following_user in user_following:
        latest_comments = MPTTComment.objects.filter(user=following_user).order_by('-submit_date')[:2]
        profile_following[following_user.username] = {
            'user': following_user,
            'comments': latest_comments,
        }

    return render_to_response('profiles/snippets/following.html',
    {
        'profile_user': user,
        'following': profile_following,
    },
    context_instance=RequestContext(request))


def conversations(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)
    conversations = MPTTComment.objects.filter(user=user, parent=None)
    p = Paginator(conversations, 12, request=request)


    return render_to_response('profiles/snippets/conversations.html',
    {
        'profile_user': user,
        'page_obj': p.page(page),
        'can_delete': request.user.is_authenticated() and request.user.id == user.id,
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': [uv.video.id for uv in user_videos if uv.is_featured]
    },
    context_instance=RequestContext(request))


def favorites(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)
    favorite_comment_ids = [favorite.action_object_object_id for favorite in Action.objects.favorite_comments_stream(user)]
    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    p = Paginator(profile_favorites, 12, request=request)

    return render_to_response('profiles/snippets/favorites.html',
    {
        'profile_user': user,
        'page_obj': p.page(page),
        'can_delete': request.user.is_authenticated() and request.user.id == user.id,
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': [uv.video.id for uv in user_videos if uv.is_featured]
    },
    context_instance=RequestContext(request))


def videos(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)
    all_videos = [uv.video for uv in user_videos]
    video_comments = list()

    for video in all_videos:
        comments = MPTTComment.objects.filter(user=user, object_pk=video.id)
        if len(comments) > 0:
            video_comments.append(comments[0])
        else:
            fake_comment = MPTTComment()
            fake_comment.content_object = video
            video_comments.append(fake_comment)

    p = Paginator(video_comments, 12, request=request)

    return render_to_response('profiles/snippets/videos.html',
    {
        'profile_user': user,
        'page_obj': p.page(page),
        'can_delete': request.user.is_authenticated() and request.user.id == user.id,
        'is_adding_video': False,
        'show_embed_button': False,
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': [uv.video.id for uv in user_videos if uv.is_featured]
    },
    context_instance=RequestContext(request))

@login_required
def edit_profile(request, username):
    submitted = request.method == 'POST'
    success = False
    profile = request.user.get_profile()
    
    if submitted:
        form = UserProfileForm(instance=profile, data=request.POST, request=request)
        success = form.is_valid()
        
        if success:
            profile = form.save()
            del request.session['user_timezone']

            action.send(request.user, verb='updated profile', action_object=request.user)

            form = UserProfileForm(instance=profile, request=request)
    else:
        form = UserProfileForm(instance=profile, request=request)

    return render_to_response('profiles/edit.html',
    {
        'form': form,
        'success': success,
        'submitted': submitted
    },
    context_instance=RequestContext(request))


@login_required
def add_video_to_library(request, username):
    submitted = request.method == 'POST'
    success = False
    
    if submitted:
        form = AddVideoForm(data=request.POST, request=request)
        success = form.is_valid()
        
        if success:
            return HttpResponse()
    else:
        form = AddVideoForm(request=request)

    return render_to_response('profiles/snippets/add_video.html',
    {
        'form': form,
        'success': success,
        'submitted': submitted
    },
    context_instance=RequestContext(request))

@login_required
def toggle_video_featured(request, username, video_id):
    user = User.objects.get(username=username)
    video = Video.objects.get(video_id=video_id)

    user_videos = UserVideo.objects.filter(user = user, video = video)
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
        user_videos = UserVideo.objects.filter(user = user, video = video)
        if len(user_videos) > 0:
            user_video = user_videos[0]
            user_video.delete()
    except UserVideo.DoesNotExist:
        user_video = UserVideo()
        user_video.video = video
        user_video.user = user
        user_video.save()

    return HttpResponse()