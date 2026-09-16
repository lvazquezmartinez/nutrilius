from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnamnesisTemplateView,
    AnamnesisViewSet,
    EvolutionViewSet,
    PatientMetricViewSet,
    PatientViewSet,
)

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="patient")
router.register("anamneses", AnamnesisViewSet, basename="anamnesis")
router.register("metrics", PatientMetricViewSet, basename="metric")
router.register("evolutions", EvolutionViewSet, basename="evolution")

urlpatterns = [
    path("anamnesis-template", AnamnesisTemplateView.as_view(), name="anamnesis-template"),
    path("", include(router.urls)),
]
