"""Settings de producción. Endurece seguridad; todo secreto viene del entorno."""
from .base import *  # noqa: F401,F403
from .base import env

DEBUG = False

# ALLOWED_HOSTS y CORS deben venir explícitos del entorno en prod.
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")

# ─── Seguridad (ver DS-05, DS-10) ────────────────────────
SECURE_SSL_REDIRECT = env("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=60 * 60 * 24 * 30)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Detrás de Cloudflare/Nginx: confiar en el header de proto reenviado.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ─── Storage S3-compatible (MinIO / GCS) ─────────────────
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "access_key": env("S3_ACCESS_KEY", default=""),
            "secret_key": env("S3_SECRET_KEY", default=""),
            "bucket_name": env("S3_BUCKET", default="nutrilius"),
            "endpoint_url": env("S3_ENDPOINT_URL", default=None),
            "region_name": env("S3_REGION", default=""),
            "querystring_auth": True,
        },
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
