from decimal import Decimal

from rest_framework import serializers

from .models import (
    Anamnesis,
    AnamnesisTemplate,
    Evolution,
    Patient,
    PatientMetric,
)


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            "id", "first_name", "last_name", "full_name", "dni", "birth_date",
            "sex", "phone", "email", "address", "notes", "is_new", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_active", "created_at", "updated_at"]


class AnamnesisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anamnesis
        exclude = ["tenant", "created_by"]
        read_only_fields = ["id", "created_at", "updated_at"]


def _bmi(weight, height_cm):
    """IMC = peso(kg) / talla(m)^2, si hay datos."""
    if weight and height_cm and Decimal(height_cm) > 0:
        h = Decimal(height_cm) / Decimal(100)
        return (Decimal(weight) / (h * h)).quantize(Decimal("0.01"))
    return None


class EvolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evolution
        exclude = ["tenant", "created_by"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("bmi") is None:
            computed = _bmi(attrs.get("weight_kg"), attrs.get("height_cm"))
            if computed is not None:
                attrs["bmi"] = computed
        return attrs


class PatientMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMetric
        fields = [
            "id", "patient", "measured_at", "weight_kg", "height_m", "bmi",
            "waist_cm", "neck_cm", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if attrs.get("bmi") is None:
            weight = attrs.get("weight_kg")
            height = attrs.get("height_m")
            if weight and height and Decimal(height) > 0:
                attrs["bmi"] = (Decimal(weight) / (Decimal(height) ** 2)).quantize(Decimal("0.01"))
        return attrs


class AnamnesisTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnamnesisTemplate
        fields = ["template_json", "updated_at"]
        read_only_fields = ["updated_at"]
