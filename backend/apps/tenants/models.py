"""
Tenant: unidad de aislamiento del SaaS (un consultorio). Raíz de la tenancy.
`TenantSettings` guarda la configuración del consultorio (datos, logo, slug público,
plan/feature flags) — RF-28/29/30, RNF-15.
"""
from django.db import models

from apps.common.models import TimeStampedModel


class Tenant(TimeStampedModel):
    name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


class PlanType(models.TextChoices):
    """Plan comercial del consultorio; habilita módulos vía feature flags (RF-30)."""
    BASIC = "BASIC", "Básico"
    PRO = "PRO", "Pro"
    PREMIUM = "PREMIUM", "Premium"


class TenantSettings(TimeStampedModel):
    """Configuración del consultorio (RF-28, RF-29, RF-30, RNF-15)."""
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name="settings")
    nutritionist_name = models.CharField(max_length=200, blank=True)
    business_name = models.CharField(max_length=200, blank=True)
    license_number = models.CharField(max_length=100, blank=True)  # matrícula
    logo_url = models.URLField(blank=True)  # a storage externo, no BLOB (RNF-11)

    # Portal público de reservas (RF-26/27).
    slug = models.SlugField(max_length=80, unique=True, null=True, blank=True)

    plan_type = models.CharField(max_length=20, choices=PlanType.choices,
                                 default=PlanType.BASIC)
    feature_flags = models.JSONField(default=dict, blank=True)  # flags por tenant (RNF-15)

    def __str__(self):
        return f"Config · {self.tenant.name}"
