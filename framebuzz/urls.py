import re

from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf.urls.static import static
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

handler500 = "framebuzz.apps.marketing.views.server_error"
handler404 = "framebuzz.apps.marketing.views.server_404"

urlpatterns = patterns('',
    # Admin:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/', include(admin.site.urls)),

    # Player API:
    url(r'^v/', include('framebuzz.apps.api.urls')),

    # Login Redirect:
    url(r'^accounts/logged-in/$', 'framebuzz.apps.profiles.views.logged_in', name='logged-in'),

    # FrameBuzz User Profiles:
    url(r'^profile/', include('framebuzz.apps.profiles.urls')),

    # Django-Avatar:
    url(r'^avatar/', include('avatar.urls')),

    # Share Page:
    url(r'^share/(?P<video_id>[\w.@+-]+)/$', 'framebuzz.apps.api.views.video_share', name='video-share'),

    # Dashboard:
    url(r'^dashboard/', include('framebuzz.apps.dashboard.urls')),

    # Django-AllAuth:
    (r'^accounts/', include('allauth.urls')),
    
    # Django-Comments:
    (r'^comments/', include('django.contrib.comments.urls')),

    # Django-Activity-Stream:
    (r'^activity/', include('actstream.urls')),

    # Feedback:
    (r'^feedback/', include('feedback.urls')),

    # Zinnia:
    (r'^tinymce/', include('tinymce.urls')),
    url(r'^blog/', include('zinnia.urls')),

    # Marketing:
    url(r'^', include('framebuzz.apps.marketing.urls')),
)

def static_always(prefix, document_root, name):
    """
    Always serve static files.

    Normally Django doesn't serve static files if DEBUG is off. If we don't
    want Django to serve static files it's as simple as setting the web proxy (nginx)
    to not forward those requests.
    """
    return patterns('',
        url(r'^%s(?P<path>.*)$' % re.escape(prefix.lstrip('/')), 'django.views.static.serve', kwargs=dict(document_root=document_root), name=name),
    )

if settings.DEBUG:
    urlpatterns += static_always(settings.STATIC_URL, settings.STATIC_ROOT, name='static')
    urlpatterns += static_always(settings.MEDIA_URL, settings.MEDIA_ROOT, name='media')