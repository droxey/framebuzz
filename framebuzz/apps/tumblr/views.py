from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from pure_pagination import Paginator, PageNotAnInteger, EmptyPage

from framebuzz.apps.api.models import Video
from framebuzz.apps.tumblr.forms import TumblrUploadForm
from framebuzz.apps.tumblr.utils import get_user_videos
from framebuzz.apps.tumblr.tasks import submit_to_tumblr


START_PAGE = 1
VIDEOS_PER_PAGE = 6


def home(request):
    ''' Displays the unauthenticated homepage for the Tumblr integration. '''
    if request.user.is_authenticated():
        return HttpResponseRedirect(
            reverse('fbz-tumblr-dashboard', args=[request.user.username]))
    return render_to_response('tumblr/home.html', {
        'next_url': reverse('fbz-tumblr-exit-login'),
    }, context_instance=RequestContext(request))


def exit_login(request):
    ''' Simple view that renders a template with the ability to automatically
        close the popup window client-side upon successful authentication. '''
    return render_to_response('tumblr/exit.html', {
    }, context_instance=RequestContext(request))


@login_required
def dashboard(request, username):
    ''' Displays the 'logged in' homepage, uploader, and a paginated list of
        user-uploaded videos. '''
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
    return render_to_response(template, {
        'page_obj': page_obj,
        'video_count': len(videos),
        'upload_form': upload_form
    }, context_instance=RequestContext(request))


@login_required
def post_to_tumblr(request, slug):
    ''' Ajax endpoint that allows us to kick off Tumblr submission for a
    user-selected video. '''
    vid = Video.objects.get(slug=slug)
    submit_to_tumblr.apply_async(args=[vid.added_by.username, vid.video_id])
    return HttpResponse(200)
