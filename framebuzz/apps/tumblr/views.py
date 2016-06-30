from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

from pure_pagination import Paginator, PageNotAnInteger

from framebuzz.apps.tumblr.utils import get_user_videos


START_PAGE = 1
VIDEOS_PER_PAGE = 12


def home(request):
    ''' Displays the 'logged out' homepage for the Tumblr integration. '''
    if request.user.is_authenticated():
        return HttpResponseRedirect(
            reverse('fbz-tumblr-dashboard', args=[request.user.username]))
    return render_to_response('tumblr/home.html', {
    }, context_instance=RequestContext(request))


@login_required
def dashboard(request, username):
    ''' Displays the 'logged in' homepage, uploader, and a paginated list of
        user-uploaded videos. '''
    try:
        page = request.GET.get('page', START_PAGE)
    except PageNotAnInteger:
        page = START_PAGE
    videos = get_user_videos(username)
    p = Paginator(videos, VIDEOS_PER_PAGE, request=request)
    page_obj = p.page(page)
    template = 'tumblr/snippets/videos.html' \
        if request.is_ajax() \
        else 'tumblr/dashboard.html'
    return render_to_response(template, {
        'page_obj': page_obj,
    }, context_instance=RequestContext(request))
