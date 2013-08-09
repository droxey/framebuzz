from django.contrib.auth.models import User
from django.conf import settings
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.template import RequestContext

from actstream import action
from actstream.models import Action, Follow, followers, following
from actstream.actions import follow, unfollow
from pure_pagination import Paginator, EmptyPage, PageNotAnInteger

from framebuzz.apps.api.backends.youtube import get_or_create_video
from framebuzz.apps.api.models import MPTTComment, Video


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


def profile_followers(request, username):
    user = User.objects.get(username__iexact=username)

    return render_to_response('profiles/snippets/followers.html',
    {
        'profile_user': user,
        'followers': followers(user),
    },
    context_instance=RequestContext(request))


def profile_following(request, username):
    user = User.objects.get(username__iexact=username)

    return render_to_response('profiles/snippets/following.html',
    {
        'profile_user': user,
        'following': following(user),
    },
    context_instance=RequestContext(request))


def conversations(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    conversations = MPTTComment.objects.filter(user=user, parent=None)
    p = Paginator(conversations, 12, request=request)

    return render_to_response('profiles/snippets/conversations.html',
    {
        'profile_user': user,
        'page_obj': p.page(page),
    },
    context_instance=RequestContext(request))


def favorites(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    favorite_comment_ids = [favorite.action_object_object_id for favorite in Action.objects.favorite_comments_stream(user)]
    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    p = Paginator(profile_favorites, 12, request=request)

    return render_to_response('profiles/snippets/favorites.html',
    {
        'profile_user': user,
        'page_obj': p.page(page),
    },
    context_instance=RequestContext(request))


def videos(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    all_videos = Video.objects.filter(added_by = user)
    p = Paginator(all_videos, 12, request=request)

    return render_to_response('profiles/snippets/videos.html',
    {
        'profile_user': user,
        'page_obj': p.page(page),
        'can_delete': True,
        'is_adding_video': False,
        'show_embed_button': False
    },
    context_instance=RequestContext(request))