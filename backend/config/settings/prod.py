"""Settings de producción. Endurece seguridad; todo secreto viene del entorno."""
from .base import *  # noqa: F401,F403
from .base import env

DEBUG = False

# ALLOWED_HOSTS y CORS deben venir explícitos del entorno en prod.
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")

# Sin broker Celery en serverless: las tareas de email corren sincrónicas en el
# request (envío por SMTP). Migración a Cloud Tasks = deuda técnica pendiente.
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = False

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

# ─── Storage: Google Cloud Storage (DT-08) ───────────────
# Bucket privado; los binarios (logos, PDFs) se sirven con URLs firmadas (RNF-05).
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {
            "bucket_name": env("GS_BUCKET_NAME"),
            "default_acl": None,
            "querystring_auth": True,
        },
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
