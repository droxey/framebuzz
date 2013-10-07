from django.conf import settings

DEFAULT_SETTINGS = {
    'MANAGEMENT_ADDRS': [],
    'SECRET': '',
    'WATCHED_MODELS': [],
    'THREADED': False,
}

USER_SETTINGS = DEFAULT_SETTINGS.copy()

USER_SETTINGS.update(getattr(settings, 'VARNISH_SETTINGS', {}))
if isinstance(USER_SETTINGS['MANAGEMENT_ADDRS'], basestring):
    USER_SETTINGS['MANAGEMENT_ADDRS'] = [USER_SETTINGS['MANAGEMENT_ADDRS']]

globals().update(USER_SETTINGS)
