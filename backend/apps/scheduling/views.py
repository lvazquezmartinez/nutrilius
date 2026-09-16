from rest_framework.exceptions import ValidationError

from apps.common.drf import TenantScopedModelViewSet

from .models import Visit
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
