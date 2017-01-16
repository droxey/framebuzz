from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
from framebuzz.apps.api.models import Video
from framebuzz.apps.tumblr.forms import EditVideoForm, TumblrUploadForm
from framebuzz.apps.tumblr.tasks import submit_to_tumblr
from framebuzz.apps.tumblr.utils import get_carousel_slides, get_user_videos
from pure_pagination import EmptyPage, PageNotAnInteger, Paginator

START_PAGE = 1
VIDEOS_PER_PAGE = 6


def home(request):
    ''' Displays the unauthenticated homepage for the Tumblr integration. '''
    if request.user.is_authenticated():
        return HttpResponseRedirect(
            reverse('fbz-tumblr-dashboard', args=[request.user.username]))
    carousel = get_carousel_slides()
    lightbox_embed = settings.PLAYER_SIZES.get('large', None)
    return render_to_response('tumblr/home.html', {
        'next_url': reverse('fbz-tumblr-exit-login'),
        'show_carousel': carousel.get('show_carousel', False),
        'slides': carousel.get('slides', None),
        'is_debug': settings.DEBUG,
        'lightbox_embed': lightbox_embed,
        'is_mobile': request.META.get('IS_MOBILE', False)
    }, context_instance=RequestContext(request))


def exit_login(request):
    ''' Simple view that renders a template with the ability to automatically
        close the popup window client-side upon successful authentication. '''
    return render_to_response('tumblr/exit.html', {
    }, context_instance=RequestContext(request))


def view_video(request, slug):
    ''' A landing page to view a single. '''
    vid = Video.objects.get(slug=slug)
    return render_to_response('tumblr/view_video.html', {
        'video': vid
    }, context_instance=RequestContext(request))


def dashboard(request, username):
    ''' Displays the 'logged in' homepage, uploader, and a paginated list of
        user-uploaded videos. '''
    # Ensure only the logged in user can view their page.
    if not request.user.is_authenticated():
        return HttpResponseRedirect(reverse('fbz-tumblr-home', args=[]))
    if request.user.is_authenticated() and request.user.username != username:
        return HttpResponseRedirect(
            reverse('fbz-tumblr-dashboard', args=[request.user.username]))
    # Set pagination data according to the ?page= GET parameter.
    try:
        page = request.GET.get('page', START_PAGE)
    except PageNotAnInteger:
        page = START_PAGE
    template = 'tumblr/snippets/videos.html' \
        if request.is_ajax() \
        else 'tumblr/dashboard.html'
    # Handle the UploadVideoForm.
    if request.method == 'POST':
        upload_form = TumblrUploadForm(data=request.POST,
                                       files=request.FILES,
                                       request=request)
        if upload_form.is_valid():
            # Save the form, then reset.
            upload_form.save()
            # When we redirect the user, lets take them straight to the
            # 'My Videos' section of the page.
            redirect_url = '%s#videolist' % \
                reverse('fbz-tumblr-dashboard', args=[request.user.username])
            return HttpResponseRedirect(redirect_url)
    else:
        upload_form = TumblrUploadForm(request=request)
    # Fetch fresh data needed for the template context.
    videos = get_user_videos(username)
    p = Paginator(videos, VIDEOS_PER_PAGE, request=request)
    page_obj = p.page(page)
    carousel = get_carousel_slides()
    is_mobile = request.META.get('IS_MOBILE', False)
    player_size = 'small' if is_mobile else 'large'
    lightbox_embed = settings.PLAYER_SIZES.get(player_size, None)
    return render_to_response(template, {
        'page_obj': page_obj,
        'video_count': len(videos),
        'upload_form': upload_form,
        'show_carousel': carousel.get('show_carousel', False),
        'slides': carousel.get('slides', None),
        'is_debug': settings.DEBUG,
        'lightbox_embed': lightbox_embed,
        'is_mobile': is_mobile
    }, context_instance=RequestContext(request))


@login_required(login_url='/tumblr/')
def post_to_tumblr(request, slug):
    ''' Ajax endpoint that allows us to kick off Tumblr submission for a
    user-selected video. '''
    vid = Video.objects.get(slug=slug)
    submit_to_tumblr.apply_async(args=[vid.added_by.username, vid.video_id])
    return HttpResponse(200)


@login_required(login_url='/tumblr/')
def edit_video(request, slug):
    ''' Ajax endpoint that allows us to edit a video we've uploaded. '''
    vid = Video.objects.get(slug=slug)
    errors = None
    template = 'tumblr/snippets/edit_video.html'
    if request.POST:
        edit_form = EditVideoForm(data=request.POST, video=vid)
        if edit_form.is_valid():
            vid = edit_form.save()
            template = 'tumblr/snippets/item.html'
        else:
            errors = edit_form.errors.as_data()
    else:
        edit_form = EditVideoForm(initial={
            'title': vid.title,
            'description': vid.description
        }, video=vid)
    return render_to_response(template, {
        'edit_form': edit_form,
        'is_debug': settings.DEBUG,
        'video': vid,
        'errors': errors,
        'is_ajax': request.is_ajax()
    })


@login_required(login_url='/tumblr/')
def delete_video(request, slug):
    ''' Ajax endpoint that allows us to delete a video we've uploaded. '''
    vid = Video.objects.get(slug=slug)
    vid.delete()
    return HttpResponse(200)
