"""Configuración del consultorio (HU-17 / RF-28/29/30)."""
from django.core.files.storage import default_storage
from django.http import Http404
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.audit.models import AuditEvent
from apps.audit.services import log_event
from apps.identity.permissions import IsTenantAdmin

from .models import TenantSettings
from .serializers import TenantSettingsSerializer


class TenantSettingsView(RetrieveUpdateAPIView):
    """GET para cualquier usuario del consultorio; edición solo para el ADMIN. Auditado."""
    serializer_class = TenantSettingsSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsTenantAdmin()]
        return [IsAuthenticated()]

    def get_object(self):
        tenant_id = getattr(self.request.user, "tenant_id", None)
        if not tenant_id:
            raise Http404("El usuario no pertenece a un consultorio.")
        obj, _ = TenantSettings.objects.get_or_create(tenant_id=tenant_id)
        return obj

    def perform_update(self, serializer):
        extra = {}
        logo = self.request.FILES.get("logo")
        if logo:
            path = default_storage.save(
                f"logos/{self.request.user.tenant_id}/{logo.name}", logo)
            extra["logo_url"] = default_storage.url(path)
        obj = serializer.save(**extra)
        log_event(AuditEvent.Action.CONFIG_UPDATED, actor=self.request.user,
                  request=self.request, entity="TenantSettings", entity_id=str(obj.pk))
