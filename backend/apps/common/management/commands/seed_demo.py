"""
Carga una cuenta de demostración con datos **ficticios** (no reales).

Idempotente: borra la demo previa y la recrea. Usa siempre el proveedor de IA `fake`
(no llama ni gasta la API real). Crea un consultorio, un usuario, ~12 pacientes con
anamnesis, métricas, evoluciones, turnos y consentimiento, y al menos un plan en cada
estado (BORRADOR_IA, EN_REVISION, APROBADO, COMPARTIDO).

    python manage.py seed_demo [--email ...] [--password ...] [--patients 12]
"""
import datetime
import random

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.tenants.models import Tenant, TenantSettings, PlanType
from apps.identity.models import User, Role
from apps.clinical.models import Patient, Anamnesis, PatientMetric, Evolution
from apps.scheduling.models import Visit, VisitStatus
from apps.plans.models import NutritionPlan, PatientConsent, PlanStatus
from apps.plans.services import generation

DEMO_TENANT = "Consultorio Demo Nutrilius"
FIRST = ["María", "Juan", "Sofía", "Lucas", "Valentina", "Mateo", "Camila", "Benjamín",
         "Martina", "Thiago", "Julieta", "Santiago", "Emma", "Nicolás"]
LAST = ["González", "Rodríguez", "Fernández", "López", "Martínez", "Pérez", "Gómez",
        "Díaz", "Romero", "Sosa", "Torres", "Ruiz", "Ramírez", "Flores"]
GOALS = ["DESCENSO", "MANTENIMIENTO", "AUMENTO"]
ALLERGIES = ["", "", "Maní", "Frutos secos", ""]
RESTRICTIONS = ["", "Intolerancia a la lactosa", "", "Vegetariano/a", ""]


class Command(BaseCommand):
    help = "Carga una cuenta de demostración con datos ficticios (idempotente)."

    def add_arguments(self, parser):
        parser.add_argument("--email", default="demo@nutrilius.com.ar")
        parser.add_argument("--password", default="NutriliusDemo2026")
        parser.add_argument("--patients", type=int, default=12)

    @transaction.atomic
    def handle(self, *args, **opts):
        settings.AI_PROVIDER = "FAKE"  # la demo nunca llama a la API real
        rnd = random.Random(2026)
        email, password, n = opts["email"], opts["password"], opts["patients"]

        # ── Idempotencia: borrar demo previa ──
        Tenant.objects.filter(name=DEMO_TENANT).delete()
        User.objects.filter(email=email).delete()

        tenant = Tenant.objects.create(name=DEMO_TENANT)
        TenantSettings.objects.create(
            tenant=tenant, nutritionist_name="Dra. Laura Demo", business_name=DEMO_TENANT,
            license_number="MP 12345", slug="demo", plan_type=PlanType.PRO,
        )
        user = User.objects.create_user(
            email=email, password=password, first_name="Laura", last_name="Demo",
            role=Role.ADMIN, tenant=tenant, email_verified=True, is_active=True,
        )

        today = timezone.localdate()
        now = timezone.now()
        patients = []
        for i in range(n):
            fn, ln = FIRST[i % len(FIRST)], LAST[(i * 3) % len(LAST)]
            sex = "F" if i % 2 == 0 else "M"
            age = rnd.randint(22, 60)
            p = Patient.objects.create(
                tenant=tenant, created_by=user, first_name=fn, last_name=ln,
                dni=str(45_000_001 + i), sex=sex,
                birth_date=datetime.date(today.year - age, ((i % 12) + 1), ((i % 27) + 1)),
                phone=f"+54 351 555 {1000 + i:04d}", email=f"{fn.lower()}.{ln.lower()}@example.com",
                address=f"Calle Ficticia {100 + i}, Córdoba", is_new=(i >= n - 2),
                notes="Paciente de demostración (datos ficticios).",
            )
            patients.append(p)

            # Los primeros ~8 pacientes tienen historia clínica completa.
            if i < max(8, n - 4):
                self._clinical_history(tenant, user, p, rnd, today, now, sex)

        # Planes en cada estado (sobre los primeros 4 pacientes, con consentimiento).
        self._plans_in_every_state(tenant, user, patients[:4])

        self.stdout.write(self.style.SUCCESS(
            f"\n✅ Demo cargada:\n"
            f"   Consultorio : {DEMO_TENANT}\n"
            f"   Usuario     : {email}\n"
            f"   Contraseña  : {password}\n"
            f"   Pacientes   : {len(patients)} · Planes en 4 estados\n"))

    # ──────────────────────────────────────────────────────────────────────────
    def _clinical_history(self, tenant, user, p, rnd, today, now, sex):
        h_cm = rnd.randint(158, 185)
        base_w = rnd.uniform(58, 95)
        Anamnesis.objects.create(
            tenant=tenant, created_by=user, patient=p,
            occupation=rnd.choice(["Docente", "Comerciante", "Empleada/o", "Profesional"]),
            reason_for_consultation="Mejorar hábitos y composición corporal.",
            meals_per_day=4, who_cooks="Ella/él mismo/a",
            food_allergies=rnd.choice(ALLERGIES),
            medical_cultural_restrictions=rnd.choice(RESTRICTIONS),
            physical_activity="Caminatas 2-3 veces por semana.",
            weight_kg=round(base_w, 1), height_cm=h_cm, waist_cm=rnd.randint(78, 104),
            recall_24h_breakfast="Café con leche + tostadas integrales",
            recall_24h_lunch="Pollo con arroz y ensalada",
            recall_24h_dinner="Ensalada con huevo",
            final_comments="Buena predisposición al cambio.",
        )
        # Métricas + evoluciones en el tiempo (peso bajando, para que se vea la tendencia).
        for k, days_ago in enumerate((90, 60, 30, 5)):
            w = round(base_w - k * rnd.uniform(0.8, 1.6), 1)
            bmi = round(w / ((h_cm / 100) ** 2), 2)
            PatientMetric.objects.create(
                tenant=tenant, created_by=user, patient=p,
                measured_at=now - datetime.timedelta(days=days_ago),
                weight_kg=w, height_m=round(h_cm / 100, 2), bmi=bmi, waist_cm=rnd.randint(76, 100),
            )
            Evolution.objects.create(
                tenant=tenant, created_by=user, patient=p, date=today - datetime.timedelta(days=days_ago),
                weight_kg=w, height_cm=h_cm, bmi=bmi, waist_cm=rnd.randint(76, 100),
                hip_cm=rnd.randint(94, 110), arm_cm=rnd.randint(26, 34),
                body_fat_pct=round(rnd.uniform(22, 34) - k, 1), muscle_mass_pct=round(rnd.uniform(30, 38) + k * 0.6, 1),
                blood_pressure_systolic=rnd.randint(110, 128), blood_pressure_diastolic=rnd.randint(70, 84),
                clinical_notes="Control. Buena adherencia.", dietary_assessment="Cumple 5/7 días.",
                next_visit_objectives="Sumar un día de actividad física.",
            )
        # Turnos: pasado completado + futuro agendado.
        Visit.objects.create(tenant=tenant, created_by=user, patient=p,
            scheduled_at=now - datetime.timedelta(days=30), duration_minutes=45,
            status=VisitStatus.COMPLETED, reason="Primera consulta")
        Visit.objects.create(tenant=tenant, created_by=user, patient=p,
            scheduled_at=now + datetime.timedelta(days=rnd.randint(1, 20)), duration_minutes=45,
            status=VisitStatus.SCHEDULED, reason="Control mensual")
        # Consentimiento de IA activo.
        PatientConsent.objects.create(tenant=tenant, recorded_by=user, patient=p,
            granted=True, granted_at=now, method="verbal")

    def _plans_in_every_state(self, tenant, user, patients):
        targets = [
            (PlanStatus.BORRADOR_IA, None),
            (PlanStatus.EN_REVISION, "submit"),
            (PlanStatus.APROBADO, "approve"),
            (PlanStatus.COMPARTIDO, "share"),
        ]
        for p, (state, step) in zip(patients, targets):
            plan = NutritionPlan.objects.create(tenant=tenant, created_by=user, patient=p,
                                                title=f"Plan de {p.first_name}")
            generation.generate_for_plan(plan, goal="DESCENSO", activity_level="MODERATE", user=user)
            plan.refresh_from_db()
            if step in ("submit",):
                plan.submit_for_review()
            if step in ("approve", "share"):
                plan.approve(user)
            if step == "share":
                import secrets
                plan.share(token=secrets.token_urlsafe(24))
