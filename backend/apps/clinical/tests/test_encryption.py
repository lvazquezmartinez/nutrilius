"""Test de cifrado en reposo de campos clínicos sensibles (HU-22)."""
import pytest
from django.db import connection

from apps.clinical.models import Anamnesis, Evolution, Patient


@pytest.mark.django_db
def test_campos_sensibles_cifrados_en_la_base(make_tenant):
    t = make_tenant()
    p = Patient.objects.create(tenant=t, first_name="Ana", sex="F")
    a = Anamnesis.objects.create(tenant=t, patient=p,
                                 medications="Metformina 500 mg",
                                 reason_for_consultation="Diabetes tipo 2")
    e = Evolution.objects.create(tenant=t, patient=p, clinical_notes="Presión elevada hoy")

    # En la base, el texto plano NO debe estar.
    with connection.cursor() as c:
        c.execute("SELECT medications, reason_for_consultation FROM clinical_anamnesis WHERE id=%s", [a.id])
        raw_med, raw_reason = c.fetchone()
        c.execute("SELECT clinical_notes FROM clinical_evolution WHERE id=%s", [e.id])
        raw_notes = c.fetchone()[0]
    assert "Metformina" not in raw_med
    assert "Diabetes" not in raw_reason
    assert "Presión" not in raw_notes

    # Al leer por el ORM se descifra transparentemente.
    a.refresh_from_db(); e.refresh_from_db()
    assert a.medications == "Metformina 500 mg"
    assert a.reason_for_consultation == "Diabetes tipo 2"
    assert e.clinical_notes == "Presión elevada hoy"


@pytest.mark.django_db
def test_campo_vacio_no_se_cifra(make_tenant):
    t = make_tenant()
    p = Patient.objects.create(tenant=t, first_name="B", sex="M")
    a = Anamnesis.objects.create(tenant=t, patient=p, medications="")
    a.refresh_from_db()
    assert a.medications == ""
