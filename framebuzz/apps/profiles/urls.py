from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^(?P<username>[\w.@+-]+)/$', 'framebuzz.apps.profiles.views.home', name='profiles-home'),
    url(r'^(?P<username>[\w.@+-]+)/activity/$', 'framebuzz.apps.profiles.views.activity', name='profiles-activity'),
    url(r'^(?P<username>[\w.@+-]+)/followers/$', 'framebuzz.apps.profiles.views.profile_followers', name='profiles-followers'),
    url(r'^(?P<username>[\w.@+-]+)/following/$', 'framebuzz.apps.profiles.views.profile_following', name='profiles-following'),
    url(r'^(?P<username>[\w.@+-]+)/favorites/$', 'framebuzz.apps.profiles.views.favorites', name='profiles-favorites'),
    url(r'^(?P<username>[\w.@+-]+)/conversations/$', 'framebuzz.apps.profiles.views.conversations', name='profiles-conversations'),
    url(r'^(?P<username>[\w.@+-]+)/videos/$', 'framebuzz.apps.profiles.views.videos', name='profiles-videos'),
    url(r'^(?P<username>[\w.@+-]+)/edit/$', 'framebuzz.apps.profiles.views.edit_profile', name='profiles-edit'),
    url(r'^(?P<username>[\w.@+-]+)/add-video/$', 'framebuzz.apps.profiles.views.add_video_to_library', name='profiles-add-video'),
)