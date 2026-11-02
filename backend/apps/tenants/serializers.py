from rest_framework import serializers

from .models import TenantSettings


class TenantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantSettings
        fields = ["nutritionist_name", "business_name", "license_number",
                  "logo_url", "slug", "plan_type"]
        read_only_fields = ["plan_type"]  # el plan comercial lo define el super admin
