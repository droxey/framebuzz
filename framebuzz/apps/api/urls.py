from django.conf.urls import patterns, url

urlpatterns = patterns('',
   url(r'^(?P<video_id>[\w.@+-]+)/$',
       'framebuzz.apps.api.views.video_embed', name='video-embed'),
   url(r'^(?P<video_id>[\w.@+-]+)/login/$',
       'framebuzz.apps.api.views.video_login', name='video-login'),
   url(r'^(?P<video_id>[\w.@+-]+)/signup/$',
       'framebuzz.apps.api.views.video_signup', name='video-signup'),
   url(r'^(?P<video_id>[\w.@+-]+)/logout/$',
       'framebuzz.apps.api.views.video_logout', name='video-logout'),
   )
