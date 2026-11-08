"""Tests del flujo de autenticación (RF-01..04, RF-03, DS-05)."""
import pytest

from apps.audit.models import AuditEvent
from apps.identity.models import (
    EmailVerificationToken,
    PasswordResetToken,
    User,
)
from apps.tenants.models import Tenant

pytestmark = pytest.mark.django_db


def test_register_crea_tenant_y_admin_sin_verificar(api):
    r = api.post("/api/auth/register", {
        "business_name": "Consultorio Uno",
        "email": "admin@uno.local",
        "password": "SuperSecret123",
    }, format="json")
    assert r.status_code == 201
    user = User.objects.get(email="admin@uno.local")
    assert user.tenant is not None
    assert user.tenant.name == "Consultorio Uno"
    assert user.email_verified is False
    assert Tenant.objects.count() == 1
    assert EmailVerificationToken.objects.filter(user=user, used_at__isnull=True).exists()


def test_register_rechaza_email_duplicado(api, make_user):
    make_user(email="dup@test.local")
    r = api.post("/api/auth/register", {
        "business_name": "X", "email": "dup@test.local", "password": "SuperSecret123",
    }, format="json")
    assert r.status_code == 400


def test_login_bloqueado_sin_confirmar_email(api, make_user):
    make_user(email="noconf@test.local", password="SuperSecret123", email_verified=False)
    r = api.post("/api/auth/login", {
        "email": "noconf@test.local", "password": "SuperSecret123",
    }, format="json")
    assert r.status_code == 400


def test_confirm_y_login(api):
    api.post("/api/auth/register", {
        "business_name": "Dos", "email": "admin@dos.local", "password": "SuperSecret123",
    }, format="json")
    token = EmailVerificationToken.objects.latest("created_at")

    r = api.post("/api/auth/confirm", {"token": token.token}, format="json")
    assert r.status_code == 200
    assert User.objects.get(email="admin@dos.local").email_verified is True

    r = api.post("/api/auth/login", {
        "email": "admin@dos.local", "password": "SuperSecret123",
    }, format="json")
    assert r.status_code == 200
    assert "access" in r.json() and "user" in r.json()


def test_token_de_verificacion_es_de_un_solo_uso(api):
    api.post("/api/auth/register", {
        "business_name": "Tres", "email": "admin@tres.local", "password": "SuperSecret123",
    }, format="json")
    token = EmailVerificationToken.objects.latest("created_at")
    assert api.post("/api/auth/confirm", {"token": token.token}, format="json").status_code == 200
    # segundo uso: inválido
    assert api.post("/api/auth/confirm", {"token": token.token}, format="json").status_code == 400


def test_confirm_token_invalido(api):
    r = api.post("/api/auth/confirm", {"token": "no-existe"}, format="json")
    assert r.status_code == 400


def test_me_requiere_auth(api, auth_client):
    assert api.get("/api/auth/me").status_code == 401
    client, user = auth_client(email="me@test.local")
    r = client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == "me@test.local"


def test_reset_password_flujo(api, make_user):
    make_user(email="reset@test.local", password="OldSecret123")
    r = api.post("/api/auth/request-reset", {"email": "reset@test.local"}, format="json")
    assert r.status_code == 200
    token = PasswordResetToken.objects.latest("created_at")

    r = api.post("/api/auth/reset", {"token": token.token, "password": "NewSecret456"}, format="json")
    assert r.status_code == 200

    # la contraseña nueva funciona (ya está verificado el email)
    r = api.post("/api/auth/login", {"email": "reset@test.local", "password": "NewSecret456"}, format="json")
    assert r.status_code == 200


def test_request_reset_no_revela_si_existe_el_email(api):
    # email inexistente: igual responde 200 (anti-enumeración, RF-04)
    r = api.post("/api/auth/request-reset", {"email": "fantasma@test.local"}, format="json")
    assert r.status_code == 200
    assert PasswordResetToken.objects.count() == 0


def test_eventos_de_auditoria_registrados(api):
    api.post("/api/auth/register", {
        "business_name": "Aud", "email": "aud@test.local", "password": "SuperSecret123",
    }, format="json")
    token = EmailVerificationToken.objects.latest("created_at")
    api.post("/api/auth/confirm", {"token": token.token}, format="json")
    api.post("/api/auth/login", {"email": "aud@test.local", "password": "SuperSecret123"}, format="json")

    acciones = set(AuditEvent.objects.values_list("action", flat=True))
    assert {"TENANT_REGISTERED", "EMAIL_CONFIRMED", "LOGIN"} <= acciones
