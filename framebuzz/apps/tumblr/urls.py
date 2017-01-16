from django.conf.urls import patterns, url

urlpatterns = patterns(
    '',
    url(r'^$',
        'framebuzz.apps.tumblr.views.home',
        name='fbz-tumblr-home'),

    url(r'^dashboard/exit/$',
        'framebuzz.apps.tumblr.views.exit_login',
        name='fbz-tumblr-exit-login'),

    url(r'^dashboard/(?P<username>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.dashboard',
        name='fbz-tumblr-dashboard'),

    url(r'^video/post/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.post_to_tumblr',
        name='fbz-tumblr-post'),

    url(r'^video/edit/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.edit_video',
        name='fbz-edit-video'),

    url(r'^video/delete/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.delete_video',
        name='fbz-delete-video'),

    url(r'^video/view/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.view_video',
        name='fbz-view-video'),
)
