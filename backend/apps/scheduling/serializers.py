from rest_framework import serializers

from .models import Visit


class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = [
            "id", "patient", "scheduled_at", "duration_minutes", "status",
            "notes", "reminder_sent", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "reminder_sent", "created_at", "updated_at"]
