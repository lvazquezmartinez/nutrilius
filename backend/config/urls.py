"""URLs raíz. Cada módulo montará su router bajo /api/ a medida que se construya."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("apps.common.urls")),  # health checks
    path("api/", include("apps.identity.urls")),     # Fase 1: auth + usuarios
    path("api/", include("apps.clinical.urls")),      # Fase 2: pacientes, anamnesis, métricas, evoluciones
    path("api/", include("apps.scheduling.urls")),    # Fase 2: agenda / visitas
    path("api/", include("apps.dashboard.urls")),     # dashboard (métricas del tenant)
    path("api/", include("apps.plans.urls")),          # Fase 4: planes + IA supervisada
    # ...
]
