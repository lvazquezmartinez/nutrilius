"""
Auditoría transversal (RNF-03, RNF-04). Registro inmutable de eventos sensibles:
login, reset, confirmación, altas/bajas, acceso a datos clínicos, generación de
planes IA, exportación de PDF, cambios de config, acciones de super admin.
"""
from django.conf import settings
from django.db import models


class AuditEvent(models.Model):
    class Action(models.TextChoices):
        LOGIN = "LOGIN", "Login"
        LOGIN_FAILED = "LOGIN_FAILED", "Login fallido"
        PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST", "Solicitud de reset"
        PASSWORD_RESET = "PASSWORD_RESET", "Reset de contraseña"
        EMAIL_CONFIRMED = "EMAIL_CONFIRMED", "Email confirmado"
        TENANT_REGISTERED = "TENANT_REGISTERED", "Alta de tenant"
        USER_CREATED = "USER_CREATED", "Alta de usuario"
        USER_TOGGLED = "USER_TOGGLED", "Activación/desactivación de usuario"
        PATIENT_CREATED = "PATIENT_CREATED", "Alta de paciente"
        CLINICAL_READ = "CLINICAL_READ", "Acceso a datos clínicos"
        # Fases siguientes: PLAN_GENERATED, PDF_SHARED, etc.

    # tenant_id nullable: eventos previos al tenant (p. ej. login fallido) o de super admin.
    tenant_id = models.PositiveBigIntegerField(null=True, blank=True, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    action = models.CharField(max_length=40, choices=Action.choices, db_index=True)
    entity = models.CharField(max_length=80, blank=True)
    entity_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} @ {self.created_at:%Y-%m-%d %H:%M}"
