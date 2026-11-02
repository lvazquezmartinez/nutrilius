"""Test del rate limiting de login (HU-23)."""
import pytest
from django.core.cache import cache
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_login_se_bloquea_tras_varios_fallos(make_user, settings):
    settings.LOGIN_MAX_ATTEMPTS = 5
    cache.clear()
    make_user(email="u@test.local", password="SuperSecret123", tenant=None)
    anon = APIClient()

    for _ in range(5):
        r = anon.post("/api/auth/login", {"email": "u@test.local", "password": "incorrecta"},
                      format="json")
        assert r.status_code in (400, 401)

    # 6º intento: bloqueado aunque la contraseña sea correcta
    r = anon.post("/api/auth/login", {"email": "u@test.local", "password": "SuperSecret123"},
                  format="json")
    assert r.status_code == 429


@pytest.mark.django_db
def test_login_exitoso_resetea_contador(make_user):
    cache.clear()
    make_user(email="ok@test.local", password="SuperSecret123", tenant=None)
    anon = APIClient()
    for _ in range(3):
        anon.post("/api/auth/login", {"email": "ok@test.local", "password": "mal"}, format="json")
    r = anon.post("/api/auth/login", {"email": "ok@test.local", "password": "SuperSecret123"},
                  format="json")
    assert r.status_code == 200  # login correcto antes del tope: pasa y resetea
