from django.conf import global_settings
import djcelery

djcelery.setup_loader()

DEBUG = True
TEMPLATE_DEBUG = True
SENTRY_TESTING = True


ADMINS = (
    ('Dani Roxberry', 'dani@framebuzz.com'),
)

ALLOWED_HOSTS = ['127.0.0.1', '0.0.0.0', 'localhost', 'framebuzz.com', 'frame.bz',]

MANAGERS = ADMINS

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True


#############
# DATABASES #
#############

DATABASES = {
    "default": {
        # Add "postgresql_psycopg2", "mysql", "sqlite3" or "oracle".
        "ENGINE": "django.db.backends.",
        # DB name or path to database file if using sqlite3.
        "NAME": "",
        # Not used with sqlite3.
        "USER": "",
        # Not used with sqlite3.
        "PASSWORD": "",
        # Set to empty string for localhost. Not used with sqlite3.
        "HOST": "",
        # Set to empty string for default. Not used with sqlite3.
        "PORT": "",
    }
}

SOUTH_DATABASE_ADAPTERS = {
    'default': 'south.db.postgresql_psycopg2'
}

DATABASE_POOL_ARGS = {
    'max_overflow': 10,
    'pool_size': 5,
    'recycle': 300
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}


#########
# PATHS #
#########

import os

ENVIRONMENT = os.environ

# http://morethanseven.net/2009/02/11/django-settings-tip-setting-relative-paths.html
SITE_ROOT = os.path.dirname(os.path.realpath(__file__))

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.path.join(SITE_ROOT, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(SITE_ROOT, 'static')

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django_mobile.loader.Loader',
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(SITE_ROOT, 'templates'),
)

TEMPLATE_CONTEXT_PROCESSORS = global_settings.TEMPLATE_CONTEXT_PROCESSORS + (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.i18n',
    'django.core.context_processors.request',
    'django.core.context_processors.media',

    'zinnia.context_processors.version',

    'django_mobile.context_processors.flavour',

    "allauth.account.context_processors.account",
    "allauth.socialaccount.context_processors.socialaccount",
)

MIDDLEWARE_CLASSES = (
    'raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware',

    #'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',

    #'tracking.middleware.VisitorTrackingMiddleware',
    #'tracking.middleware.VisitorCleanUpMiddleware',
    #'tracking.middleware.BannedIPMiddleware',

    # Uncomment the next line for simple clickjacking protection:
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    #'debug_toolbar.middleware.DebugToolbarMiddleware',
    #'django.middleware.cache.FetchFromCacheMiddleware',

    'django_mobile.middleware.MobileDetectionMiddleware',
    'django_mobile.middleware.SetFlavourMiddleware',

    'watson.middleware.SearchContextMiddleware',
    'framebuzz.libs.middleware.timezone.TimezoneMiddleware',
)

ROOT_URLCONF = 'framebuzz.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'framebuzz.wsgi.application'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'xpw$&amp;h&amp;8l-qjfyw7n!=x&amp;-q%8r#!o4$&amp;@*6=xur+5s$p*xphe9'

AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",

    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)

SESSION_ENGINE = 'redis_sessions.session'

INSTALLED_APPS = (
    # Django Apps
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'django.contrib.comments',

    # Admin Apps
    'grappelli',
    'django.contrib.admin',
    'django.contrib.admindocs',

    # Auth Apps
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.twitter',

    # Helper Apps
    'rest_framework',
    'south',
    'gunicorn',
    'avatar',
    'actstream',
    'pure_pagination',
    'templated_email',
    'djcelery',
    'djcelery_email',
    'compressor',
    'raven.contrib.django.raven_compat',
    'django_sockjs_tornado',
    'addendum',
    'feedback',
    'shorturls',
    #'tracking',
    'watson',
    'django_mobile',

    # Required by Zinnia
    'tinymce',
    'tagging',
    'mptt',
    'zinnia_bootstrap',
    'zinnia',

    # FrameBuzz Apps
    'framebuzz.apps.api',
    'framebuzz.apps.dashboard',
    'framebuzz.apps.profiles',
    'framebuzz.apps.marketing',
    'framebuzz.apps.search',
)

# Django-Grappelli:
GRAPPELLI_ADMIN_TITLE = 'FrameBuzz'

ACTSTREAM_SETTINGS = {
    'MODELS': (
        'auth.user',
        'api.MPTTComment',
        'api.Video',
        'api.UserVideo',
        'allauth.EmailAddress',
        'allauth.EmailConfirmation',
        'allauth.SocialAccount',
    ),
    'MANAGER': 'framebuzz.apps.api.managers.FrameBuzzActionManager',
    'FETCH_RELATIONS': True,
    'USE_PREFETCH': True,
    'USE_JSONFIELD': True,
}

# Django-Compressor Settings:
COMPRESS_ENABLED = True
COMPRESS_URL = STATIC_URL
COMPRESS_ROOT = STATIC_ROOT

# django.contrib.comments settings:
COMMENTS_APP = 'framebuzz.apps.api'
COMMENT_MAX_LENGTH = 180
COMMENTS_HIDE_REMOVED = True

# YouTube API settings:
YOUTUBE_API_KEY_SERVER = 'AIzaSyAlewN5xsMyEFB7x7BSbC670d7-jFsX21o'

# Django-Pure-Pagination Settings:
PAGINATION_SETTINGS = {
    'PAGE_RANGE_DISPLAYED': 5,
    'MARGIN_PAGES_DISPLAYED': 0,
}

# Django-AllAuth Settings:
AUTH_PROFILE_MODULE = 'api.UserProfile'
ACCOUNT_ACTIVATION_DAYS = 7
LOGIN_REDIRECT_URL = '/accounts/logged-in/'

ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_EMAIL_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = ("optional",)
ACCOUNT_LOGOUT_ON_GET = True
ACCOUNT_UNIQUE_EMAIL = False

SOCIALACCOUNT_PROVIDERS = {
    'facebook': {
        'SCOPE': ['email', 'publish_stream'],
        'FB_LOGIN': {'auth_type': 'reauthenticate'},
        'METHOD': 'js_sdk'
    },
    'twitter': {
        'SCOPE': ['r_emailaddress']
    },
    'google': {
        'SCOPE': [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://gdata.youtube.com'
        ]
    }
}

# Django-Tracking:
NO_TRACKING_PREFIXES = ['/admin/',]

# Django-Avatar Settings:
AVATAR_ALLOWED_FILE_EXTS = ['.jpg', '.png']
AUTO_GENERATE_AVATAR_SIZES = (354, 110, 66, 58, 40,)
AVATAR_GRAVATAR_BASE_URL = 'http://robohash.org'

# Email Settings:
EMAIL_BACKEND = 'djcelery_email.backends.CeleryEmailBackend'
TEMPLATED_EMAIL_BACKEND = 'templated_email.backends.vanilla_django.TemplateBackend'

EMAIL_HOST = 'localhost'
EMAIL_HOST_PASSWORD = ''
EMAIL_HOST_USER = ''
EMAIL_PORT = 25
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = 'info@framebuzz.com'

TEMPLATED_EMAIL_DJANGO_SUBJECTS = {
    'favorites-notification':'FrameBuzz: New Favorite!',
    'following-notification':'You have a new fan on FrameBuzz.',
    'passwordchange-notification':'FrameBuzz: Password Reset Requested',
    'reply-notification':'FrameBuzz: New Comment Reply!',
    'welcome-newuser':'Thanks for joining FrameBuzz.',
    'share-email': 'FrameBuzz: Check out this video!'
}

# Django-Celery Settings:
BROKER_URL = 'redis://localhost:6379/0'
BROKER_TRANSPORT_OPTIONS = {'visibility_timeout': 43200}
CELERY_DISABLE_RATE_LIMITS = True

# Django-Celery-Email Settings:
CELERY_EMAIL_TASK_CONFIG = {
    'name': 'djcelery_email_send',
    'ignore_result': True,
}

# Django-Shorturls:
SHORTEN_MODELS = {
    'v': 'api.Video',
}

SHORT_BASE_URL = 'http://localhost:9999/s/'
SHORTEN_FULL_BASE_URL = 'http://localhost:9999/s/'
#SHORTURLS_DEFAULT_CONVERTER = 'shorturls.baseconv.base32'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'standard': {
            'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            'datefmt' : "%d/%b/%Y %H:%M:%S"
        },
    },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
        },
        'console':{
            'level':'INFO',
            'class':'logging.StreamHandler',
            'formatter': 'standard'
        },
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers':['console', 'sentry'],
            'propagate': True,
            'level':'WARN',
        },
        'django.db.backends': {
            'handlers': ['console', 'sentry'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console', 'sentry'],
            'propagate': False,
        },
        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['console', 'sentry'],
            'propagate': False,
        },
    }
}

#Django-debug-toolbar
INTERNAL_IPS = ('127.0.0.1',)
DEBUG_TOOLBAR_CONFIG = {
    'INTERCEPT_REDIRECTS': False,
}

SOCKJS_PORT = 4000
SOCKJS_CHANNEL = 'echo'
SOCKJS_CLASSES = (
    'framebuzz.apps.api.sockserver.ConnectionHandler',
)

## Dashboard
LOGIN_URL = '/accounts/login/'

SHARE_COUNT_URLS = {
#    'facebook': 'https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url=%27%s%27&callback=?',
    'facebook': 'http://api.ak.facebook.com/restserver.php?v=1.0&method=links.getStats&urls=%s&format=json',
    'google': 'https://plusone.google.com/_/+1/fastbutton?url=%s&count=true',
    'twitter': 'http://cdn.api.twitter.com/1/urls/count.json?url=%s&callback=?',
}


###################
# DEPLOY SETTINGS #
###################

# These settings are used by the default fabfile.py provided.
# Check fabfile.py for defaults.

# FABRIC = {
#     "SSH_USER": "", # SSH username
#     "SSH_PASS":  "", # SSH password (consider key-based authentication)
#     "SSH_KEY_PATH":  "", # Local path to SSH key file, for key-based auth
#     "HOSTS": [], # List of hosts to deploy to
#     "VIRTUALENV_HOME":  "", # Absolute remote path for virtualenvs
#     "PROJECT_NAME": "", # Unique identifier for project
#     "REQUIREMENTS_PATH": "", # Path to pip requirements, relative to project
#     "GUNICORN_PORT": 8000, # Port gunicorn will listen on
#     "LOCALE": "en_US.UTF-8", # Should end with ".UTF-8"
#     "LIVE_HOSTNAME": "www.example.com", # Host for public site.
#     "REPO_URL": "", # Git or Mercurial remote repo URL for the project
#     "DB_PASS": "", # Live database password
#     "ADMIN_PASS": "", # Live admin user password
# }


##################
# LOCAL SETTINGS #
##################

# Allow any settings to be defined in local_settings.py which should be
# ignored in your version control system allowing for settings to be
# defined per machine.
try:
    from local_settings import *
except ImportError:
    pass