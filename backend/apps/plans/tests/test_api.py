"""Tests de la capa API de planes (HU-13): generación, gate de aprobación, consentimiento, aislamiento."""
import datetime

import pytest

from apps.clinical.models import Anamnesis, Patient
from apps.plans.models import NutritionPlan, PatientConsent


@pytest.fixture
def ctx(db, make_tenant, auth_client):
    t = make_tenant()
    client, user = auth_client(tenant=t)
    p = Patient.objects.create(tenant=t, first_name="Ana", last_name="Gómez", sex="F",
                               birth_date=datetime.date(1990, 5, 14))
    Anamnesis.objects.create(tenant=t, patient=p, weight_kg=78, height_cm=165,
                             food_allergies="Maní")
    return t, user, client, p


def _plan(t, p, **kw):
    return NutritionPlan.objects.create(tenant=t, patient=p, title=kw.pop("title", "Plan"), **kw)


def test_crear_plan_por_api_queda_scopeado(ctx):
    t, user, client, p = ctx
    r = client.post("/api/plans/", {"patient": p.id, "title": "Nuevo"}, format="json")
    assert r.status_code == 201
    assert r.data["status"] == "BORRADOR_IA"
    assert NutritionPlan.all_objects.get(id=r.data["id"]).tenant_id == t.id


def test_generar_requiere_consentimiento(ctx):
    t, user, client, p = ctx
    plan = _plan(t, p)
    r = client.post(f"/api/plans/{plan.id}/generate/", {"goal": "DESCENSO"}, format="json")
    assert r.status_code == 409
    assert r.data["code"] == "consent_required"


def test_flujo_generar_aprobar_compartir(ctx):
    t, user, client, p = ctx
    PatientConsent.objects.create(tenant=t, patient=p, granted=True)
    plan = _plan(t, p)

    r = client.post(f"/api/plans/{plan.id}/generate/", {"goal": "DESCENSO"}, format="json")
    assert r.status_code == 200
    assert r.data["plan"]["status"] == "BORRADOR_IA"
    assert r.data["plan"]["visible_to_patient"] is False
    assert "report" in r.data and "passed" in r.data["report"]

    r = client.post(f"/api/plans/{plan.id}/approve/")
    assert r.status_code == 200
    assert r.data["status"] == "APROBADO" and r.data["visible_to_patient"] is True
    assert r.data["approved_by"] == user.id

    r = client.post(f"/api/plans/{plan.id}/share/")
    assert r.status_code == 200
    assert r.data["status"] == "COMPARTIDO" and r.data["share_enabled"] is True


def test_compartir_sin_aprobar_falla(ctx):
    t, user, client, p = ctx
    plan = _plan(t, p)
    r = client.post(f"/api/plans/{plan.id}/share/")
    assert r.status_code == 400


def test_aislamiento_plan_de_otro_tenant_da_404(ctx, make_tenant):
    t, user, client, p = ctx
    t2 = make_tenant("Otro consultorio")
    p2 = Patient.objects.create(tenant=t2, first_name="X", sex="M")
    ajeno = _plan(t2, p2, title="Ajeno")
    assert client.get(f"/api/plans/{ajeno.id}/").status_code == 404
    assert client.post(f"/api/plans/{ajeno.id}/approve/").status_code == 404


def test_consentimiento_otorgar_y_revocar(ctx):
    t, user, client, p = ctx
    r = client.post("/api/consents/", {"patient": p.id, "method": "verbal"}, format="json")
    assert r.status_code == 201
    assert r.data["granted"] is True and r.data["is_active"] is True
    cid = r.data["id"]

    r = client.post(f"/api/consents/{cid}/revoke/")
    assert r.status_code == 200
    assert r.data["is_active"] is False
