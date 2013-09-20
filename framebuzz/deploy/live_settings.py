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


#CACHE_MIDDLEWARE_SECONDS = 60

#CACHE_MIDDLEWARE_KEY_PREFIX = "%(proj_name)s"

#CACHES = {
#    "default": {
#        "BACKEND": "django.core.cache.backends.memcached.MemcachedCache",
#        "LOCATION": "127.0.0.1:11211",
#    }
#}

#SESSION_ENGINE = "django.contrib.sessions.backends.cache"

SHORT_BASE_URL = 'http://frame.bz/s/'
SHORTEN_FULL_BASE_URL = 'http://framebuzz.com/s/'

RAVEN_CONFIG = {
    'dsn': 'https://b14b841441f348b2bd29aa34c79948fb:8ad5006d4856408fad7cf735e0498315@app.getsentry.com/11190',
}

EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_HOST_USER = 'framebuzz'
EMAIL_HOST_PASSWORD = 'TG2-aJq-2bV-VYa'
EMAIL_PORT = 587
EMAIL_USE_TLS = True