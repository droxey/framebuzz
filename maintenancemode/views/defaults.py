#!/usr/bin/env python
# coding: utf-8

from django.template import RequestContext, TemplateDoesNotExist, loader

from maintenancemode import http

def temporary_unavailable(request, template_name='503.html'):
    """
    Default 503 handler, which looks for the requested URL in the redirects
    table, redirects if found, and displays 404 page if not redirected.

    Templates: `503.html`
    Context:
        request_path
            The path of the requested URL (e.g., '/app/pages/bad_page/')
    """
    # You need to create a 503.html template.
    try:
        t = loader.get_template(template_name)
    except TemplateDoesNotExist:
        raise TemplateDoesNotExist(
            u"Bro, you need to create a 503.html template. RTFM, lol.")
    context = RequestContext(request, {'request_path': request.path})
    return http.HttpResponseTemporaryUnavailable(t.render(context))
