"""
Tenant: unidad de aislamiento del SaaS (un consultorio). Raíz de la tenancy.
La configuración del consultorio (TenantSettings: logo, slug, plan/feature flags)
se agrega en Fase 3.
"""
from django.db import models

from apps.common.models import TimeStampedModel


class Tenant(TimeStampedModel):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
