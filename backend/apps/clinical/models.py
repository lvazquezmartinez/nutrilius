"""
Registro clínico (RF-07..14). Núcleo del dominio: pacientes y su historia.
Datos sensibles de salud (DS-02): el acceso se audita en la capa de vistas.

Todas las entidades heredan de `TenantOwnedModel` → llevan FK a tenant y se filtran
por el tenant del request (aislamiento, RNF-01 / DS-01).
"""
from django.conf import settings
from django.db import models

from apps.common.models import TenantOwnedModel


class Sex(models.TextChoices):
    FEMALE = "F", "Femenino"
    MALE = "M", "Masculino"
    OTHER = "X", "Otro"


class ActivityLevel(models.TextChoices):
    SEDENTARY = "SEDENTARY", "Sedentario"
    LIGHT = "LIGHT", "Ligero"
    MODERATE = "MODERATE", "Moderado"
    ACTIVE = "ACTIVE", "Activo"
    VERY_ACTIVE = "VERY_ACTIVE", "Muy activo"


class Patient(TenantOwnedModel):
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120, blank=True)
    dni = models.CharField(max_length=50, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=1, choices=Sex.choices, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    is_new = models.BooleanField(default=False)  # creado desde el booking público
    is_active = models.BooleanField(default=True)  # baja lógica
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Anamnesis(TenantOwnedModel):
    """
    Anamnesis por paciente (append-only: se conserva el histórico). Los campos
    estructurados son los inputs del motor de reglas de IA (Fase 4). `data_json`
    guarda respuestas según la plantilla configurable del tenant.
    """
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="anamneses")
    age = models.PositiveIntegerField(null=True, blank=True)
    sex = models.CharField(max_length=1, choices=Sex.choices, blank=True)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    usual_weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    weight_loss_pct = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    smoker = models.BooleanField(null=True, blank=True)
    activity_level = models.CharField(max_length=20, choices=ActivityLevel.choices, blank=True)
    meals_per_day = models.PositiveIntegerField(null=True, blank=True)
    pathologies = models.TextField(blank=True)
    restrictions = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    habits = models.TextField(blank=True)
    goal = models.TextField(blank=True)
    data_json = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "anamneses"


# Plantilla de anamnesis por defecto (RF-11/12). El tenant puede adaptarla.
DEFAULT_ANAMNESIS_TEMPLATE = {
    "sections": [
        {
            "title": "Datos generales",
            "fields": [
                {"key": "age", "label": "Edad", "type": "number"},
                {"key": "sex", "label": "Sexo", "type": "choice"},
                {"key": "activity_level", "label": "Nivel de actividad", "type": "choice"},
            ],
        },
        {
            "title": "Antropometría",
            "fields": [
                {"key": "weight_kg", "label": "Peso (kg)", "type": "number"},
                {"key": "height_cm", "label": "Talla (cm)", "type": "number"},
                {"key": "usual_weight_kg", "label": "Peso habitual (kg)", "type": "number"},
            ],
        },
        {
            "title": "Clínica y hábitos",
            "fields": [
                {"key": "pathologies", "label": "Patologías", "type": "text"},
                {"key": "restrictions", "label": "Restricciones", "type": "text"},
                {"key": "allergies", "label": "Alergias", "type": "text"},
                {"key": "habits", "label": "Hábitos", "type": "text"},
                {"key": "goal", "label": "Objetivo", "type": "text"},
            ],
        },
    ]
}


class AnamnesisTemplate(TenantOwnedModel):
    """Plantilla configurable por tenant (una por tenant)."""
    template_json = models.JSONField(default=dict)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["tenant"], name="uq_anamnesis_template_tenant"),
        ]


class PatientMetric(TenantOwnedModel):
    """Métricas antropométricas en el tiempo (RF-13)."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="metrics")
    measured_at = models.DateTimeField()
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height_m = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    bmi = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    waist_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    neck_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-measured_at"]


class Evolution(TenantOwnedModel):
    """Evolución clínica: nota fechada del seguimiento (RF-14)."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="evolutions")
    notes = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-created_at"]
