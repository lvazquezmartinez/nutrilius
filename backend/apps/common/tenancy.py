"""
Contexto de tenant por request (aislamiento multi-tenant — RNF-01 / DS-01).

`TenantMiddleware` toma el tenant del usuario autenticado y lo deja en un
context-var accesible por los managers. `TenantManager` filtra automáticamente por
ese tenant, de modo que ningún query devuelva datos de otro consultorio salvo que
se pida explícitamente (`all_tenants()`), reservado para SUPER_ADMIN / tareas.
"""
from contextvars import ContextVar

from django.db import models
from django.utils.deprecation import MiddlewareMixin

_current_tenant_id: ContextVar[int | None] = ContextVar("current_tenant_id", default=None)


def set_current_tenant_id(tenant_id):
    _current_tenant_id.set(tenant_id)


def get_current_tenant_id():
    return _current_tenant_id.get()


class TenantMiddleware(MiddlewareMixin):
    """Setea el tenant del request a partir del usuario autenticado."""

    def process_request(self, request):
        user = getattr(request, "user", None)
        tenant_id = getattr(user, "tenant_id", None) if user and user.is_authenticated else None
        set_current_tenant_id(tenant_id)

    def process_response(self, request, response):
        set_current_tenant_id(None)
        return response


class TenantQuerySet(models.QuerySet):
    def all_tenants(self):
        """Escape hatch explícito: ignora el filtro de tenant. Usar con cuidado."""
        return self


class TenantManager(models.Manager):
    """Manager que filtra por el tenant del contexto actual."""

    def get_queryset(self):
        qs = TenantQuerySet(self.model, using=self._db)
        tenant_id = get_current_tenant_id()
        if tenant_id is not None:
            return qs.filter(tenant_id=tenant_id)
        return qs

    def all_tenants(self):
        return TenantQuerySet(self.model, using=self._db)
