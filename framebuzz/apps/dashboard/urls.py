from django.conf.urls import patterns, url

urlpatterns = patterns(
    '',
    url(r'^dashboard/(?P<username>[\w.@+-]+)/$',
        'framebuzz.apps.dashboard.views.dashboard_home',
        name='dashboard-home'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/profile/$',
        'framebuzz.apps.dashboard.views.dashboard_profile',
        name='dashboard-profile'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/videos/$',
        'framebuzz.apps.dashboard.views.dashboard_videos',
        name='dashboard-videos'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/comments/$',
        'framebuzz.apps.dashboard.views.dashboard_comments',
        name='dashboard-comments'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/settings/$',
        'framebuzz.apps.dashboard.views.dashboard_settings',
        name='dashboard-settings'),
    url(r'^dashboard/login/$',
        'framebuzz.apps.dashboard.views.dashboard_login',
        name='dashboard-login'),
)
