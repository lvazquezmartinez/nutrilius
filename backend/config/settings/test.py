"""Settings para tests: rápidos y sin dependencias externas."""
from .dev import *  # noqa: F401,F403

# Hasher rápido (los tests no necesitan PBKDF2).
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Email en memoria; Celery síncrono.
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
CELERY_TASK_ALWAYS_EAGER = True

# Cache local en memoria (no depende de Redis para correr tests).
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
