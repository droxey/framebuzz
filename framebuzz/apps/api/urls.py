from django.conf.urls import patterns, url

urlpatterns = patterns('',
   url(r'^(?P<slug>[\w.@+-]+)/error/$',
       'framebuzz.apps.api.views.video_embed_error', name='video-embed-error'),

   url(r'^(?P<slug>[\w.@+-]+)/$',
       'framebuzz.apps.api.views.video_embed',{ 'control_sync': False, 'small': False },
       name='video-embed'),

   url(r'^modal/(?P<slug>[\w.@+-]+)/$',
       'framebuzz.apps.api.views.video_embed',{ 'control_sync': False, 'small': True },
       name='video-embed-small'),

   url(r'^(?P<slug>[\w.@+-]+)/viewing/start/$',
       'framebuzz.apps.api.views.video_embed', { 'convo_slug': None, 'control_sync': True },
       name='viewing-start'),

   url(r'^(?P<slug>[\w.@+-]+)/convo/(?P<convo_slug>[\w.@+-]+)/$',
       'framebuzz.apps.api.views.video_embed', { 'control_sync': False },
       name='convo-embed'),

   url(r'^(?P<slug>[\w.@+-]+)/viewing/(?P<convo_slug>[\w.@+-]+)/$',
       'framebuzz.apps.api.views.video_embed', { 'control_sync': True },
       name='viewing-embed'),

   url(r'^(?P<slug>[\w.@+-]+)/login/$',
       'framebuzz.apps.api.views.video_login', name='video-login'),

   url(r'^(?P<slug>[\w.@+-]+)/signup/$',
       'framebuzz.apps.api.views.video_signup', name='video-signup'),

   url(r'^(?P<slug>[\w.@+-]+)/logout/$',
       'framebuzz.apps.api.views.video_logout', name='video-logout'),
   )
