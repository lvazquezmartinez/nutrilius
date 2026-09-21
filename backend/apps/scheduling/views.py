from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.common.drf import TenantScopedModelViewSet

from .models import Visit, VisitStatus
from .serializers import VisitSerializer


class VisitViewSet(TenantScopedModelViewSet):
    queryset = Visit.all_objects.all()
    serializer_class = VisitSerializer
    filterset_fields = ["patient", "status"]

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
