"""Smoke test del comando seed_demo: idempotente y con planes en los 4 estados."""
import pytest
from django.core.management import call_command

from apps.tenants.models import Tenant
from apps.clinical.models import Patient
from apps.plans.models import NutritionPlan, PlanStatus


@pytest.mark.django_db
def test_seed_demo_es_idempotente_y_crea_estados():
    call_command("seed_demo", patients=6)
    call_command("seed_demo", patients=6)  # segunda vez: no debe duplicar ni fallar

    tenant = Tenant.objects.get(name="Consultorio Demo Nutrilius")
    assert Patient.all_objects.filter(tenant=tenant).count() == 6

    estados = set(NutritionPlan.all_objects.filter(tenant=tenant).values_list("status", flat=True))
    assert {PlanStatus.BORRADOR_IA, PlanStatus.EN_REVISION,
            PlanStatus.APROBADO, PlanStatus.COMPARTIDO} <= estados
