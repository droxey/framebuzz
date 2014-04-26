from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^dashboard/(?P<username>[\w.@+-]+)/$',
        'framebuzz.apps.dashboard.views.dashboard_home',
        name='dashboard-home'),
)
