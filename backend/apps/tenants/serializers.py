from rest_framework import serializers

from apps.scheduling.booking import make_booking_token

from .models import TenantSettings


class TenantSettingsSerializer(serializers.ModelSerializer):
    booking_token = serializers.SerializerMethodField()

    class Meta:
        model = TenantSettings
        fields = ["nutritionist_name", "business_name", "license_number",
                  "logo_url", "booking_token"]
        read_only_fields = ["booking_token"]  # el token no se edita

    def get_booking_token(self, obj):
        """Token firmado del consultorio para el enlace público de reservas (HU-18)."""
        return make_booking_token(obj.tenant_id)
