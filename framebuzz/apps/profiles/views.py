import json

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.models import Site
from django.core.urlresolvers import reverse
from django.db.models import Count, Q
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


def feed(request, username):
    """
        Returns the rendered template(s) used by the newsfeed.
    """
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    user = None
    kwargs = dict()
    kwargs['verb__in'] = VALID_FEED_VERBS

    if request.user.is_authenticated() and request.user.username == username:
        user = request.user

        user_following = following(user)
        following_ids = [f.id for f in user_following]
        following_ids.append(user.id)
 
        feed = Action.objects.filter(Q(action_object_object_id__in=following_ids) | \
                                     Q(target_object_id__in=following_ids), verb__in=VALID_FEED_VERBS) \
                                    .order_by('-timestamp')
    else:
        kwargs['actor_only'] = True
        user = User.objects.get(username__iexact=username)
        feed = Action.objects.filter(verb__in=VALID_FEED_VERBS,
                                     actor_object_id=user.id).order_by('-timestamp')

    p = Paginator(feed, 20, request=request)

    if request.is_ajax() and page > 1:
        template = 'profiles/snippets/item.html'
    else:
        template = 'profiles/snippets/feed.html'

    return render_to_response(template, {
        'profile_user': user,
        'page_obj': p.page(page),
    }, context_instance=RequestContext(request))


def recommendations(request):
    top_video_actions = Action.objects.filter(verb='viewed video') \
        .values('action_object_object_id') \
        .annotate(views=Count('id')) \
        .order_by('-views')[1:4]
    top_video_ids = [v.get('action_object_object_id')
                     for v in top_video_actions]
    top_videos = Video.objects.filter(id__in=top_video_ids)

    top_user_actions = Action.objects.filter(verb__in=
        ['commented on', 'replied to comment']) \
        .values('actor_object_id') \
        .annotate(comments=Count('id')) \
        .order_by('-comments')[:12]
    top_user_ids = [u.get('actor_object_id') for u in top_user_actions]
    top_users = User.objects.filter(id__in=top_user_ids)

    return render_to_response('profiles/snippets/recommendations.html', {
        'top_videos': top_videos,
        'top_users': top_users,
    }, context_instance=RequestContext(request))

def video_share(request, username=None, video_id=None):
    video, created = get_or_create_video(video_id)
    context = dict()

    valid_verbs = ['commented on', 'replied to comment']
    actions = Action.objects.filter(verb__in=valid_verbs,
                                    target_object_id=video.id) \
                            .values('actor_object_id')
    action_ids = [int(a['actor_object_id']) for a in actions]
    commenters = User.objects.filter(id__in=action_ids)
    
    context['video'] = video
    context['is_share'] = True
    context['commenters'] = commenters
    context['path'] = request.path
    context['found_by'] = video.found_by

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
    user = User.objects.get(username__iexact=username)
    actions = Action.objects.favorite_comments_stream(user)
    favorite_comment_ids = [a.action_object_object_id for a in actions]
    profile_favorites = MPTTComment.objects.filter(id__in=favorite_comment_ids)
    profile_conversations = MPTTComment.objects.filter(user=user, parent=None)
    profile_followers = followers(user)
    profile_following = following(user)
    profile_library = UserVideo.objects.filter(user=user)
    ct = ContentType.objects.get(model='user')
    is_my_profile = request.user.is_authenticated() and \
                    request.user.id == user.id
    context = {
        'profile_favorites': profile_favorites,
        'profile_conversations': profile_conversations,
        'profile_followers': profile_followers,
        'profile_following': profile_following,
        'profile_user': user,
        'profile_library': profile_library,
        'user_content_type': ct,
        'is_my_profile': is_my_profile,
    }

    share_context = request.session.get('share', None)
    if share_context:
        context['shares'] = get_total_shares(share_context['path'])
        context.update(share_context)
        del request.session['share']

    return render_to_response('profiles/base.html',
                              context,
                              context_instance=RequestContext(request))

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
 

def videos(request, username):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1
 
    user = User.objects.get(username__iexact=username)
    user_videos = UserVideo.objects.filter(user=user).order_by('-added_on')
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

    user_videos = UserVideo.objects.filter(user=user, video=video)

    if len(user_videos) > 0:
        user_video = user_videos[0]
        user_video.delete()
        print 'deleted'

    if len(user_videos) == 0:
        user_video = UserVideo()
        user_video.video = video
        user_video.user = user
        user_video.is_featured = False
        user_video.save()
        print 'saved'

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
