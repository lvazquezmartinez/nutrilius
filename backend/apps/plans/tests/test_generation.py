"""
Tests de la orquestación de IA supervisada (RF-IA-05/06/07/10) — con DB.

Cubren las restricciones de diseño críticas de la tesis: consentimiento, seudonimización,
gate de aprobación y trazabilidad.
"""
import datetime

import pytest

from apps.clinical.models import Anamnesis, Patient
from apps.plans.models import NutritionPlan, PlanGeneration, PlanStatus, PatientConsent
from apps.plans.services import generation
from apps.plans.services.generation import ConsentError


@pytest.fixture
def setup(db, make_tenant):
    t = make_tenant()
    p = Patient.objects.create(
        tenant=t, first_name="Ana", last_name="Gómez", sex="F",
        dni="30111222", birth_date=datetime.date(1990, 5, 14),
    )
    Anamnesis.objects.create(tenant=t, patient=p, weight_kg=78, height_cm=165,
                             food_allergies="Maní")
    plan = NutritionPlan.objects.create(tenant=t, patient=p, title="Plan de Ana")
    return t, p, plan


def test_generacion_requiere_consentimiento(setup):
    _, _, plan = setup
    with pytest.raises(ConsentError):
        generation.generate_for_plan(plan, goal="DESCENSO")


def test_generacion_produce_borrador_y_traza(setup, make_user):
    t, p, plan = setup
    PatientConsent.objects.create(tenant=t, patient=p, granted=True)
    user = make_user(tenant=t)

    plan, report = generation.generate_for_plan(plan, goal="DESCENSO", user=user)
    plan.refresh_from_db()

    assert plan.status == PlanStatus.BORRADOR_IA        # nace como borrador, no aprobado
    assert plan.target_kcal > 0
    assert plan.content["days"]                          # tiene contenido generado
    assert report.passed is True                         # el fake respeta los targets

    gen = PlanGeneration.all_objects.get(plan=plan)
    assert gen.validation_passed is True
    assert gen.provider == "FAKE"


def test_seudonimizacion_no_envia_identificatorios(setup, make_user):
    t, p, plan = setup
    PatientConsent.objects.create(tenant=t, patient=p, granted=True)
    plan, _ = generation.generate_for_plan(plan, goal="DESCENSO", user=make_user(tenant=t))

    gen = PlanGeneration.all_objects.get(plan=plan)
    blob = str(gen.request_payload)
    assert "Ana" not in blob          # nombre
    assert "Gómez" not in blob        # apellido
    assert "30111222" not in blob     # DNI
    assert gen.request_payload["age"] and gen.request_payload["kcal"]  # sí van edad/params


def test_gate_de_aprobacion(setup, make_user):
    t, p, plan = setup
    user = make_user(tenant=t)

    assert plan.visible_to_patient is False              # borrador no visible
    plan.approve(user)
    plan.refresh_from_db()

    assert plan.status == PlanStatus.APROBADO
    assert plan.visible_to_patient is True
    assert plan.approved_by_id == user.id                # firma de quién aprobó
    assert plan.approved_at is not None                  # firma de cuándo


def test_no_regenera_sobre_plan_aprobado(setup, make_user):
    """Un plan aprobado no se puede regenerar: eso pisaría una decisión firmada.
    Para rehacer, se crea un plan nuevo (el historial del paciente se conserva)."""
    t, p, plan = setup
    PatientConsent.objects.create(tenant=t, patient=p, granted=True)
    user = make_user(tenant=t)

    generation.generate_for_plan(plan, goal="DESCENSO", user=user)
    plan.refresh_from_db(); plan.approve(user)
    contenido_aprobado = plan.content

    with pytest.raises(ValueError):
        generation.generate_for_plan(plan, goal="AUMENTO", user=user)

    plan.refresh_from_db()
    assert plan.status == PlanStatus.APROBADO             # sigue aprobado
    assert plan.content == contenido_aprobado             # no se pisó el contenido


def test_transicion_invalida_falla(setup):
    _, _, plan = setup
    with pytest.raises(ValueError):
        plan.share(token="abc")                          # no se puede compartir sin aprobar


def test_flujo_completo_borrador_a_compartido(setup, make_user):
    t, p, plan = setup
    PatientConsent.objects.create(tenant=t, patient=p, granted=True)
    user = make_user(tenant=t)

    generation.generate_for_plan(plan, goal="MANTENIMIENTO", user=user)
    plan.refresh_from_db(); plan.submit_for_review()
    plan.refresh_from_db(); plan.approve(user)
    plan.refresh_from_db(); plan.share(token="tok-123")
    plan.refresh_from_db()

    assert plan.status == PlanStatus.COMPARTIDO
    assert plan.share_enabled is True and plan.share_token == "tok-123"
    assert plan.visible_to_patient is True
