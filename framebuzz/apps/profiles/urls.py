from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^recommendations/$',
        'framebuzz.apps.profiles.views.recommendations',
        name='recommendations'),
    
    url(r'^(?P<username>[\w.@+-]+)/$',
        'framebuzz.apps.profiles.views.home',
        name='profiles-home'),

    url(r'^(?P<username>[\w.@+-]+)/feed/$',
        'framebuzz.apps.profiles.views.feed',
        name='profiles-feed'),

    url(r'^(?P<username>[\w.@+-]+)/add-video/$',
        'framebuzz.apps.profiles.views.add_video_to_library',
        name='profiles-add-video'),

    url(r'^(?P<username>[\w.@+-]+)/upload-video/$',
        'framebuzz.apps.profiles.views.upload_video',
        name='profiles-upload-video'),

    url(r'^(?P<username>[\w.@+-]+)/library/toggle/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.profiles.views.toggle_video_library',
        name='profiles-toggle-library'),

    url(r'^(?P<username>[\w.@+-]+)/library/featured/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.profiles.views.toggle_video_featured',
        name='profiles-toggle-featured'),

    url(r'^(?P<username>[\w.@+-]+)/conversations/favorite/(?P<comment_id>[\d]+)/$',
        'framebuzz.apps.profiles.views.toggle_comment_favorite',
        name='profiles-toggle-favorite'),

    url(r'^(?P<username>[\w.@+-]+)/videos/$',
        'framebuzz.apps.profiles.views.videos',
        name='profiles-videos'),
 
    url(r'^(?P<username>[\w.@+-]+)/edit/$',
        'framebuzz.apps.profiles.views.edit_profile',
        name='profiles-edit'),
    )
