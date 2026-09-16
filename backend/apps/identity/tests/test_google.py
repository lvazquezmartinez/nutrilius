"""Tests de login/registro con Google (RF-01/02 variante). Se mockea la verificación."""
import pytest

from apps.identity.google import GoogleAuthError
from apps.identity.models import Role, User

pytestmark = pytest.mark.django_db


def _fake_verify(data):
    def _f(credential):
        return data
    return _f


def test_google_login_usuario_existente(api, make_user, make_tenant, monkeypatch):
    t = make_tenant("T1")
    make_user(email="pro@gmail.com", role=Role.ADMIN, tenant=t)
    monkeypatch.setattr("apps.identity.views.verify_google_token",
                        _fake_verify({"email": "pro@gmail.com", "first_name": "Pro", "last_name": "X"}))
    r = api.post("/api/auth/google", {"credential": "tok"}, format="json")
    assert r.status_code == 200
    assert "access" in r.json()
    assert r.json()["user"]["email"] == "pro@gmail.com"


def test_google_login_nuevo_pide_registro(api, monkeypatch):
    monkeypatch.setattr("apps.identity.views.verify_google_token",
                        _fake_verify({"email": "nuevo@gmail.com", "first_name": "N", "last_name": "U"}))
    r = api.post("/api/auth/google", {"credential": "tok"}, format="json")
    assert r.status_code == 200
    assert r.json()["needs_registration"] is True
    assert r.json()["email"] == "nuevo@gmail.com"


def test_google_register_crea_consultorio(api, monkeypatch):
    monkeypatch.setattr("apps.identity.views.verify_google_token",
                        _fake_verify({"email": "duenio@gmail.com", "first_name": "Ana", "last_name": "G"}))
    r = api.post("/api/auth/google/register",
                 {"credential": "tok", "business_name": "Consultorio Ana"}, format="json")
    assert r.status_code == 201
    u = User.objects.get(email="duenio@gmail.com")
    assert u.role == Role.ADMIN
    assert u.email_verified is True                 # Google ya verificó el email
    assert u.tenant.name == "Consultorio Ana"
    assert u.has_usable_password() is False         # entra por Google, sin contraseña
    assert "access" in r.json()


def test_google_register_rechaza_email_existente(api, make_user, monkeypatch):
    make_user(email="dup@gmail.com")
    monkeypatch.setattr("apps.identity.views.verify_google_token",
                        _fake_verify({"email": "dup@gmail.com", "first_name": "", "last_name": ""}))
    r = api.post("/api/auth/google/register",
                 {"credential": "tok", "business_name": "X"}, format="json")
    assert r.status_code == 400


def test_google_token_invalido(api, monkeypatch):
    def _raise(credential):
        raise GoogleAuthError("Token de Google inválido.")
    monkeypatch.setattr("apps.identity.views.verify_google_token", _raise)
    r = api.post("/api/auth/google", {"credential": "bad"}, format="json")
    assert r.status_code == 400
