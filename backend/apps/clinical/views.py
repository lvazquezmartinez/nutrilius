from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.audit.services import log_event
from apps.common.drf import TenantScopedModelViewSet

from .models import (
    DEFAULT_ANAMNESIS_TEMPLATE,
    Anamnesis,
    AnamnesisTemplate,
    Evolution,
    Patient,
    PatientMetric,
)
from .serializers import (
    AnamnesisSerializer,
    AnamnesisTemplateSerializer,
    EvolutionSerializer,
    PatientMetricSerializer,
    PatientSerializer,
)


class PatientViewSet(TenantScopedModelViewSet):
    queryset = Patient.all_objects.all()
    serializer_class = PatientSerializer
    filterset_fields = ["is_active", "is_new"]
    search_fields = ["first_name", "last_name", "dni"]
    filter_backends = TenantScopedModelViewSet.filter_backends + [SearchFilter]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        log_event(AuditEvent.Action.PATIENT_CREATED, actor=self.request.user,
                  entity="Patient", entity_id=serializer.instance.id, request=self.request)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        # Auditoría de acceso de lectura a datos clínicos (RNF-03 / DS-02).
        log_event(AuditEvent.Action.CLINICAL_READ, actor=request.user,
                  entity="Patient", entity_id=kwargs.get("pk"), request=request)
        return response

    def destroy(self, request, *args, **kwargs):
        # Baja lógica (RF-08): no se borra, se desactiva.
        patient = self.get_object()
        patient.is_active = False
        patient.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def reactivate(self, request, pk=None):
        patient = self.get_object()
        patient.is_active = True
        patient.save(update_fields=["is_active"])
        return Response(self.get_serializer(patient).data)


class _PatientChildViewSet(TenantScopedModelViewSet):
    """Base para recursos colgados de un paciente (anamnesis, métricas, evoluciones)."""
    filterset_fields = ["patient"]

    def perform_create(self, serializer):
        patient = serializer.validated_data.get("patient")
        if patient is None or patient.tenant_id != self.get_tenant_id():
            raise ValidationError({"patient": "Paciente inválido para este consultorio."})
        super().perform_create(serializer)


class AnamnesisViewSet(_PatientChildViewSet):
    queryset = Anamnesis.all_objects.all()
    serializer_class = AnamnesisSerializer


class PatientMetricViewSet(_PatientChildViewSet):
    queryset = PatientMetric.all_objects.all()
    serializer_class = PatientMetricSerializer


class EvolutionViewSet(_PatientChildViewSet):
    queryset = Evolution.all_objects.all()
    serializer_class = EvolutionSerializer


class AnamnesisTemplateView(APIView):
    """Plantilla de anamnesis del tenant (RF-11/12): get / put / reset."""
    permission_classes = [IsAuthenticated]

    def _get_or_create(self, tenant_id):
        template, _ = AnamnesisTemplate.all_objects.get_or_create(
            tenant_id=tenant_id, defaults={"template_json": DEFAULT_ANAMNESIS_TEMPLATE}
        )
        return template

    def get(self, request):
        template = self._get_or_create(request.user.tenant_id)
        return Response(AnamnesisTemplateSerializer(template).data)

    def put(self, request):
        template = self._get_or_create(request.user.tenant_id)
        serializer = AnamnesisTemplateSerializer(template, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def post(self, request):
        # reset a la plantilla por defecto
        template = self._get_or_create(request.user.tenant_id)
        template.template_json = DEFAULT_ANAMNESIS_TEMPLATE
        template.save(update_fields=["template_json", "updated_at"])
        return Response(AnamnesisTemplateSerializer(template).data)
