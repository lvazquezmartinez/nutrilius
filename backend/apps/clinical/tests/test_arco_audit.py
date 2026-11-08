"""Tests de auditoría de acceso (HU-20) y derechos del paciente / ARCO (HU-24)."""
import pytest

from apps.clinical.models import Anamnesis, Patient


@pytest.fixture
def ctx(db, make_tenant, auth_client):
    t = make_tenant()
    client, _ = auth_client(tenant=t, email="pro@t.local")
    p = Patient.objects.create(tenant=t, first_name="Ana", last_name="Gómez", sex="F",
                               dni="30111222", email="ana@ex.com", phone="351")
    Anamnesis.objects.create(tenant=t, patient=p, medications="algo")
    return t, client, p


def test_access_log_registra_lectura_clinica(ctx):
    _, client, p = ctx
    client.get(f"/api/anamneses/?patient={p.id}")          # lectura auditada
    r = client.get(f"/api/patients/{p.id}/access-log/")
    assert r.status_code == 200
    assert any(e["actor"] == "pro@t.local" for e in r.data)


def test_export_de_datos_del_paciente(ctx):
    _, client, p = ctx
    r = client.get(f"/api/patients/{p.id}/export/")
    assert r.status_code == 200
    assert r.data["patient"]["dni"] == "30111222"
    assert len(r.data["anamnesis"]) == 1


def test_anonimizar_borra_identificatorios_y_conserva_clinica(ctx):
    _, client, p = ctx
    r = client.post(f"/api/patients/{p.id}/anonymize/")
    assert r.status_code == 200
    p.refresh_from_db()
    assert p.first_name == "Paciente" and p.dni == "" and p.email == "" and p.phone == ""
    assert Anamnesis.all_objects.filter(patient=p).exists()   # el dato clínico se conserva
