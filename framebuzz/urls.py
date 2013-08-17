from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Admin:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),

    # Player API:
    url(r'^v/', include('framebuzz.apps.api.urls')),

    # Login Redirect:
    url(r'^accounts/logged-in/$', 'framebuzz.apps.profiles.views.logged_in', name='logged-in'),

    # FrameBuzz User Profiles:
    url(r'^profile/', include('framebuzz.apps.profiles.urls')),

    # Django-Avatar:
    url(r'^avatar/', include('avatar.urls')),

    # Test Page for Beta:
    url(r'^test/(?P<video_id>[\w.@+-]+)/$', 'framebuzz.apps.api.views.video_test', name='video-test'),

    url(r'^share/(?P<video_id>[\w.@+-]+)/$', 'framebuzz.apps.api.views.video_share', name='video-share'),

    # Dashboard:
    url(r'^dashboard/', include('framebuzz.apps.dashboard.urls')),

    # Django-AllAuth:
    (r'^accounts/', include('allauth.urls')),
    
    # Django-Comments:
    (r'^comments/', include('django.contrib.comments.urls')),

    # Marketing:
    url(r'^', include('framebuzz.apps.marketing.urls')),
)

if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT)
