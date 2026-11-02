"""Tests de agenda global (HU-11) y recontacto de inactivos (HU-16)."""
import datetime

import pytest
from django.utils import timezone

from apps.clinical.models import Patient
from apps.scheduling.models import Visit, VisitStatus


@pytest.fixture
def ctx(db, make_tenant, auth_client):
    t = make_tenant()
    client, user = auth_client(tenant=t)
    return t, user, client


def _patient(t, name="Ana"):
    return Patient.objects.create(tenant=t, first_name=name, last_name="Demo", sex="F")


def _visit(t, p, user, days_offset, status=VisitStatus.SCHEDULED):
    return Visit.objects.create(tenant=t, created_by=user, patient=p,
                                scheduled_at=timezone.now() + datetime.timedelta(days=days_offset),
                                status=status, reason="control")


def test_agenda_filtra_por_rango(ctx):
    t, user, client = ctx
    p = _patient(t)
    _visit(t, p, user, -40)   # fuera de rango (pasado)
    _visit(t, p, user, 3)     # dentro
    _visit(t, p, user, 50)    # fuera de rango (futuro lejano)
    hoy = timezone.localdate()
    r = client.get("/api/visits/", {"from": hoy.isoformat(),
                                     "to": (hoy + datetime.timedelta(days=7)).isoformat()})
    assert r.status_code == 200
    items = r.data["results"] if isinstance(r.data, dict) and "results" in r.data else r.data
    assert len(items) == 1
    assert items[0]["patient_name"] == "Ana Demo"


def test_inactivos_lista_pacientes_sin_turnos_recientes(ctx):
    t, user, client = ctx
    quieto = _patient(t, "Quieto")
    _visit(t, quieto, user, -90, VisitStatus.COMPLETED)   # último turno hace 90 días

    activo = _patient(t, "Activo")
    _visit(t, activo, user, -90, VisitStatus.COMPLETED)
    _visit(t, activo, user, +5)                            # tiene turno futuro

    r = client.get("/api/visits/inactive-patients/", {"days": 60})
    assert r.status_code == 200
    nombres = {p["name"] for p in r.data["patients"]}
    assert "Quieto Demo" in nombres
    assert "Activo Demo" not in nombres                    # sale por tener turno futuro


def test_inactivo_sale_al_agendar_turno(ctx):
    t, user, client = ctx
    p = _patient(t, "Vuelve")
    _visit(t, p, user, -90, VisitStatus.COMPLETED)
    assert any(x["name"] == "Vuelve Demo" for x in client.get("/api/visits/inactive-patients/", {"days": 60}).data["patients"])

    _visit(t, p, user, +2)  # vuelve a agendar
    assert not any(x["name"] == "Vuelve Demo" for x in client.get("/api/visits/inactive-patients/", {"days": 60}).data["patients"])
