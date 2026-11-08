"""
Tenant: unidad de aislamiento del SaaS (un consultorio). Raíz de la tenancy.
`TenantSettings` guarda la configuración del consultorio (datos, matrícula, logo)
— HU-17.
"""
from django.db import models

from apps.common.models import TimeStampedModel


class Tenant(TimeStampedModel):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


class TenantSettings(TimeStampedModel):
    """Configuración del consultorio (HU-17)."""
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name="settings")
    nutritionist_name = models.CharField(max_length=200, blank=True)
    business_name = models.CharField(max_length=200, blank=True)
    license_number = models.CharField(max_length=100, blank=True)  # matrícula
    logo_url = models.URLField(blank=True)  # a storage externo, no BLOB (RNF-11)

    def __str__(self):
        return f"Config · {self.tenant.name}"
