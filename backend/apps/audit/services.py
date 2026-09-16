"""Helper para registrar eventos de auditoría desde cualquier módulo."""
from .models import AuditEvent


def _client_ip(request):
    if request is None:
        return None
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_event(action, *, actor=None, tenant_id=None, entity="", entity_id="",
              metadata=None, request=None):
    if tenant_id is None and actor is not None:
        tenant_id = getattr(actor, "tenant_id", None)
    return AuditEvent.objects.create(
        action=action,
        actor=actor if getattr(actor, "pk", None) else None,
        tenant_id=tenant_id,
        entity=entity,
        entity_id=str(entity_id) if entity_id else "",
        metadata=metadata or {},
        ip_address=_client_ip(request),
    )
