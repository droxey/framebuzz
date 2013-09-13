from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext

from actstream import action
from actstream.models import Action, followers, following
from pure_pagination import Paginator, PageNotAnInteger
from templated_email import send_templated_mail

from framebuzz.apps.api.models import MPTTComment, UserVideo, Video
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

def logged_in(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(
            reverse('profiles-home', args=[request.user.username, ]))
    else:
        return HttpResponseRedirect(reverse('account_login'))


def home(request, username):
    profile_header = get_profile_header(username)
    profile_header['is_edit'] = False
    return render_to_response('profiles/base.html',
                              profile_header,
                              context_instance=RequestContext(request))


def activity(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    actions = Action.objects.filter(verb__in=VALID_FEED_VERBS,
                                    action_object_object_id=user.id).order_by('-timestamp')
    p = Paginator(actions, 12, request=request)

    return render_to_response('profiles/snippets/activity.html', {
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

    return render_to_response('profiles/snippets/followers.html', {
        'profile_user': user,
        'followers': profile_followers,
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

    return render_to_response('profiles/snippets/following.html', {
        'profile_user': user,
        'following': profile_following,
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

    return render_to_response('profiles/snippets/feed.html', {
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
    favorite_comment_ids = [f.action_object_object_id for f in favorites]

    p = Paginator(conversations, 12, request=request)
    featured_video_ids = [uv.video.id for uv in user_videos if uv.is_featured]

    return render_to_response('profiles/snippets/conversations.html', {
        'profile_user': user,
        'page_obj': p.page(page),
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': featured_video_ids,
        'favorite_comment_ids': favorite_comment_ids,
        'show_favorite_button': True,
    }, context_instance=RequestContext(request))


def favorites(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user)

    favorites = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [f.action_object_object_id for f in favorites]

    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    p = Paginator(profile_favorites, 12, request=request)
    featured_video_ids = [uv.video.id for uv in user_videos if uv.is_featured]

    return render_to_response('profiles/snippets/favorites.html', {
        'profile_user': user,
        'page_obj': p.page(page),
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': featured_video_ids,
        'favorite_comment_ids': favorite_comment_ids,
        'show_favorite_button': True,
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
    favorite_comment_ids = [f.action_object_object_id for f in favorites]

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

    return render_to_response('profiles/snippets/videos.html', {
        'profile_user': user,
        'page_obj': p.page(page),
        'is_adding_video': False,
        'show_embed_button': False,
        'video_library_ids': [uv.video.id for uv in user_videos],
        'featured_video_ids': featured_video_ids,
        'favorite_comment_ids': favorite_comment_ids,
        'show_favorite_button': False,
    }, context_instance=RequestContext(request))


@login_required
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
                               data=request.POST, request=request)
        success = form.is_valid()

        if success:
            profile = form.save()
            del request.session['user_timezone']

            action.send(
                request.user, verb='updated profile',
                action_object=request.user)
            return HttpResponse()
    else:
        website = profile.get_default_website()
        initial_dict = {
            'bio': profile.bio,
            'birthday': profile.birthday,
            'time_zone': profile.time_zone,
            'profession': profile.profession,
            'location': profile.location,
        }

        if website:
            initial_dict['website'] = website.url

        form = UserProfileForm(initial=initial_dict, request=request)

    profile_header = get_profile_header(username)
    profile_header['form'] = form
    profile_header['success'] = success
    profile_header['submitted'] = submitted
    profile_header['is_edit'] = True
    return render_to_response('profiles/edit.html',
                              profile_header,
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
