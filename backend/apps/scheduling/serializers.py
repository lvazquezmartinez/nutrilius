from rest_framework import serializers

from .models import Visit


class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = [
            "id", "patient", "scheduled_at", "duration_minutes", "status",
            "reason", "notes", "reminder_sent", "cancelled_at",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "reminder_sent", "cancelled_at", "created_at", "updated_at"]
