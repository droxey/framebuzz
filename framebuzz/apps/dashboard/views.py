from django.conf import settings as django_settings
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.contrib.auth import logout
from forms import DashboardSignupForm, LoginForm, UserProfileForm, WebsiteForm #, DashboardLoginForm
from django.shortcuts import redirect
from actstream import action
from actstream.models import Action
from allauth.account.views import login as accountlogin
from allauth.socialaccount.models import SocialAccount, SocialToken
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, PageNotAnInteger
from framebuzz.apps.api.backends.youtube import get_uploaded_videos, get_or_create_video
from framebuzz.apps.api import models
from framebuzz.apps.api.models import Video, MPTTComment
from django.contrib.comments.models import Comment, CommentFlag
from django.core.urlresolvers import reverse
import datetime


@login_required
def index(request):
#    if not request.user.is_authenticated():
#        return redirect('/dashboard/register/?next=%s' % request.path)
    return render_to_response('dashboard/publisher/index.html')

	
@login_required
def publisher(request):
    return render_to_response('dashboard/publisher/index.html')

	
@login_required
def videos(request, view_type ='list'):
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1
    
    template = 'dashboard/video/index.html'
    library = Video.objects.filter(added_by = request.user)
    
    if request.is_ajax():
        view_type = request.POST.get('view_type', 'list')
        
        if view_type == 'list': # View Video as List
            template = 'dashboard/snippets/video_list.html'
            
        elif view_type == 'gallery': # View video as Gallery
            template = 'dashboard/snippets/video_gallery.html'
                
    return render_to_response(template, RequestContext(request, {
            'library': library ,
            'view_type': view_type,
    }))

@login_required
def detail_videos(request):    
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1
    
    if request.is_ajax():
        video_id = request.POST.get('video_id')
        template = 'dashboard/snippets/video_detail.html'
        video = Video.objects.get(video_id=video_id)
            
    return render_to_response(template, RequestContext(request, {
            'video': video
    }))

@login_required
def add_videos(request):
    # Try to get the list
    all_videos = list()
    selected_videos = list()
    social_token = None
    connected = None
    video_count = 0
    template = 'dashboard/video/add_videos.html'
    
    if request.method == 'POST':
        # Request all ids
        selected_videos_list = request.POST.getlist('youtube_ids[]')
        
        # Save All to my library
        for video_id in selected_videos_list:            
            video, created = get_or_create_video(video_id)
            video.added_by = request.user
            video.added_on = datetime.datetime.now()
            video.save()
            selected_videos.append(video)
    try:
        social_account = SocialAccount.objects.get(user=request.user, provider='google')
        if social_account:
            social_token = SocialToken.objects.get(account=social_account)
    except PageNotAnInteger:
        page = 1
    except:
        pass
    
    if social_token:
        all_videos = get_uploaded_videos(social_token.token)	
	if all_videos:
	    if len(all_videos) > 0:
		connected = True
		video_count = len(all_videos)
	else:
	    connected = True
	    video_count = 0
        
    return render_to_response(template, RequestContext(request, {
            'video_list': all_videos,
            'is_connected': social_token is not None,
	    'connected': connected,
	    'video_count': video_count
     }))


@login_required
def framebuzz_videos(request):
    if request.is_ajax():
        video_id = request.POST.get('video_id')
        if video_id:
            video, created = get_or_create_video(video_id)
            video.added_by = request.user
            video.added_on = datetime.datetime.now()
            video.save()
    
    template = 'dashboard/video/add_videos.html'
            
    return render_to_response(template, RequestContext(request))     


@login_required
def delete_videos(request):
    social_token = None
    deleted = None
    template = 'dashboard/snippets/video_list.html'
    
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1
    
    if request.is_ajax():
        video_id = request.POST.get('video_id')
	view_type = request.POST.get('view_type', 'list')
        
        if video_id:
            video = Video.objects.get(video_id=video_id)
            video.added_by = None
            video.save()
	    deleted = True
	    
	    library = Video.objects.filter(added_by = request.user)
	    if view_type == 'list': # View Video as List
		template = 'dashboard/snippets/video_list.html'
            
	    elif view_type == 'gallery': # View video as Gallery
		template = 'dashboard/snippets/video_gallery.html'
    
    return render_to_response(template, RequestContext(request, {
            'library': library ,
            'view_type': view_type,
	    'deleted' : deleted
    }))

@login_required
def moderators_queue(request):
    
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1

    moderated_comment_id = request.GET.get('c', None)
    moderated_flag = request.GET.get('a', None)
    moderated = None

    all_videos = Video.objects.filter(added_by = request.user).values('id',)
    all_videos_id_list = [x['id'] for x in all_videos]

    # CHECK THIS LINE
    comment_flags = CommentFlag.objects.filter(comment__object_pk__in=all_videos_id_list, flag=CommentFlag.SUGGEST_REMOVAL)
        
    if moderated_comment_id and moderated_flag:
        moderated_comment = MPTTComment.objects.get(id=moderated_comment_id)
        
        comment_flag = CommentFlag.objects.get(comment__id = moderated_comment_id, comment__object_pk__in=all_videos_id_list, flag=CommentFlag.SUGGEST_REMOVAL)
        
        comment_flag.delete()

        moderated = {
            'comment': moderated_comment,
            'flag': 'approved' if moderated_flag == 1 else 'deleted'
        }

        # Delete query string values.
        get_copy = request.GET.copy()
        del get_copy['a']
        del get_copy['c']

    # Provide Paginator with the request object for complete querystring generation
    # p = Paginator(comment_flags, 10, request=request)
    
    template = 'dashboard/moderator/moderators_queue.html'

    return render_to_response(template, RequestContext(request, {
        'comment_queue': comment_flags,
        'moderated_comment': moderated,
    }))

@login_required
def moderators_basic(request):
    return render_to_response('dashboard/moderator/moderators_basic.html')

@login_required
def moderators_advanced(request, control = 'rule_set'):
    
    template = 'dashboard/moderator/moderators_advanced.html'
    
    try:
        page = request.GET.get('page', 1)
    except PageNotAnInteger:
        page = 1
        
    if request.is_ajax():
        control = request.POST.get('control')
        
        if control == 'rule_set':
            template = 'dashboard/snippets/moderator_rule_sets.html'
        
        if control == 'privileges':
            template = 'dashboard/snippets/moderator_privileges.html'
        
        if control == 'word_list':
            template = 'dashboard/snippets/moderator_word_lists.html'
        
        if control == 'profile':
            template = 'dashboard/snippets/moderator_profile.html'
            
    return render_to_response(template, RequestContext(request, {
            'control': control
    }))

@login_required
def comment_stream(request):
    
    if request.is_ajax():
        video_id = request.POST.get('video_id')
        video = Video.objects.get(video_id=video_id)
        
        if video:
            
            # Get comments of selected video
            #comments = Comment.objects.for_model(Video).filter(object_pk=video.id)
            
            template = 'comments/comment_stream.html'
            return render_to_response(template, RequestContext(request, {
                'video': video
            }))

#def analytics(request):
#    return render_to_response('dashboard/analytics/index.html')

@login_required
def add_websites(request):
    submitted = request.method == "POST"
    profile = request.user.get_profile()
    
    if request.method == 'POST':
        website_form = WebsiteForm(data=request.POST, request=request)
        success = website_form.is_valid()
        
        if success:
            website = website_form.save()
            website_form = WebsiteForm(data=request.POST, request=request)
        
    else:
        success = False
        website_form = WebsiteForm(data=request.POST, request=request)
    
    template = 'dashboard/website/add_websites.html'    
    return render_to_response(template, RequestContext(request, {
        'form' : website_form,
        'success': success,
        'submitted': submitted
    }))

@login_required
def profile(request):
    return render_to_response('dashboard/profile/index.html')
    
@login_required
def settings(request):
    submited = request.method == 'POST'
    profile = request.user.get_profile()
    websites = request.user.get_profile().websites
    
    template = 'dashboard/profile/settings.html'
    
    return render_to_response(template, RequestContext(request, {
            'profile': profile,
            'websites': websites
    }))
    

@login_required
def settings_edit(request):
    submitted = request.method == 'POST'
    profile = request.user.get_profile()
    
    if request.method == 'POST':
        form = UserProfileForm(instance=profile, data=request.POST, request=request)
        success = form.is_valid()
        
        if success:
            profile = form.save()
            del request.session['user_timezone']

            action.send(request.user, verb='updated profile', action_object=request.user)

            form = UserProfileForm(instance=profile, request=request)
    else:
        success = False
        form = UserProfileForm(instance=profile, request=request)

    template = 'dashboard/profile/settings_edit.html'
    
    return render_to_response(template, RequestContext(request, {
            'form': form,
            "success": success,
            "submitted": submitted
    }))


def logout_dashboard(request):
    logout(request)  
    return redirect('/dashboard/register/?next=/dashboard/')


def login(request):
    ret = accountlogin(request=request)
    if request.method == 'POST': # If the form has been submitted...
        redirect_path = request.POST.get('next', None)
    else:
        redirect_path = request.GET.get('next', None)
    if not redirect_path:
        redirect_path = '/dashboard/'
    if not request.user.is_authenticated():
        return render_to_response('account/login.html', context=RequestContext(request, {'next' : redirect_path, 'form': LoginForm}))
    else:
        return ret

def register_user(request):
    submited = request.method == 'POST'
    if request.method == 'POST': # If the form has been submitted...
        userForm = DashboardSignupForm(data=request.POST, request=request) # A form bound to the POST data
        success = userForm.is_valid()
        redirect_path = request.POST.get('next', None)
        if userForm.is_valid(): # All validation rules pass
            # Process the data in form.cleaned_data
            userForm.save()
    else:
        success = False
        userForm = DashboardSignupForm(request=request) # An unbound form
        redirect_path = request.GET.get('next', None)
    if not redirect_path:
        redirect_path = '/dashboard/'
    return render_to_response('account/new_business_signup.html', RequestContext(request, {'reg_user_form' : userForm, 'form': LoginForm, 'next' : redirect_path, "success": success, "submitted": submited}))
