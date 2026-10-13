"""
Django settings for Hadi88 Apps project.
"Find and ask for your dreaming apps"
"We are building app on your demand"
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-hadi88-apps-secure-production-key-2026')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

# Reverse Proxy & Cloudflare SSL / HTTPS Header Trust
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# CSRF Trusted Origins - Allow Cloudflare custom domains, wildcards, and local tunnels
CSRF_TRUSTED_ORIGINS = [
    'https://*.uqn88.store',
    'https://uqn88.store',
    'http://*.uqn88.store',
    'http://uqn88.store',
    'https://*.trycloudflare.com',
    'https://*.run.app',
    'https://*.github.dev',
    'https://*.app.github.dev',
    'https://*.ngrok-free.app',
    'https://*.loca.lt',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://0.0.0.0:8000',
]
# If additional domains are passed via environment
custom_domain = os.environ.get('CUSTOM_DOMAIN', '').strip()
if custom_domain:
    if not custom_domain.startswith('http'):
        CSRF_TRUSTED_ORIGINS.extend([f"https://{custom_domain}", f"http://{custom_domain}"])
    else:
        CSRF_TRUSTED_ORIGINS.append(custom_domain)

# Cookie security - avoid blocking logins through reverse proxies
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Hadi88 Apps Core Store application
    'store.apps.StoreConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'store.middleware.DynamicCsrfTrustedOriginsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Support logging in with either username or email address
AUTHENTICATION_BACKENDS = [
    'store.backends.EmailOrUsernameBackend',
    'django.contrib.auth.backends.ModelBackend',
]

ROOT_URLCONF = 'appstore_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'appstore_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# WhiteNoise settings for ultra-reliable static delivery without 404s
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True
WHITENOISE_STATIC_PREFIX = '/static/'

# Media files (Uploaded APKs, Icons, Banners)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary Storage Integration (Safe Mode & Cloud Media Backup)
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '').strip()
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '').strip()
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '').strip()

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': CLOUDINARY_CLOUD_NAME,
        'API_KEY': CLOUDINARY_API_KEY,
        'API_SECRET': CLOUDINARY_API_SECRET,
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

LOGIN_URL = '/admin/manage/login/'
LOGIN_REDIRECT_URL = '/admin/manage/'
LOGOUT_REDIRECT_URL = '/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Store pagination requirement: Exactly 18 apps per page
APPS_PER_PAGE = 18
DATA_UPLOAD_MAX_MEMORY_SIZE = 150 * 1024 * 1024  # 150 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 150 * 1024 * 1024
