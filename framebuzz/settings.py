from django.conf import global_settings
import djcelery

djcelery.setup_loader()

DEBUG = True
TEMPLATE_DEBUG = True
SENTRY_TESTING = True


ADMINS = (
    ('Dani Roxberry', 'dani@framebuzz.com'),
)

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
    os.path.join(STATIC_ROOT, 'framebuzz'),
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
    "django.core.context_processors.request",

    #"core.context_processors.view_playlist_processor",

    "allauth.account.context_processors.account",
    "allauth.socialaccount.context_processors.socialaccount",
)

CSRF_COOKIE_NAME = "XSRF-TOKEN"

MIDDLEWARE_CLASSES = (
    'raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware',
    'framebuzz.libs.middleware.angular.AngularCSRFRename',

    #'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    
    # Uncomment the next line for simple clickjacking protection:
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    #'debug_toolbar.middleware.DebugToolbarMiddleware',
    #'django.middleware.cache.FetchFromCacheMiddleware',

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
    'suit',
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

    # FrameBuzz Apps
    'framebuzz.apps.api',
    'framebuzz.apps.dashboard',
)

SUIT_CONFIG = {
    'ADMIN_NAME': 'FrameBuzz Administration',
    'HEADER_DATE_FORMAT': 'l, j. F Y',
    'HEADER_TIME_FORMAT': 'H:i',
    'SEARCH_URL': '/admin/auth/user/',
    'MENU_ICONS': {
       'sites': 'icon-leaf',
       'auth': 'icon-lock',
    },
    'MENU_OPEN_FIRST_CHILD': True, # Default True
    'MENU_EXCLUDE': ('auth.group',),
    'MENU': (
        'sites',
        {'app': 'auth', 'icon':'icon-lock', 'models': ('user', 'group')},
        {'label': 'Settings', 'icon':'icon-cog', 'models': ('auth.user', 'auth.group')},
        {'label': 'Support', 'icon':'icon-question-sign', 'url': '/support/'},
    ),
    'LIST_PER_PAGE': 15
}

RAVEN_CONFIG = {
    'dsn': 'http://5e4cbec779b04c95b3205f6761067259:2c47d0821534415e9d7cb83550262298@192.227.139.190/3',
}

ACTSTREAM_SETTINGS = {
    'MODELS': (
        'auth.user',
        'core.MPTTComment',
        'core.Video',
        'allauth.EmailAddress',
        'allauth.EmailConfirmation',
        'allauth.SocialAccount',
    ),
    #'MANAGER': 'dashboard.managers.FrameBuzzActionManager',
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
YOUTUBE_API_KEY_SERVER = 'AIzaSyBBonEalPwFZpHppjN1l54cFSLGw3j1Vi4'

# Django-Pure-Pagination Settings:
PAGINATION_SETTINGS = {
    'PAGE_RANGE_DISPLAYED': 5,
    'MARGIN_PAGES_DISPLAYED': 0,
}

# Django-AllAuth Settings:
AUTH_PROFILE_MODULE = 'core.UserProfile'
ACCOUNT_ACTIVATION_DAYS = 7
LOGIN_REDIRECT_URL = '/index/'

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = ("optional",)
ACCOUNT_LOGOUT_ON_GET = True
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

# Django-Avatar Settings:
AVATAR_DEFAULT_URL = os.path.join(MEDIA_ROOT, 'img/user-icon-large.jpg')
AVATAR_ALLOWED_FILE_EXTS = ['.jpg', '.png']
AUTO_GENERATE_AVATAR_SIZES = (100, 88, 50, 44,)

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
    'following-notification':'FrameBuzz: New Follower!',
    'passwordchange-notification':'FrameBuzz: Password Reset Requested',
    'reply-notification':'FrameBuzz: New Comment Reply!',
    'welcome-newuser':'FrameBuzz: Welcome!',
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