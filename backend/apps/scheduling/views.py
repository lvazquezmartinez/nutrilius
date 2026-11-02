import datetime

from django.db.models import Max
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.clinical.models import Patient
from apps.common.drf import TenantScopedModelViewSet

from .models import Visit, VisitStatus
from .serializers import VisitSerializer


class VisitViewSet(TenantScopedModelViewSet):
    queryset = Visit.all_objects.all()
    serializer_class = VisitSerializer
    filterset_fields = ["patient", "status"]

    def get_queryset(self):
        qs = super().get_queryset()
        # Agenda global (HU-11): filtrado por rango de fechas ?from=&to= (YYYY-MM-DD).
        date_from = self.request.query_params.get("from")
        date_to = self.request.query_params.get("to")
        if date_from:
            qs = qs.filter(scheduled_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(scheduled_at__date__lte=date_to)
        return qs.order_by("scheduled_at")

    @action(detail=False, methods=["get"], url_path="inactive-patients")
    def inactive_patients(self, request):
        """
        HU-16: pacientes activos sin turnos en los últimos N días (?days=, default 60).
        Un paciente sale del listado apenas vuelve a tener un turno (su último turno
        pasa a ser más reciente que el corte). Solo pacientes que ya tuvieron turnos.
        """
        try:
            days = int(request.query_params.get("days", 60))
        except ValueError:
            days = 60
        cutoff = timezone.now() - datetime.timedelta(days=days)
        tenant_id = self.get_tenant_id()
        inactive = (
            Patient.all_objects.filter(tenant_id=tenant_id, is_active=True)
            .annotate(last_visit=Max("visits__scheduled_at"))
            .filter(last_visit__isnull=False, last_visit__lt=cutoff)
            .order_by("last_visit")
        )
        data = [{
            "id": p.id, "name": p.full_name, "dni": p.dni,
            "last_visit": p.last_visit.isoformat() if p.last_visit else None,
        } for p in inactive]
        return Response({"days": days, "count": len(data), "patients": data})

    def perform_create(self, serializer):
        patient = serializer.validated_data.get("patient")
        if patient is None or patient.tenant_id != self.get_tenant_id():
            raise ValidationError({"patient": "Paciente inválido para este consultorio."})
        super().perform_create(serializer)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        visit = self.get_object()
        visit.status = VisitStatus.CANCELLED
        visit.cancelled_at = timezone.now()
        visit.save(update_fields=["status", "cancelled_at", "updated_at"])
        return Response(self.get_serializer(visit).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        visit = self.get_object()
        visit.status = VisitStatus.COMPLETED
        notes = request.data.get("notes")
        fields = ["status", "updated_at"]
        if notes is not None:
            visit.notes = notes
            fields.append("notes")
        visit.save(update_fields=fields)
        return Response(self.get_serializer(visit).data)
