"""
API del módulo de planes + IA supervisada (HU-13).

Flujo expuesto: crear plan → `generate` (motor de reglas → IA → validación → BORRADOR_IA)
→ editar → `submit` → `approve` (gate profesional) → `share` / `revoke-share`.
Todo con scope por tenant (un plan de otro consultorio responde 404).
"""
import secrets

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.models import AuditEvent
from apps.audit.services import log_event
from apps.common.drf import TenantScopedModelViewSet

from .models import NutritionPlan, PlanGoal, PatientConsent
from .serializers import (
    NutritionPlanSerializer, PatientConsentSerializer, PlanGenerationSerializer,
)
from .services import generation
from .services.rules import DEFAULT_ACTIVITY, ACTIVITY_FACTORS


class NutritionPlanViewSet(TenantScopedModelViewSet):
    queryset = NutritionPlan.objects.all()
    serializer_class = NutritionPlanSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient = self.request.query_params.get("patient")
        return qs.filter(patient_id=patient) if patient else qs

    @action(detail=True, methods=["post"])
    def generate(self, request, pk=None):
        """Corre el pipeline de IA supervisada sobre el plan (RF-IA-01..07, 10)."""
        plan = self.get_object()
        goal = request.data.get("goal")
        activity_level = request.data.get("activity_level", DEFAULT_ACTIVITY)
        if goal not in PlanGoal.values:
            return Response({"goal": f"Debe ser uno de {PlanGoal.values}."},
                            status=status.HTTP_400_BAD_REQUEST)
        if activity_level not in ACTIVITY_FACTORS:
            return Response({"activity_level": f"Debe ser uno de {list(ACTIVITY_FACTORS)}."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            plan, report = generation.generate_for_plan(
                plan, goal=goal, activity_level=activity_level, user=request.user)
        except generation.ConsentError as e:
            return Response({"detail": str(e), "code": "consent_required"},
                            status=status.HTTP_409_CONFLICT)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        log_event(AuditEvent.Action.PLAN_GENERATED, actor=request.user, request=request,
                  entity="NutritionPlan", entity_id=str(plan.id),
                  metadata={"goal": goal, "validation_passed": report.passed})
        return Response({"plan": self.get_serializer(plan).data, "report": report.as_dict()})

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        return self._transition(lambda plan: plan.submit_for_review())

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        plan = self.get_object()
        try:
            plan.approve(request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        log_event(AuditEvent.Action.PLAN_APPROVED, actor=request.user, request=request,
                  entity="NutritionPlan", entity_id=str(plan.id))
        return Response(self.get_serializer(plan).data)

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        plan = self.get_object()
        try:
            plan.share(token=secrets.token_urlsafe(32))
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        log_event(AuditEvent.Action.PLAN_SHARED, actor=request.user, request=request,
                  entity="NutritionPlan", entity_id=str(plan.id))
        return Response(self.get_serializer(plan).data)

    @action(detail=True, methods=["post"], url_path="revoke-share")
    def revoke_share(self, request, pk=None):
        plan = self.get_object()
        plan.revoke_share()
        return Response(self.get_serializer(plan).data)

    @action(detail=True, methods=["get"])
    def generations(self, request, pk=None):
        plan = self.get_object()
        gens = plan.generations.order_by("-created_at")
        return Response(PlanGenerationSerializer(gens, many=True).data)

    def _transition(self, fn):
        plan = self.get_object()
        try:
            fn(plan)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(self.get_serializer(plan).data)


class PatientConsentViewSet(TenantScopedModelViewSet):
    """Consentimiento del paciente para el uso de IA (RF-IA-10)."""
    queryset = PatientConsent.objects.all()
    serializer_class = PatientConsentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient = self.request.query_params.get("patient")
        return qs.filter(patient_id=patient) if patient else qs

    def perform_create(self, serializer):
        obj = serializer.save(
            tenant_id=self.get_tenant_id(),
            recorded_by=self.request.user,
            granted=True,
            granted_at=timezone.now(),
        )
        log_event(AuditEvent.Action.CONSENT_GRANTED, actor=self.request.user,
                  entity="PatientConsent", entity_id=str(obj.id))

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        consent = self.get_object()
        consent.revoked_at = timezone.now()
        consent.save(update_fields=["revoked_at", "updated_at"])
        log_event(AuditEvent.Action.CONSENT_REVOKED, actor=request.user,
                  entity="PatientConsent", entity_id=str(consent.id))
        return Response(self.get_serializer(consent).data)
