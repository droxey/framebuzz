from django.shortcuts import render_to_response
from django.template import RequestContext


def home(request):
    return render_to_response('marketing/home.html',
    {
    },
    context_instance=RequestContext(request))

def about(request):
    return render_to_response('marketing/about.html',
    {
    },
    context_instance=RequestContext(request))


def contact(request):
    return render_to_response('marketing/contact.html',
    {
    },
    context_instance=RequestContext(request))


def terms(request):
    return render_to_response('marketing/terms.html',
    {
    },
    context_instance=RequestContext(request))


def privacy(request):
    return render_to_response('marketing/privacy.html',
    {
    },
    context_instance=RequestContext(request))


def press(request):
    return render_to_response('marketing/press.html',
    {
    },
    context_instance=RequestContext(request))