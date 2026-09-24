"""
Planes nutricionales + orquestación de IA supervisada (Módulos 6 y 7, Fase 4).

⭐ Núcleo/diferencial de la tesis. Estas entidades codifican las **restricciones de
diseño** del TFG (ver `REQUERIMIENTOS.md` §3 y las reglas no negociables en `SKILL.md`):

- El plan nace en `BORRADOR_IA` y **el paciente no lo ve** hasta `APROBADO`/`COMPARTIDO`;
  la transición exige **aprobación profesional** (RF-IA-06).
- Los objetivos energéticos y las **restricciones duras** los fija un motor de reglas
  ANTES de la IA (RF-IA-01/02); la IA solo propone dentro de esos límites (RF-IA-03).
- Cada generación queda **trazada** (proveedor, modelo, versión, costo) y usa datos
  **seudonimizados** (RF-IA-05/07). Requiere **consentimiento** del paciente (RF-IA-10).

> Nota: en esta etapa se define el **modelo de datos** (para el DER y la base de la
> Fase 4). La lógica (motor de reglas, llamado a la IA, validador, gate de aprobación)
> se implementa en la capa de servicios del Sprint 4.
"""
from django.conf import settings
from django.db import models

from apps.clinical.models import Patient
from apps.common.models import TenantOwnedModel


class PlanStatus(models.TextChoices):
    """Máquina de estados del plan (RF-IA-06). El paciente solo ve APROBADO/COMPARTIDO."""
    BORRADOR_IA = "BORRADOR_IA", "Borrador IA"
    EN_REVISION = "EN_REVISION", "En revisión"
    APROBADO = "APROBADO", "Aprobado"
    COMPARTIDO = "COMPARTIDO", "Compartido"


class PlanGoal(models.TextChoices):
    MANTENIMIENTO = "MANTENIMIENTO", "Mantenimiento"
    DESCENSO = "DESCENSO", "Descenso de peso"
    AUMENTO = "AUMENTO", "Aumento de masa"
    OTRO = "OTRO", "Otro"


class AIProvider(models.TextChoices):
    """Proveedor configurable, sin hardcodear (RF-IA-09)."""
    OPENAI = "OPENAI", "OpenAI"
    OPENROUTER = "OPENROUTER", "OpenRouter"
    FAKE = "FAKE", "Fake (desarrollo/tests)"


class NutritionPlan(TenantOwnedModel):
    """Plan alimentario de un paciente, con estado de aprobación (RF-20, RF-21, RF-IA-06)."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="plans")
    title = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=PlanStatus.choices,
                              default=PlanStatus.BORRADOR_IA)
    goal = models.CharField(max_length=20, choices=PlanGoal.choices, blank=True)

    # Objetivos calculados por el motor de reglas ANTES de la IA (RF-IA-01).
    target_kcal = models.PositiveIntegerField(null=True, blank=True)
    target_protein_g = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    target_carbs_g = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)
    target_fat_g = models.DecimalField(max_digits=6, decimal_places=1, null=True, blank=True)

    # Restricciones duras derivadas de patologías/alergias/intolerancias (RF-IA-02).
    hard_constraints = models.JSONField(default=list, blank=True)

    # Contenido del plan (días/comidas). Se guarda como JSON (patrón data_json).
    content = models.JSONField(default=dict, blank=True)
    professional_notes = models.TextField(blank=True)

    # Aprobación profesional obligatoria: firma quién/cuándo/versión (RF-IA-06).
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="+",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_version = models.PositiveIntegerField(null=True, blank=True)

    # Compartición por link/token revocable + PDF público (RF-24, RF-25).
    share_token = models.CharField(max_length=64, blank=True, db_index=True)
    share_enabled = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title or 'Plan'} · {self.patient} · {self.get_status_display()}"

    @property
    def visible_to_patient(self) -> bool:
        """El paciente solo accede a planes aprobados o compartidos (RF-IA-06)."""
        return self.status in (PlanStatus.APROBADO, PlanStatus.COMPARTIDO)

    # ── Máquina de estados (RF-IA-06). Transiciones válidas y gate de aprobación. ──
    def submit_for_review(self):
        if self.status != PlanStatus.BORRADOR_IA:
            raise ValueError(f"No se puede enviar a revisión desde el estado {self.status}.")
        self.status = PlanStatus.EN_REVISION
        self.save(update_fields=["status", "updated_at"])

    def approve(self, user):
        """Aprobación profesional obligatoria: firma quién, cuándo y qué versión."""
        from django.utils import timezone
        if self.status not in (PlanStatus.BORRADOR_IA, PlanStatus.EN_REVISION):
            raise ValueError(f"No se puede aprobar un plan en estado {self.status}.")
        self.status = PlanStatus.APROBADO
        self.approved_by = user
        self.approved_at = timezone.now()
        self.approved_version = (self.approved_version or 0) + 1
        self.save(update_fields=["status", "approved_by", "approved_at",
                                 "approved_version", "updated_at"])

    def share(self, *, token: str):
        """Compartir requiere estar aprobado; habilita el link con token revocable."""
        if self.status not in (PlanStatus.APROBADO, PlanStatus.COMPARTIDO):
            raise ValueError("Solo se puede compartir un plan aprobado.")
        self.status = PlanStatus.COMPARTIDO
        self.share_token = token
        self.share_enabled = True
        self.save(update_fields=["status", "share_token", "share_enabled", "updated_at"])

    def revoke_share(self):
        self.share_enabled = False
        self.save(update_fields=["share_enabled", "updated_at"])


class PlanTemplate(TenantOwnedModel):
    """Plantilla de plan reutilizable por tenant (RF-22)."""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    content = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class PlanGeneration(TenantOwnedModel):
    """
    Traza de cada generación con IA (RF-IA-07). Guarda proveedor, modelo, versión de
    prompt, payload **seudonimizado** (RF-IA-05), costo estimado y resultado de la
    validación post-IA (RF-IA-04).
    """
    plan = models.ForeignKey(NutritionPlan, on_delete=models.CASCADE, related_name="generations")
    provider = models.CharField(max_length=20, choices=AIProvider.choices)
    model = models.CharField(max_length=120)
    prompt_version = models.CharField(max_length=40, blank=True)
    prompt = models.TextField(blank=True)

    # Lo que efectivamente se envió a la IA: SIN datos identificatorios (RF-IA-05).
    request_payload = models.JSONField(default=dict, blank=True)
    response_raw = models.JSONField(default=dict, blank=True)

    input_tokens = models.PositiveIntegerField(null=True, blank=True)
    output_tokens = models.PositiveIntegerField(null=True, blank=True)
    estimated_cost_usd = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)

    # Validación posterior a la IA (RF-IA-04).
    validation_passed = models.BooleanField(null=True, blank=True)
    validation_report = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Generación {self.provider}/{self.model} · plan {self.plan_id}"


class PatientConsent(TenantOwnedModel):
    """Consentimiento del paciente para el uso de IA antes de generar (RF-IA-10)."""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="ai_consents")
    granted = models.BooleanField(default=False)
    granted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    method = models.CharField(max_length=50, blank=True)  # verbal, firma, formulario…
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_active(self) -> bool:
        return self.granted and self.revoked_at is None

    def __str__(self):
        return f"Consentimiento IA · {self.patient} · {'activo' if self.is_active else 'inactivo'}"
