"""
Modelos base reutilizables por todos los módulos.

`TenantOwnedModel` es la pieza central del aislamiento multi-tenant (RNF-01 / DS-01):
toda entidad de negocio hereda de acá, lleva FK a `tenants.Tenant` y usa el
`TenantManager`, que filtra por el tenant del request.
"""
from django.db import models

from .tenancy import TenantManager


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TenantOwnedModel(TimeStampedModel):
    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="+",
        db_index=True,
    )

    # `objects` filtra por tenant del contexto; `all_objects` no (uso administrativo).
    objects = TenantManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True
