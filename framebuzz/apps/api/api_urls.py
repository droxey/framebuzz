from django.conf.urls import patterns, url
from framebuzz.apps.api.api_views import VideoList

urlpatterns = patterns('',
    url(r'^videos/(?P<username>[\w.@+-]+)/$',
        VideoList.as_view(), name='video-list-api'),
)
