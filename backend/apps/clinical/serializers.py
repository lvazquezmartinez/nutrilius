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
        fields = [
            "id", "patient", "age", "sex", "weight_kg", "height_cm",
            "usual_weight_kg", "weight_loss_pct", "smoker", "activity_level",
            "meals_per_day", "pathologies", "restrictions", "allergies", "habits",
            "goal", "data_json", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class PatientMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMetric
        fields = [
            "id", "patient", "measured_at", "weight_kg", "height_m", "bmi",
            "waist_cm", "neck_cm", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        # Calcula IMC si hay peso y talla y no vino dado.
        if attrs.get("bmi") is None:
            weight = attrs.get("weight_kg")
            height = attrs.get("height_m")
            if weight and height and Decimal(height) > 0:
                attrs["bmi"] = (Decimal(weight) / (Decimal(height) ** 2)).quantize(Decimal("0.01"))
        return attrs


class EvolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evolution
        fields = ["id", "patient", "notes", "created_at"]
        read_only_fields = ["id", "created_at"]


class AnamnesisTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnamnesisTemplate
        fields = ["template_json", "updated_at"]
        read_only_fields = ["updated_at"]
