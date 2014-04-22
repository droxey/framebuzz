import json

from django.core.urlresolvers import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, render
from django.template import RequestContext

from allauth.account.forms import SignupForm
from framebuzz.apps.marketing.forms import ContactRequestForm
from framebuzz.apps.api.utils import get_share_count


def server_error(request):
    response = render(request, "500.html")
    response.status_code = 500
    return response


def server_404(request):
    response = render(request, "404.html")
    response.status_code = 404
    return response


def thanks(request):
    return render_to_response('marketing/thanks.html', {
    }, context_instance=RequestContext(request))


def mobile(request):
    return render_to_response('marketing/mobile.html', {
    }, context_instance=RequestContext(request))


def home(request, template='marketing/home.html'):
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('profiles-home',
                                            args=[request.user.username]))
    return render_to_response(template, {
    }, context_instance=RequestContext(request))


def learn_more(request):
    return render_to_response('marketing/learn_more.html', {
    }, context_instance=RequestContext(request))


def about(request):
    return render_to_response('marketing/about.html', {
    }, context_instance=RequestContext(request))


def wordpress(request):
    return render_to_response('marketing/wordpress.html', {
    }, context_instance=RequestContext(request))


def contact(request):
    success = False

    if request.method == 'POST':
        form = ContactRequestForm(data=request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('contact-thanks'))
    else:
        form = ContactRequestForm()

    return render_to_response('marketing/contact.html', {
        'form': form,
        'success': success,
    }, context_instance=RequestContext(request))


def contact_thanks(request):
    return render_to_response('marketing/contact-thanks.html', {
    }, context_instance=RequestContext(request))

def terms(request):
    return render_to_response('marketing/terms.html', {
    }, context_instance=RequestContext(request))


def privacy(request):
    return render_to_response('marketing/privacy.html', {
    }, context_instance=RequestContext(request))


def press(request):
    return render_to_response('marketing/press.html', {
    }, context_instance=RequestContext(request))


def google_plus_count(request):
    count = get_share_count('google', url='http://framebuzz.com')

    response = {'count': count}
    return HttpResponse(json.dumps(response),
                        content_type='application/json')
