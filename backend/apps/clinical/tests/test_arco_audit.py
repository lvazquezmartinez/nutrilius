"""Tests de auditoría de acceso (HU-20) y derechos del paciente / ARCO (HU-24)."""
import pytest

from apps.clinical.models import Anamnesis, Patient
from apps.identity.models import Role


@pytest.fixture
def ctx(db, make_tenant, auth_client):
    t = make_tenant()
    admin, _ = auth_client(tenant=t, role=Role.ADMIN, email="admin@t.local")
    user, _ = auth_client(tenant=t, role=Role.USER, email="user@t.local")
    p = Patient.objects.create(tenant=t, first_name="Ana", last_name="Gómez", sex="F",
                               dni="30111222", email="ana@ex.com", phone="351")
    Anamnesis.objects.create(tenant=t, patient=p, medications="algo")
    return t, admin, user, p


def test_access_log_registra_lectura_clinica(ctx):
    _, admin, user, p = ctx
    user.get(f"/api/anamneses/?patient={p.id}")           # lectura auditada
    r = admin.get(f"/api/patients/{p.id}/access-log/")
    assert r.status_code == 200
    assert any(e["actor"] == "user@t.local" for e in r.data)


def test_access_log_solo_admin(ctx):
    _, admin, user, p = ctx
    assert user.get(f"/api/patients/{p.id}/access-log/").status_code == 403


def test_export_de_datos_del_paciente(ctx):
    _, admin, user, p = ctx
    r = admin.get(f"/api/patients/{p.id}/export/")
    assert r.status_code == 200
    assert r.data["patient"]["dni"] == "30111222"
    assert len(r.data["anamnesis"]) == 1
    assert user.get(f"/api/patients/{p.id}/export/").status_code == 403


def test_anonimizar_borra_identificatorios_y_conserva_clinica(ctx):
    _, admin, user, p = ctx
    r = admin.post(f"/api/patients/{p.id}/anonymize/")
    assert r.status_code == 200
    p.refresh_from_db()
    assert p.first_name == "Paciente" and p.dni == "" and p.email == "" and p.phone == ""
    assert Anamnesis.all_objects.filter(patient=p).exists()   # el dato clínico se conserva
