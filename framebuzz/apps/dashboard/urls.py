from django.conf.urls import patterns, url, include

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
    url(r'^dashboard/(?P<username>[\w.@+-]+)/videos/$',
        'framebuzz.apps.dashboard.views.dashboard_videos',
        name='dashboard-videos'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/users/$',
        'framebuzz.apps.dashboard.views.dashboard_user_list',
        name='dashboard-user-list'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/uploads/$',
        'framebuzz.apps.dashboard.views.dashboard_uploads',
        name='dashboard-uploads'),
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
    url(r'^dashboard/video/(?P<slug>[\w.@+-]+)/delete/$',
        'framebuzz.apps.dashboard.views.delete_video',
        name='dashboard-delete-video'),
    url(r'^dashboard/video/(?P<slug>[\w.@+-]+)/play/$',
        'framebuzz.apps.dashboard.views.play_video',
        name='dashboard-play-video'),
    url(r'^dashboard/video/(?P<slug>[\w.@+-]+)/change-password/$',
        'framebuzz.apps.dashboard.views.change_video_password',
        name='dashboard-change-video-password'),
    url(r'^dashboard/video/(?P<slug>[\w.@+-]+)/change-notifications/$',
        'framebuzz.apps.dashboard.views.change_video_notifications',
        name='dashboard-change-video-notifications'),

    # Tasks:
    url(r'^dashboard/(?P<username>[\w.@+-]+)/tasks/$',
        'framebuzz.apps.dashboard.views.dashboard_task_list',
        name='tasks-list'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/tasks/create/$',
        'framebuzz.apps.dashboard.views.dashboard_create_task',
        name='tasks-create'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/tasks/(?P<slug>[-\w]+)/$',
        'framebuzz.apps.dashboard.views.dashboard_task_detail',
        name='tasks-detail'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/tasks/(?P<slug>[-\w]+)/delete/$',
        'framebuzz.apps.dashboard.views.dashboard_task_delete',
        name='tasks-delete'),
)
