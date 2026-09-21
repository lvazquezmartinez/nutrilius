"""Tests del dashboard del tenant (métricas agregadas + aislamiento)."""
import pytest
from django.utils import timezone

from apps.clinical.models import Patient
from apps.scheduling.models import Visit

pytestmark = pytest.mark.django_db


def test_dashboard_metricas_scoped_por_tenant(auth_client, make_tenant):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    client, _ = auth_client(email="a@t1.local", tenant=t1)

    p1 = Patient.all_objects.create(tenant=t1, first_name="Uno", is_new=True)
    Patient.all_objects.create(tenant=t1, first_name="Dos")
    Patient.all_objects.create(tenant=t1, first_name="Baja", is_active=False)
    Patient.all_objects.create(tenant=t2, first_name="Ajeno")  # otro tenant
    Visit.all_objects.create(tenant=t1, patient=p1, scheduled_at=timezone.now())

    r = client.get("/api/dashboard")
    assert r.status_code == 200
    d = r.json()
    assert d["patients_active"] == 2            # Uno + Dos (Baja no cuenta), sin el ajeno
    assert d["patients_new_count"] == 1
    assert len(d["visits_today"]) == 1
    assert d["visits_today"][0]["patient_name"] == "Uno"
    assert len(d["new_patients"]) == 1


def test_dashboard_requiere_auth(api):
    assert api.get("/api/dashboard").status_code == 401
