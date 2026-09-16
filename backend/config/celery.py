"""Configuración de Celery. Ver DT-05."""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

app = Celery("nutrilius")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
