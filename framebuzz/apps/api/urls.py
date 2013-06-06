from django.conf.urls import include, patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from framebuzz.apps.api import views

urlpatterns = format_suffix_patterns(patterns('',
    # Root:
    url(r'^$', views.api_root, name='api-root'),

    # Comments:
    url(r'^comments/$', views.MPTTCommentList.as_view(), name='mpttcomments-list'),
    url(r'^comments/(?P<video_id>[\w.@+-]+)/$', views.MPTTCommentList.as_view(), name='mpttcomments-video-list'),

    url(r'^(?P<section_type>[\w]+)/(?P<result_id>[\w.@+-]+)/$', 'framebuzz.apps.api.views.view_content', name='view-content'),
))

# Login and logout views for the browsable API.
urlpatterns += patterns('',    
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
)