from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from pure_pagination import Paginator, PageNotAnInteger

from framebuzz.apps.tumblr.forms import TumblrUploadForm
from framebuzz.apps.tumblr.utils import get_user_videos


START_PAGE = 1
VIDEOS_PER_PAGE = 12


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
    try: page = request.GET.get('page', START_PAGE)
    except PageNotAnInteger: page = START_PAGE
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
            upload_form = TumblrUploadForm(request=request)
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
