from django.conf.urls import patterns, url

urlpatterns = patterns('',
   url(r'^$', 'framebuzz.apps.marketing.views.home', {'template': 'marketing/home.html'}, name='home'),
      url(r'^subscribe/$',
          'framebuzz.apps.marketing.views.subscribe', name='subscribe'),
   url(r'^learn-more/$', 'framebuzz.apps.marketing.views.learn_more', name='learn-more'),
   url(r'^contact/$', 'framebuzz.apps.marketing.views.contact', name='contact'),
   url(r'^contact/thanks/$', 'framebuzz.apps.marketing.views.contact_thanks', name='contact-thanks'),
   url(r'^wordpress/$', 'framebuzz.apps.marketing.views.wordpress', name='wordpress'),
   url(r'^about/$', 'framebuzz.apps.marketing.views.about', name='about'),
   url(r'^terms/$', 'framebuzz.apps.marketing.views.terms', name='terms'),
   url(r'^privacy-policy/$',
       'framebuzz.apps.marketing.views.privacy', name='privacy'),
   url(r'^press/$', 'framebuzz.apps.marketing.views.press', name='press'),
   url(r'^ajax/google-plus-count/$',
       'framebuzz.apps.marketing.views.google_plus_count', name='google-plus-count'),
   url(r'^accounts/thanks/$', 'framebuzz.apps.marketing.views.thanks', name='thanks'),
   url(r'^mobile/$', 'framebuzz.apps.marketing.views.mobile', name='mobile'),
)
