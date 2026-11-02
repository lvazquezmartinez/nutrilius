from rest_framework import serializers

from apps.scheduling.booking import make_booking_token

from .models import TenantSettings


class TenantSettingsSerializer(serializers.ModelSerializer):
    booking_token = serializers.SerializerMethodField()

    class Meta:
        model = TenantSettings
        fields = ["nutritionist_name", "business_name", "license_number",
                  "logo_url", "slug", "plan_type", "booking_token"]
        read_only_fields = ["plan_type", "booking_token"]  # plan y token no se editan

    def get_booking_token(self, obj):
        """Token firmado del consultorio para el enlace público de reservas (HU-18)."""
        return make_booking_token(obj.tenant_id)
