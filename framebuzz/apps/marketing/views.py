import urllib2
import lxml.html as lh
import json

from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext

from framebuzz.apps.marketing.forms import ContactRequestForm


def server_error(request):
    response = render(request, "500.html")
    response.status_code = 500
    return response

def server_404(request):
    response = render(request, "404.html")
    response.status_code = 404
    return response

def home(request):
    return render_to_response('marketing/home.html',
    {
    },
    context_instance=RequestContext(request))


def about(request):
    success = False

    if request.method == 'POST':
        form = ContactRequestForm(data=request.POST)
        if form.is_valid():
            form.save()
            success = True
            form = ContactRequestForm()
    else:
        form = ContactRequestForm()

    return render_to_response('marketing/about.html',
    {
        'form': form,
        'success': success,
    },
    context_instance=RequestContext(request))


def contact(request):
    return HttpResponseRedirect('%s#contact' % reverse('about'))


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


def google_plus_count(request):
    doc = lh.parse(urllib2.urlopen('https://plusone.google.com/_/+1/fastbutton?url=http://framebuzz.com&count=true'))
    count = doc.xpath("//div[@id='aggregateCount']/text()")
    print str(count)

    response = { 'count': str(count).lstrip("['").rstrip("']") }
    return HttpResponse(json.dumps(response), content_type='application/json')