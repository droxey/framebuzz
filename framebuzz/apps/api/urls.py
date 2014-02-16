from django.conf.urls import patterns, url

urlpatterns = patterns('',
   url(r'^(?P<slug>[\w.@+-]+)/error/$',
       'framebuzz.apps.api.views.video_embed_error', name='video-embed-error'),
   url(r'^(?P<slug>[\w.@+-]+)/$',
       'framebuzz.apps.api.views.video_embed', name='video-embed'),
   url(r'^(?P<slug>[\w.@+-]+)/login/$',
       'framebuzz.apps.api.views.video_login', name='video-login'),
   url(r'^(?P<slug>[\w.@+-]+)/signup/$',
       'framebuzz.apps.api.views.video_signup', name='video-signup'),
   url(r'^(?P<slug>[\w.@+-]+)/logout/$',
       'framebuzz.apps.api.views.video_logout', name='video-logout'),
   )
