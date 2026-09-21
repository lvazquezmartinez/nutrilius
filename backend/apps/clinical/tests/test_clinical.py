"""Tests de anamnesis, métricas, evoluciones, plantilla y el TenantManager real."""
import pytest

from apps.clinical.models import Patient
from apps.common.tenancy import set_current_tenant_id

pytestmark = pytest.mark.django_db


def test_anamnesis_solo_acepta_paciente_del_tenant(auth_client, make_tenant):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    mio = Patient.all_objects.create(tenant=t1, first_name="Mío")
    ajeno = Patient.all_objects.create(tenant=t2, first_name="Ajeno")

    r = client.post("/api/anamneses/", {
        "patient": mio.id, "reason_for_consultation": "bajar grasa", "weight_kg": "80.00",
    }, format="json")
    assert r.status_code == 201

    r = client.post("/api/anamneses/", {"patient": ajeno.id}, format="json")
    assert r.status_code == 400  # paciente de otro tenant no es válido


def test_metric_calcula_bmi_si_falta(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    p = Patient.all_objects.create(tenant=t1, first_name="Uno")
    r = client.post("/api/metrics/", {
        "patient": p.id, "measured_at": "2026-01-01T10:00:00Z",
        "weight_kg": "80.00", "height_m": "2.00",
    }, format="json")
    assert r.status_code == 201
    assert r.json()["bmi"] == "20.00"


def test_evolution_create_calcula_bmi(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    p = Patient.all_objects.create(tenant=t1, first_name="Uno")
    r = client.post("/api/evolutions/", {
        "patient": p.id, "date": "2026-01-15",
        "weight_kg": "80.00", "height_cm": "200.00",
        "clinical_notes": "mejoró la adherencia",
    }, format="json")
    assert r.status_code == 201
    assert r.json()["bmi"] == "20.00"  # 80 / 2.00^2


def test_anamnesis_template_get_put_reset(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)

    r = client.get("/api/anamnesis-template")
    assert r.status_code == 200
    assert "sections" in r.json()["template_json"]

    r = client.put("/api/anamnesis-template", {"template_json": {"sections": []}}, format="json")
    assert r.status_code == 200
    assert r.json()["template_json"] == {"sections": []}

    r = client.post("/api/anamnesis-template")  # reset
    assert r.status_code == 200
    assert r.json()["template_json"]["sections"]  # volvió al default


def test_tenant_manager_filtra_por_contexto(make_tenant):
    """Anti-fuga real: con contexto de tenant, `objects` solo ve lo de ese tenant."""
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    Patient.all_objects.create(tenant=t1, first_name="Uno")
    Patient.all_objects.create(tenant=t2, first_name="Dos")

    assert Patient.all_objects.count() == 2  # sin filtrar

    set_current_tenant_id(t1.id)
    try:
        assert Patient.objects.count() == 1
        assert Patient.objects.get().first_name == "Uno"
    finally:
        set_current_tenant_id(None)
