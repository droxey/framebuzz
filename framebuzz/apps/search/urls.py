from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'framebuzz.apps.search.views.search', name='fbz-search'),
)