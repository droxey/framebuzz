from django.conf.urls.defaults import patterns
from .manager import VarnishManager


urlpatterns = patterns('varnishapp.views',
    (r'', 'management'),
)
