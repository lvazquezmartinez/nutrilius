"""Rutas públicas (sin login) del módulo de planes — acceso al PDF por token (HU-15)."""
from django.urls import path

from .views import PublicPlanPDFView

urlpatterns = [
    path("plan/<str:token>/pdf", PublicPlanPDFView.as_view(), name="public-plan-pdf"),
]
