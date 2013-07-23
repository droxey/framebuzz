from django.conf.urls.defaults import *

urlpatterns = patterns('',
    # publisher dashboard
    url(r'^publisher', 'framebuzz.apps.dashboard.views.publisher', name='publisher'),

    # video dashboard
    url(r'^videos-fbuzz-one', 'framebuzz.apps.dashboard.views.videos_fbvideo', name='videos-fbuzz-one'),
    url(r'^videos', 'framebuzz.apps.dashboard.views.videos', name='videos'),

    # moderator dashboard 
    url(r'^moderator-basic', 'framebuzz.apps.dashboard.views.moderators_basic', name='moderator-basic'),
    url(r'^moderator-advanced', 'framebuzz.apps.dashboard.views.moderators_advanced', name='moderator-advanced'),
    url(r'^moderator', 'framebuzz.apps.dashboard.views.moderators', name='moderator'),

    # analytics dashboard
    #url(r'^analytics', 'framebuzz.apps.dashboard.views.analytics', name='analytics'),

    # profile
    url(r'^profile', 'framebuzz.apps.dashboard.views.profile', name='profile'),
    # settings
    url(r'^settings', 'framebuzz.apps.dashboard.views.settings', name='settings'),
    
    # New User
    url(r'^register', 'framebuzz.apps.dashboard.views.registerUser', name='register'),
    # Log Out
    url(r'^logout', 'framebuzz.apps.dashboard.views.logout_dashboard', name='db_logout'),
    # Log In
    url(r'^login', 'framebuzz.apps.dashboard.views.login', name='db_login'),
    
    # Dahsboard default landing page (HAS TO BE AT THE BOTTOM)
    url(r'^', 'framebuzz.apps.dashboard.views.publisher', name='publisher'),
)
