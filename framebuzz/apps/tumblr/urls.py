from django.conf.urls import patterns, url

urlpatterns = patterns(
    '',
    url(r'^$',
        'framebuzz.apps.tumblr.views.home',
        name='fbz-tumblr-home'),
    url(r'^dashboard/(?P<username>[\w.@+-]+)/$',
        'framebuzz.apps.tumblr.views.dashboard',
        name='fbz-tumblr-dashboard'),
)
