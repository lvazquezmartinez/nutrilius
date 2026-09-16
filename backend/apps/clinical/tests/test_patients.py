"""Tests de pacientes (RF-07..09) + aislamiento por tenant y auditoría."""
import pytest

from apps.audit.models import AuditEvent
from apps.clinical.models import Patient
from apps.identity.models import Role

pytestmark = pytest.mark.django_db


def test_crear_paciente_setea_tenant_creador_y_audita(auth_client, make_tenant):
    t = make_tenant("T1")
    client, admin = auth_client(email="a@t1.local", role=Role.ADMIN, tenant=t)
    r = client.post("/api/patients/", {"first_name": "Ana", "last_name": "Gómez", "dni": "123"}, format="json")
    assert r.status_code == 201
    p = Patient.all_objects.get(dni="123")
    assert p.tenant_id == t.id
    assert p.created_by_id == admin.id
    assert AuditEvent.objects.filter(action="PATIENT_CREATED", entity="Patient").exists()


def test_listado_scoped_por_tenant(auth_client, make_tenant):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    Patient.all_objects.create(tenant=t1, first_name="Uno")
    Patient.all_objects.create(tenant=t2, first_name="Dos")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    r = client.get("/api/patients/")
    assert {p["first_name"] for p in r.json()["results"]} == {"Uno"}


def test_no_ve_paciente_de_otro_tenant(auth_client, make_tenant):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    ajeno = Patient.all_objects.create(tenant=t2, first_name="Ajeno")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    assert client.get(f"/api/patients/{ajeno.id}/").status_code == 404


def test_baja_logica_y_reactivar(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    p = Patient.all_objects.create(tenant=t1, first_name="Uno")
    assert client.delete(f"/api/patients/{p.id}/").status_code == 204
    p.refresh_from_db()
    assert p.is_active is False
    r = client.post(f"/api/patients/{p.id}/reactivate/")
    assert r.status_code == 200
    p.refresh_from_db()
    assert p.is_active is True


def test_busqueda_por_nombre(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    Patient.all_objects.create(tenant=t1, first_name="Ana", last_name="Perez")
    Patient.all_objects.create(tenant=t1, first_name="Beto", last_name="Lopez")
    r = client.get("/api/patients/?search=Ana")
    assert {p["first_name"] for p in r.json()["results"]} == {"Ana"}


def test_retrieve_audita_acceso_clinico(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    p = Patient.all_objects.create(tenant=t1, first_name="Uno")
    client.get(f"/api/patients/{p.id}/")
    assert AuditEvent.objects.filter(action="CLINICAL_READ", entity="Patient").exists()
