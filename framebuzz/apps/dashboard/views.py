import json

from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext


def dashboard_home(request):
    return render_to_response('dashboard/home.html', {
    }, context_instance=RequestContext(request))
