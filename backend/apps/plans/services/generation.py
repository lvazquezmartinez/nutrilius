"""
Orquestador de generación de planes con IA supervisada (RF-IA-01…07, 10).

Encadena las etapas y garantiza las restricciones de diseño de la tesis:
  1. Verifica el **consentimiento** del paciente (RF-IA-10).
  2. **Motor de reglas** → objetivos + restricciones duras (RF-IA-01/02).
  3. Construye un payload **seudonimizado** — sin nombre/DNI/contacto (RF-IA-05).
  4. Llama al **proveedor de IA** acotado a esos parámetros (RF-IA-03).
  5. **Valida** el resultado (RF-IA-04).
  6. Persiste el plan como `BORRADOR_IA` y registra la **traza** (RF-IA-07).

El plan queda SIEMPRE en `BORRADOR_IA`: la aprobación es un acto humano aparte (RF-IA-06).
"""
from __future__ import annotations

from apps.clinical.models import Anamnesis

from ..models import NutritionPlan, PlanGeneration, PlanStatus, PatientConsent
from . import rules, validation
from .ai import get_provider


class ConsentError(Exception):
    """El paciente no tiene consentimiento activo para el uso de IA."""


def has_active_consent(patient) -> bool:
    return PatientConsent.all_objects.filter(
        patient=patient, granted=True, revoked_at__isnull=True
    ).exists()


def build_payload(targets: rules.Targets, *, age: int, sex: str) -> dict:
    """
    Payload que se envía a la IA. **Seudonimizado**: solo edad, sexo, objetivo, parámetros
    y restricciones — nunca nombre, DNI ni contacto (RF-IA-05).
    """
    return {
        "age": age,
        "sex": sex,
        "goal": targets.goal,
        "kcal": targets.kcal,
        "macros": {"protein_g": targets.protein_g, "carbs_g": targets.carbs_g, "fat_g": targets.fat_g},
        "hard_constraints": targets.hard_constraints,
        "locale": "es-AR",
    }


def generate_for_plan(plan: NutritionPlan, *, goal: str,
                      activity_level: str = rules.DEFAULT_ACTIVITY, user=None):
    """Ejecuta el pipeline completo sobre un plan existente. Devuelve (plan, report)."""
    patient = plan.patient

    if not has_active_consent(patient):
        raise ConsentError("El paciente no otorgó consentimiento para el uso de IA.")

    anamnesis = Anamnesis.all_objects.filter(patient=patient).first()
    if anamnesis is None:
        raise ValueError("El paciente no tiene anamnesis cargada.")

    # 2. Motor de reglas
    targets = rules.targets_for(patient, anamnesis, goal=goal, activity_level=activity_level)

    # 3. Payload seudonimizado
    age = rules._age_from(patient.birth_date)
    payload = build_payload(targets, age=age, sex=patient.sex or "X")

    # 4. IA acotada
    provider = get_provider()
    result = provider.generate(payload)
    content = result.get("content", {})

    # 5. Validación post-IA
    report = validation.validate_plan(content, targets)

    # 6. Persistencia: el plan nace/queda como BORRADOR_IA
    plan.goal = goal
    plan.target_kcal = targets.kcal
    plan.target_protein_g = targets.protein_g
    plan.target_carbs_g = targets.carbs_g
    plan.target_fat_g = targets.fat_g
    plan.hard_constraints = targets.hard_constraints
    plan.content = content
    plan.status = PlanStatus.BORRADOR_IA
    plan.save()

    PlanGeneration.objects.create(
        tenant=plan.tenant,
        plan=plan,
        provider=(provider.name or "fake").upper(),
        model=provider.model,
        prompt_version="v1",
        request_payload=payload,
        response_raw=result.get("raw", {}),
        validation_passed=report.passed,
        validation_report=report.as_dict(),
        created_by=user,
    )
    return plan, report
