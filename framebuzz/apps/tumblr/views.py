from django.shortcuts import render_to_response
from django.template import RequestContext


def home(request):
    ''' Displays the 'logged out' homepage for the Tumblr integration. '''
    return render_to_response('tumblr/home.html', {
    }, context_instance=RequestContext(request))


def dashboard(request, username):
    ''' Displays the 'logged in' homepage, uploader, and list of
        user-uploaded videos. '''
    return render_to_response('tumblr/dashboard.html', {
    }, context_instance=RequestContext(request))


def videos(request, username):
    ''' A paginated list of videos, filtered by username. '''
    return render_to_response('tumblr/snippets/videos.html', {
    }, context_instance=RequestContext(request))
