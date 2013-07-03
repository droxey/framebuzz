from django.conf.urls import include, patterns, url
from rest_framework.urlpatterns import format_suffix_patterns
from framebuzz.apps.api import views

urlpatterns = format_suffix_patterns(patterns('',
    # Root:
    url(r'^$', views.api_root, name='api-root'),

    # Comments:
    url(r'^comments/$', views.MPTTCommentList.as_view(), name='mpttcomments-list'),
    url(r'^comments/(?P<video_id>[\w.@+-]+)/$', views.MPTTCommentList.as_view(), name='mpttcomments-video-list'),

    # Actions:
    url(r'^actions/$', views.CommentActionList.as_view(), name='actions-list'),
    url(r'^actions/user/(?P<username>[\w]+)/$', views.CommentActionList.as_view(), name='actions-user-list'),
    url(r'^actions/comment/(?P<comment_id>[\d]+)/$', views.CommentActionList.as_view(), name='actions-comment-list'),
))

# Login and logout views for the browsable API.
urlpatterns += patterns('',    
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
)