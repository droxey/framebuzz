import json

from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext

from framebuzz.apps.api.models import UserProfile


@login_required
def dashboard_home(request, username):
    return render_to_response('dashboard/home.html', {
    }, context_instance=RequestContext(request))
