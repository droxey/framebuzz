from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
   url(r'^$', 'framebuzz.apps.marketing.views.home', {'template': 'marketing/home1.html'}, name='home'),
   url(r'^v1/$', 'framebuzz.apps.marketing.views.home', {'template': 'marketing/home1.html'}, name='home1'),
   url(r'^v2/$', 'framebuzz.apps.marketing.views.home', {'template': 'marketing/home2.html'}, name='home2'),
   url(r'^v3/$', 'framebuzz.apps.marketing.views.home', {'template': 'marketing/home3.html'}, name='home3'),
   url(r'^learn-more/$', 'framebuzz.apps.marketing.views.learn_more', name='learn-more'),
   url(r'^contact/$', 'framebuzz.apps.marketing.views.contact', name='contact'),
   url(r'^wordpress/$', 'framebuzz.apps.marketing.views.wordpress', name='wordpress'),
   url(r'^about/$', 'framebuzz.apps.marketing.views.about', name='about'),
   url(r'^terms/$', 'framebuzz.apps.marketing.views.terms', name='terms'),
   url(r'^privacy-policy/$',
       'framebuzz.apps.marketing.views.privacy', name='privacy'),
   url(r'^press/$', 'framebuzz.apps.marketing.views.press', name='press'),
   url(r'^ajax/google-plus-count/$',
       'framebuzz.apps.marketing.views.google_plus_count', name='google-plus-count'),
   url(r'^mobile/$', 'framebuzz.apps.marketing.views.mobile', name='mobile'),
)
