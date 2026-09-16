"""Tests de agenda / visitas (RF-15..17) + aislamiento por tenant."""
import pytest
from django.utils import timezone

from apps.clinical.models import Patient
from apps.scheduling.models import Visit, VisitStatus

pytestmark = pytest.mark.django_db


def test_crear_visita_con_defaults(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    p = Patient.all_objects.create(tenant=t1, first_name="Uno")
    r = client.post("/api/visits/", {"patient": p.id, "scheduled_at": "2026-02-01T09:00:00Z"},
                    format="json")
    assert r.status_code == 201
    assert r.json()["duration_minutes"] == 45
    assert r.json()["status"] == VisitStatus.SCHEDULED


def test_visita_rechaza_paciente_de_otro_tenant(auth_client, make_tenant):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    ajeno = Patient.all_objects.create(tenant=t2, first_name="Ajeno")
    r = client.post("/api/visits/", {"patient": ajeno.id, "scheduled_at": "2026-02-01T09:00:00Z"},
                    format="json")
    assert r.status_code == 400


def test_visitas_scoped_y_filtro_por_status(auth_client, make_tenant):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    client, _ = auth_client(email="a@t1.local", tenant=t1)
    p1 = Patient.all_objects.create(tenant=t1, first_name="Uno")
    p2 = Patient.all_objects.create(tenant=t2, first_name="Dos")
    Visit.all_objects.create(tenant=t1, patient=p1, scheduled_at=timezone.now(),
                             status=VisitStatus.SCHEDULED)
    Visit.all_objects.create(tenant=t1, patient=p1, scheduled_at=timezone.now(),
                             status=VisitStatus.COMPLETED)
    Visit.all_objects.create(tenant=t2, patient=p2, scheduled_at=timezone.now())

    r = client.get("/api/visits/")
    assert r.json()["count"] == 2  # solo las del tenant 1

    r = client.get("/api/visits/?status=COMPLETED")
    assert r.json()["count"] == 1
