from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    # publisher dashboard
    url(r'^publisher/$', 'framebuzz.apps.dashboard.views.publisher', name='publisher'),

    # video dashboard
    url(r'^videos/add/$', 'framebuzz.apps.dashboard.views.add_videos', name='dashboard-add-videos'),
    url(r'^videos/delete/$', 'framebuzz.apps.dashboard.views.delete_videos', name='dashboard-delete-videos'),
    url(r'^videos/detail/$', 'framebuzz.apps.dashboard.views.detail_videos', name='dashboard-detail-videos'),
    url(r'^videos/framebuzz/$', 'framebuzz.apps.dashboard.views.framebuzz_videos', name='dashboard-framebuzz-videos'),    
    url(r'^videos/(?P<view_type>[\w]+)/$', 'framebuzz.apps.dashboard.views.videos', name='dashboard-videos'),

    # moderator dashboard 
    url(r'^moderator/basic/$', 'framebuzz.apps.dashboard.views.moderators_basic', name='dashboard-moderators-basic'),
    url(r'^moderator/advanced/(?P<control>[\w]+)/$', 'framebuzz.apps.dashboard.views.moderators_advanced', name='dashboard-moderators-advanced'),
    url(r'^moderator/queue/$', 'framebuzz.apps.dashboard.views.moderators_queue', name='dashboard-moderators-queue'),
    url(r'^moderator/comments/$', 'framebuzz.apps.dashboard.views.comment_stream', name='dashboard-comment-stream'),


    # analytics dashboard
    #url(r'^analytics', 'framebuzz.apps.dashboard.views.analytics', name='analytics'),

    # profile
    url(r'^profile/$', 'framebuzz.apps.dashboard.views.profile', name='dashboard-profile'),
    
    # settings
    url(r'^settings/edit/$', 'framebuzz.apps.dashboard.views.settings_edit', name='dashboard-settings-edit'),
    url(r'^settings/$', 'framebuzz.apps.dashboard.views.settings', name='dashboard-settings'),
    
    # websites
    url(r'^websites/add/$', 'framebuzz.apps.dashboard.views.add_websites', name='dashboard-add-websites'),
    
    # New User
    url(r'^register/$', 'framebuzz.apps.dashboard.views.register_user', name='dashboard-register'),
    # Log Out
    url(r'^logout/$', 'framebuzz.apps.dashboard.views.logout_dashboard', name='db_logout'),
    # Log In
    url(r'^login/$', 'framebuzz.apps.dashboard.views.login', name='db_login'),
    
    # Dahsboard default landing page (HAS TO BE AT THE BOTTOM)
    url(r'^$', 'framebuzz.apps.dashboard.views.publisher', name='dashboard-publisher'),
)
