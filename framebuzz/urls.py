import re
from django.conf.urls import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

# DjangoSEO
from rollyourown.seo.admin import register_seo_admin
from framebuzz.apps.api.seo import FbzMetadata
register_seo_admin(admin.site, FbzMetadata)


handler503 = 'maintenancemode.views.defaults.temporary_unavailable'
handler500 = "framebuzz.apps.marketing.views.server_error"
handler404 = "framebuzz.apps.marketing.views.server_404"


urlpatterns = patterns(
    '',
    # Admin:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', include(admin.site.urls)),

    # Player API:
    url(r'^v/', include('framebuzz.apps.api.urls')),

    # Django-AllAuth:
    (r'^accounts/', include('allauth.urls')),

    # Django-Avatar:
    url(r'^avatar/', include('avatar.urls')),

    # Tumblr:
    url(r'^', include('framebuzz.apps.tumblr.urls')),

    # Robots.txt:
    (r'^robots\.txt$', include('robots.urls')),

    # Zencoder completion webhook:
    url(r'^video/notifications/$',
        'framebuzz.apps.profiles.views.zencoder_webhook',
        name='video-notification'),

    # Share Page (Shared by unauthenticated user):
    url(r'^share/(?P<slug>[\w.@+-]+)/$',
        'framebuzz.apps.profiles.views.video_share',
        name='video-share'),

    # Public API:
    # url(r'^api/', include('framebuzz.apps.api.api_urls')),

    # Login Redirect:
    # url(r'^accounts/logged-in/$',
    #     'framebuzz.apps.profiles.views.logged_in', name='logged-in'),

    # FrameBuzz User Profiles:
    # url(r'^profile/', include('framebuzz.apps.profiles.urls')),

    # Share Error Page:
    # url(r'^share/(?P<slug>[\w.@+-]+)/error/$',
    #     'framebuzz.apps.profiles.views.video_share_error',
    #     name='video-share-error'),

    # Share Page (Shared by authenticated user):
    # url(r'^profile/(?P<username>[\w.@+-]+)/share/(?P<slug>[\w.@+-]+)/$',
    #     'framebuzz.apps.profiles.views.video_share',
    #     {'sync': False},
    #     name='profiles-share'),

    # url(r'^profile/(?P<username>[\w.@+-]+)/share/(?P<slug>[\w.@+-]+)/convo/(?P<convo_slug>[\w.@+-]+)/$',
    #     'framebuzz.apps.profiles.views.video_share',
    #     {'sync': False},
    #     name='profiles-convo-share'),

    # url(r'^dashboard/(?P<username>[\w.@+-]+)/share/(?P<slug>[\w.@+-]+)/viewing/(?P<convo_slug>[\w.@+-]+)/$',
    #     'framebuzz.apps.profiles.views.video_share',
    #     {'sync': True},
    #     name='dashboard-join-viewing-session'),

    # Django-Zebra:
    # url(r'zebra/',   include('zebra.urls',  namespace="zebra",  app_name='zebra')),

    # Job status:
    # url(r'^video/tile/(?P<job_id>[\d]+)/$',
    #     'framebuzz.apps.profiles.views.get_video_tile',
    #     name='get-video-tile'),

    # Search:
    # url(r'^search/', include('framebuzz.apps.search.urls')),

    # Django-Comments:
    # (r'^comments/', include('django.contrib.comments.urls')),

    # Django-Activity-Stream:
    # (r'^activity/', include('actstream.urls')),

    # Django-Shorturls:
    # ('^s/', include('shorturls.urls')),

    # Marketing:
    # url(r'^', include('framebuzz.apps.marketing.urls')),

    # Dashboard:
    # url(r'^', include('framebuzz.apps.dashboard.urls')),
)


def static_always(prefix, document_root, name):
    """
    Always serve static files.

    Normally Django doesn't serve static files if DEBUG is off. If we don't
    want Django to serve static files it's as simple as setting the web proxy
    (nginx) to not forward those requests.
    """
    return patterns(
        '',
        url(r'^%s(?P<path>.*)$' % re.escape(prefix.lstrip('/')),
            'django.views.static.serve',
            kwargs=dict(document_root=document_root), name=name),)

if settings.DEBUG:
    # Test Pages:
    urlpatterns += patterns(
        '',
        url(r'^test/not-found/$', handler404, name='test-404'),
        url(r'^test/server-error/$', handler500, name='test-500'),
        url(r'^test/maintenance/$', handler503, name='test-503'),
    )
    # Assets (CSS, JS, user-uploaded objects):
    urlpatterns += static_always(settings.STATIC_URL,
                                 settings.STATIC_ROOT, name='static')
    urlpatterns += static_always(settings.MEDIA_URL,
                                 settings.MEDIA_ROOT, name='media')
