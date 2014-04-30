from django.conf.urls import patterns, url

urlpatterns = patterns(
    '',
    url(r'^dashboard/login/$',
        'framebuzz.apps.dashboard.views.dashboard_login',
        name='dashboard-login'),
    url(r'^dashboard/video/(?P<slug>[\w.@+-]+)/details/$',
        'framebuzz.apps.dashboard.views.video_details',
        name='dashboard-video-details'),
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
    url(r'^dashboard/videos/(?P<slug>[\w.@+-]+)/comment/reply/$',
        'framebuzz.apps.dashboard.views.post_comment_reply',
        name='dashboard-comment-reply'),
    url(r'^dashboard/comments/(?P<comment_id>[\d]+)/mark-read/$',
        'framebuzz.apps.dashboard.views.mark_comment_read',
        name='dashboard-comment-read'),
    url(r'^dashboard/comments/(?P<comment_id>[\d]+)/delete/$',
        'framebuzz.apps.dashboard.views.delete_comment',
        name='dashboard-comment-delete'),
)
