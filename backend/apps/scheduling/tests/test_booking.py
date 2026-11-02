"""Tests de reserva pública por enlace del consultorio (HU-18)."""
import pytest
from rest_framework.test import APIClient

from apps.clinical.models import Patient
from apps.scheduling.booking import make_booking_token, available_slots


@pytest.fixture
def tenant(db, make_tenant):
    return make_tenant("Consultorio Booking")


def test_enlace_invalido(tenant):
    anon = APIClient()
    assert anon.get("/api/public/booking/token-alterado").status_code == 404
    # token de otro id firmado distinto tampoco debe caer en este tenant si se altera
    tok = make_booking_token(tenant.id)
    assert anon.get(f"/api/public/booking/{tok}X").status_code == 404


def test_get_muestra_horarios(tenant):
    anon = APIClient()
    tok = make_booking_token(tenant.id)
    r = anon.get(f"/api/public/booking/{tok}")
    assert r.status_code == 200
    assert "consultorio" in r.data
    assert len(r.data["slots"]) > 0


def test_reserva_crea_paciente_nuevo_y_ocupa_el_horario(tenant):
    anon = APIClient()
    tok = make_booking_token(tenant.id)
    slot = available_slots(tenant)[0].isoformat()

    r = anon.post(f"/api/public/booking/{tok}",
                  {"slot": slot, "name": "Juan Pérez", "email": "juan@example.com", "phone": "351..."},
                  format="json")
    assert r.status_code == 201
    p = Patient.all_objects.get(tenant=tenant, email="juan@example.com")
    assert p.is_new is True

    # el mismo horario ya no está disponible
    r2 = anon.post(f"/api/public/booking/{tok}", {"slot": slot, "name": "Otro"}, format="json")
    assert r2.status_code == 409


def test_reserva_reusa_paciente_existente(tenant):
    anon = APIClient()
    tok = make_booking_token(tenant.id)
    Patient.all_objects.create(tenant=tenant, first_name="Ana", email="ana@example.com")
    slot = available_slots(tenant)[0].isoformat()
    anon.post(f"/api/public/booking/{tok}",
              {"slot": slot, "name": "Ana", "email": "ana@example.com"}, format="json")
    assert Patient.all_objects.filter(tenant=tenant, email="ana@example.com").count() == 1
