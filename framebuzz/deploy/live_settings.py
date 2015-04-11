LOCAL_SETTINGS = True
from settings import *

DEBUG = False

DATABASES = {
    "default": {
        # Ends with "postgresql_psycopg2", "mysql", "sqlite3" or "oracle".
        "ENGINE": "django_postgrespool",
        # DB name or path to database file if using sqlite3.
        "NAME": "%(proj_name)s",
        # Not used with sqlite3.
        "USER": "%(proj_name)s",
        # Not used with sqlite3.
        "PASSWORD": "%(db_pass)s",
        # Set to empty string for localhost. Not used with sqlite3.
        "HOST": "127.0.0.1",
        # Set to empty string for default. Not used with sqlite3.
        "PORT": "",
    }
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTOCOL", "https")

SOCKJS_PORT = 4000

SHORT_BASE_URL = 'http://frame.bz/s/'
SHORTEN_FULL_BASE_URL = 'http://framebuzz.com/s/'

RAVEN_CONFIG = {
    'dsn': "%(sentry_dsn)s",
}

RAVENJS_DSN = "%(ravenjs_dsn)s"

EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_HOST_USER = 'framebuzz'
EMAIL_HOST_PASSWORD = 'TG2-aJq-2bV-VYa'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

CACHES = {
    'default': {
        'BACKEND': 'caching.backends.memcached.MemcachedCache',
        'LOCATION': 'localhost:11211',
        'PREFIX': 'fbz:'
    }
}

CACHE_COUNT_TIMEOUT = 60

MAINTENANCE_IGNORE_URLS = (
    r'^/admin',
    r'^/mobile'
)


ZENCODER_API_KEY = 'e990db716cb4d5b55a9ca91ceaba6c00'
ZENCODER_WEBHOOK_URL = 'http://%(live_host)s/video/notifications/'

COMPRESS_ENABLED = True

STRIPE_SECRET = "sk_live_hpL41etG4pN2AvvYkQoE2QYe"
STRIPE_PUBLISHABLE = "pk_live_ms2c3erskOLLaAPK3kULMTvZ"
ZEBRA_ENABLE_APP = True
