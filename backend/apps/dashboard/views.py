"""
Dashboard del tenant: métricas agregadas reales (pacientes activos, nuevos y
turnos de hoy). Los indicadores financieros llegan con el módulo Billing (Fase 3).
"""
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.models import Patient
from apps.scheduling.models import Visit


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tenant_id = getattr(request.user, "tenant_id", None)
        empty = {
            "patients_active": 0,
            "patients_new_count": 0,
            "visits_today": [],
            "new_patients": [],
        }
        if tenant_id is None:
            return Response(empty)

        active = Patient.all_objects.filter(tenant_id=tenant_id, is_active=True)
        today = timezone.localdate()
        visits_today = (
            Visit.all_objects
            .filter(tenant_id=tenant_id, scheduled_at__date=today)
            .select_related("patient")
            .order_by("scheduled_at")
        )
        new_patients = active.filter(is_new=True).order_by("-created_at")[:5]

        return Response({
            "patients_active": active.count(),
            "patients_new_count": active.filter(is_new=True).count(),
            "visits_today": [
                {
                    "id": v.id,
                    "scheduled_at": v.scheduled_at,
                    "patient_name": v.patient.full_name,
                    "status": v.status,
                    "is_new": v.patient.is_new,
                }
                for v in visits_today
            ],
            "new_patients": [
                {"id": p.id, "name": p.full_name, "dni": p.dni, "created_at": p.created_at}
                for p in new_patients
            ],
        })
