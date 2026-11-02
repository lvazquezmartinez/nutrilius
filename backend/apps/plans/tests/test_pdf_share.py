"""Tests de PDF (HU-14) y compartición pública por token (HU-15)."""
import datetime

import pytest
from rest_framework.test import APIClient

from apps.clinical.models import Anamnesis, Patient
from apps.plans.models import NutritionPlan, PatientConsent
from apps.plans.services import generation


@pytest.fixture
def approved(db, make_tenant, auth_client):
    t = make_tenant()
    client, user = auth_client(tenant=t)
    p = Patient.objects.create(tenant=t, first_name="Ana", last_name="Gómez", sex="F",
                               birth_date=datetime.date(1990, 5, 14))
    Anamnesis.objects.create(tenant=t, patient=p, weight_kg=78, height_cm=165)
    PatientConsent.objects.create(tenant=t, patient=p, granted=True)
    plan = NutritionPlan.objects.create(tenant=t, patient=p, title="Plan")
    generation.generate_for_plan(plan, goal="DESCENSO", user=user)
    plan.refresh_from_db()
    plan.approve(user)
    return t, user, client, plan


def test_pdf_de_plan_aprobado(approved):
    _, _, client, plan = approved
    r = client.get(f"/api/plans/{plan.id}/pdf/")
    assert r.status_code == 200
    assert r["Content-Type"] == "application/pdf"
    assert r.content[:4] == b"%PDF"


def test_pdf_de_borrador_no_disponible(db, make_tenant, auth_client):
    t = make_tenant()
    client, _ = auth_client(tenant=t)
    p = Patient.objects.create(tenant=t, first_name="X", sex="M")
    plan = NutritionPlan.objects.create(tenant=t, patient=p, title="Borrador")
    assert client.get(f"/api/plans/{plan.id}/pdf/").status_code == 409


def test_pdf_publico_por_token_revocable(approved):
    _, _, _, plan = approved
    plan.share(token="tok-abc-123")
    anon = APIClient()

    r = anon.get("/api/public/plan/tok-abc-123/pdf")
    assert r.status_code == 200 and r.content[:4] == b"%PDF"

    plan.revoke_share()
    assert anon.get("/api/public/plan/tok-abc-123/pdf").status_code == 404   # revocado
    assert anon.get("/api/public/plan/inexistente/pdf").status_code == 404    # token inválido
