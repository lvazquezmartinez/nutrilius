"""
Registro clínico (RF-07..14). Núcleo del dominio: pacientes y su historia.
Datos sensibles de salud (DS-02): el acceso se audita en la capa de vistas.

Todas las entidades heredan de `TenantOwnedModel` → llevan FK a tenant y se filtran
por el tenant del request (aislamiento, RNF-01 / DS-01).
"""
from django.conf import settings
from django.db import models
from django.utils import timezone

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
    Anamnesis clínica por paciente (una por paciente, se actualiza — upsert).
    Modelo detallado alineado al formulario del profesional (RF-10). Los campos
    relevantes (antropometría, actividad, alergias, restricciones) alimentan el
    motor de reglas de IA (Fase 4), junto con edad/sexo del paciente.
    """
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name="anamnesis")

    # 1 · Generales
    occupation = models.CharField(max_length=200, blank=True)
    reason_for_consultation = models.TextField(blank=True)

    # 2 · Antecedentes / hábitos tóxicos
    medications = models.TextField(blank=True)
    alcohol_consumption = models.CharField(max_length=120, blank=True)
    smoking_status = models.CharField(max_length=120, blank=True)
    digestive_symptoms = models.TextField(blank=True)

    # 3 · Alimentación y hábitos
    meals_per_day = models.PositiveIntegerField(null=True, blank=True)
    who_cooks = models.CharField(max_length=120, blank=True)
    eating_out_frequency = models.CharField(max_length=120, blank=True)
    supplements = models.TextField(blank=True)
    food_allergies = models.TextField(blank=True)
    medical_cultural_restrictions = models.TextField(blank=True)
    food_aversions = models.TextField(blank=True)
    habits_comments = models.TextField(blank=True)

    # 4 · Recordatorio de 24 h
    recall_24h_breakfast = models.TextField(blank=True)
    recall_24h_morning_snack = models.TextField(blank=True)
    recall_24h_lunch = models.TextField(blank=True)
    recall_24h_afternoon_snack = models.TextField(blank=True)
    recall_24h_dinner = models.TextField(blank=True)
    recall_24h_water = models.TextField(blank=True)
    recall_24h_sweets = models.TextField(blank=True)
    recall_24h_cooking_methods = models.TextField(blank=True)

    # 5 · Actividad física
    physical_activity = models.TextField(blank=True)

    # 6 · Antropometría
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    waist_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    neck_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    hip_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    arm_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # 7 · Cierre
    final_comments = models.TextField(blank=True)

    data_json = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
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
    """
    Evolución clínica: seguimiento fechado con antropometría/composición y notas
    (RF-14). Incluye las métricas del control para ver la progresión del paciente.
    """
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="evolutions")
    date = models.DateField(default=timezone.localdate)

    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    bmi = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    waist_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    hip_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    arm_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    body_fat_pct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    muscle_mass_pct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_pressure_systolic = models.PositiveIntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.PositiveIntegerField(null=True, blank=True)

    clinical_notes = models.TextField(blank=True)
    dietary_assessment = models.TextField(blank=True)
    next_visit_objectives = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-date", "-created_at"]
