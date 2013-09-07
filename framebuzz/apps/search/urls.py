from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'framebuzz.apps.search.views.search', name='fbz-search'),
    url(r'^users/$', 'framebuzz.apps.search.views.search_users', name='search-users'),
    url(r'^videos/$', 'framebuzz.apps.search.views.search_videos', name='search-videos'),
    url(r'^conversations/$', 'framebuzz.apps.search.views.search_conversations', name='search-conversations'),
)
