from django.conf import settings
from django.core.cache import cache

from micawber.providers import bootstrap_basic as _bootstrap_basic
from micawber.providers import Provider


def bootstrap_framebuzz(cached=None, registry=None, **params):
    pr = _bootstrap_basic(cache)
    pr.register('https://framebuzz.com/v\/\S*/', Provider('https://framebuzz.com/oembed/', **params))
    return pr
