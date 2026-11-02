from rest_framework import serializers

from .models import Visit


class VisitSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Visit
        fields = [
            "id", "patient", "patient_name", "scheduled_at", "duration_minutes", "status",
            "reason", "notes", "reminder_sent", "cancelled_at",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "patient_name", "reminder_sent", "cancelled_at", "created_at", "updated_at"]
