from django.conf.urls import patterns, url

urlpatterns = patterns(
    '',
    url(r'^$',
        'framebuzz.apps.tumblr.views.home',
        name='fbz-tumblr-home'),
    url(r'^exit/$',
        'framebuzz.apps.tumblr.views.exit_login',
        name='fbz-tumblr-exit-login'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.dashboard',
        name='fbz-tumblr-dashboard'),
)
