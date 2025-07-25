import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-super-secret-key-please-change-me')

DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:9002',
    'https://8000-firebase-studio-1751602882361.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev',
    'https://8000-firebase-studio-1752348677490.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev',
    'https://3000-firebase-studio-1752348677490.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev'
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'salon',
    'django_filters',
    'storages', # Add django-storages
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:9002',
    'https://3000-firebase-studio-1752348677490.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev',
]
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'glowapp_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'glowapp_backend.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'postgresql://user:password@host:port/dbname'),
        conn_max_age=600
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles') # Add STATIC_ROOT for collectstatic

# Supabase Storage Configuration
# Set these environment variables in your .env file
AWS_S3_ENDPOINT_URL = os.environ.get('SUPABASE_S3_ENDPOINT_URL')
AWS_ACCESS_KEY_ID = os.environ.get('SUPABASE_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('SUPABASE_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('SUPABASE_STORAGE_BUCKET_NAME')
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None # Or 'public-read' if you want files to be publicly accessible by default
AWS_S3_SIGNATURE_VERSION = 's3v4'
AWS_QUERYSTRING_AUTH = False # Set to False if you want clean URLs without query parameters

# Use S3Boto3Storage for default file storage (for media files like images)
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
if AWS_STORAGE_BUCKET_NAME:
    MEDIA_URL = f'https://{AWS_S3_ENDPOINT_URL.split("://")[1]}/{AWS_STORAGE_BUCKET_NAME}/'
else:
    MEDIA_URL = '/media/'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'salon.User'

REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Email Backend Configuration for Development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:9002')
DEFAULT_FROM_EMAIL = 'no-reply@glowapp.com'
