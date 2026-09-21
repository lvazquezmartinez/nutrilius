"""Agenda y turnos (RF-15..17)."""
from django.conf import settings
from django.db import models

from apps.clinical.models import Patient
from apps.common.models import TenantOwnedModel


class VisitStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", "Agendado"
    COMPLETED = "COMPLETED", "Completado"
    CANCELLED = "CANCELLED", "Cancelado"
    NO_SHOW = "NO_SHOW", "No asistió"


class Visit(TenantOwnedModel):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="visits")
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=45)
    status = models.CharField(max_length=20, choices=VisitStatus.choices,
                              default=VisitStatus.SCHEDULED)
    reason = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    reminder_sent = models.BooleanField(default=False)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-scheduled_at"]
