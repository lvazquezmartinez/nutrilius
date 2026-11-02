"""Rutas del módulo de planes + IA supervisada."""
from rest_framework.routers import DefaultRouter

from .views import NutritionPlanViewSet, PatientConsentViewSet

router = DefaultRouter()
router.register("plans", NutritionPlanViewSet, basename="plan")
router.register("consents", PatientConsentViewSet, basename="consent")

urlpatterns = router.urls
