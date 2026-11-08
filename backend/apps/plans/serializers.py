"""Serializers del módulo de planes + IA supervisada."""
from rest_framework import serializers

from .models import NutritionPlan, PlanGeneration, PatientConsent


class PlanGenerationSerializer(serializers.ModelSerializer):
    """Traza de una generación con IA (solo lectura) — RF-IA-07."""
    class Meta:
        model = PlanGeneration
        fields = [
            "id", "provider", "model", "prompt_version",
            "input_tokens", "output_tokens", "estimated_cost_usd",
            "validation_passed", "validation_report", "request_payload", "created_at",
        ]
        read_only_fields = fields


class NutritionPlanSerializer(serializers.ModelSerializer):
    visible_to_patient = serializers.BooleanField(read_only=True)
    last_generation = serializers.SerializerMethodField()

    class Meta:
        model = NutritionPlan
        # El profesional edita: patient (al crear), title, content, professional_notes, goal.
        # Todo lo demás lo fija el servicio de generación o las transiciones de estado.
        exclude = ["tenant"]
        read_only_fields = [
            "status", "target_kcal", "target_protein_g", "target_carbs_g", "target_fat_g",
            "hard_constraints", "approved_by", "approved_at",
            "share_token", "share_enabled", "created_by", "created_at", "updated_at",
        ]

    def get_last_generation(self, obj):
        gen = obj.generations.order_by("-created_at").first()
        return PlanGenerationSerializer(gen).data if gen else None


class PatientConsentSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = PatientConsent
        exclude = ["tenant"]
        read_only_fields = ["granted_at", "revoked_at", "recorded_by", "created_at", "updated_at"]
