from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'framebuzz.apps.marketing.views.home', name='home'),
    url(r'^contact/$', 'framebuzz.apps.marketing.views.contact', name='contact'),
    url(r'^about/$', 'framebuzz.apps.marketing.views.about', name='about'),
    url(r'^terms/$', 'framebuzz.apps.marketing.views.terms', name='terms'),
    url(r'^privacy-policy/$', 'framebuzz.apps.marketing.views.privacy', name='privacy'),
    url(r'^press/$', 'framebuzz.apps.marketing.views.press', name='press'),
    url(r'^ajax/google-plus-count/$', 'framebuzz.apps.marketing.views.google_plus_count', name='google-plus-count'),
)