"""
Reserva de turnos por enlace público del consultorio (HU-18 / RF-26/27).

El enlace lleva el id del consultorio **firmado** (`django.core.signing`): si se altera,
la firma no valida y se responde "enlace no válido". No requiere login. Muestra los
horarios libres (sin los ocupados). Al confirmar crea el turno y, si el contacto no
existe como paciente, lo crea marcado como nuevo.
"""
from __future__ import annotations

import datetime

from django.core import signing
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clinical.models import Patient
from apps.tenants.models import Tenant, TenantSettings

from .models import Visit, VisitStatus

SALT = "nutrilius.booking"
WORK_START_H = 9
WORK_END_H = 17
SLOT_MINUTES = 45
HORIZON_DAYS = 14


def make_booking_token(tenant_id: int) -> str:
    return signing.dumps(tenant_id, salt=SALT)


def tenant_from_token(token: str) -> Tenant | None:
    try:
        tenant_id = signing.loads(token, salt=SALT, max_age=60 * 60 * 24 * 90)
    except signing.BadSignature:
        return None
    return Tenant.objects.filter(id=tenant_id, active=True).first()


def _key(dt) -> str:
    return timezone.localtime(dt).strftime("%Y-%m-%d %H:%M")


def available_slots(tenant) -> list[datetime.datetime]:
    now = timezone.localtime()
    taken = {
        _key(dt) for dt in Visit.all_objects.filter(
            tenant=tenant, status=VisitStatus.SCHEDULED, scheduled_at__gte=now
        ).values_list("scheduled_at", flat=True)
    }
    slots = []
    for d in range(HORIZON_DAYS):
        day = (now + datetime.timedelta(days=d)).date()
        if day.weekday() >= 5:  # fin de semana
            continue
        t = timezone.make_aware(datetime.datetime.combine(day, datetime.time(WORK_START_H, 0)))
        end = timezone.make_aware(datetime.datetime.combine(day, datetime.time(WORK_END_H, 0)))
        while t < end:
            if t > now and _key(t) not in taken:
                slots.append(t)
            t += datetime.timedelta(minutes=SLOT_MINUTES)
    return slots


class PublicBookingView(APIView):
    """GET: info del consultorio + horarios libres. POST: reservar turno."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        tenant = tenant_from_token(token)
        if tenant is None:
            return Response({"detail": "Enlace no válido."}, status=404)
        cfg = TenantSettings.objects.filter(tenant_id=tenant.id).first()
        return Response({
            "consultorio": (getattr(cfg, "business_name", "") or tenant.name),
            "profesional": getattr(cfg, "nutritionist_name", "") or "",
            "slots": [s.isoformat() for s in available_slots(tenant)],
        })

    def post(self, request, token):
        tenant = tenant_from_token(token)
        if tenant is None:
            return Response({"detail": "Enlace no válido."}, status=404)

        slot = request.data.get("slot")
        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").strip()
        phone = (request.data.get("phone") or "").strip()
        if not slot or not name:
            return Response({"detail": "Faltan datos (horario y nombre)."}, status=400)

        try:
            when = datetime.datetime.fromisoformat(slot)
        except ValueError:
            return Response({"detail": "Horario inválido."}, status=400)
        if timezone.is_naive(when):
            when = timezone.make_aware(when)

        if _key(when) not in {_key(s) for s in available_slots(tenant)}:
            return Response({"detail": "Ese horario ya no está disponible."}, status=409)

        # Buscar paciente por email (si hay) o crear uno nuevo.
        patient = None
        if email:
            patient = Patient.all_objects.filter(tenant=tenant, email=email).first()
        if patient is None:
            first, _, last = name.partition(" ")
            patient = Patient.all_objects.create(
                tenant=tenant, first_name=first, last_name=last,
                email=email, phone=phone, is_new=True,
                notes="Alta desde reserva pública.",
            )

        visit = Visit.all_objects.create(
            tenant=tenant, patient=patient, scheduled_at=when,
            status=VisitStatus.SCHEDULED, reason="Reserva online",
        )
        return Response({"ok": True, "visit_id": visit.id,
                         "scheduled_at": visit.scheduled_at.isoformat()}, status=201)
