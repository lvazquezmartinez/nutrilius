"""Tests de configuración del consultorio (HU-17)."""
import pytest

from apps.identity.models import Role


@pytest.fixture
def users(db, make_tenant, auth_client):
    t = make_tenant()
    admin_client, _ = auth_client(tenant=t, role=Role.ADMIN, email="admin@t.local")
    user_client, _ = auth_client(tenant=t, role=Role.USER, email="user@t.local")
    return t, admin_client, user_client


def test_cualquier_usuario_lee_la_config(users):
    _, _, user_client = users
    r = user_client.get("/api/settings")
    assert r.status_code == 200
    assert "business_name" in r.data


def test_admin_actualiza_la_config(users):
    _, admin_client, _ = users
    r = admin_client.put("/api/settings", {
        "business_name": "Mi Consultorio", "nutritionist_name": "Dra. X",
        "license_number": "MP 999",
    }, format="json")
    assert r.status_code == 200
    assert r.data["business_name"] == "Mi Consultorio"
    assert r.data["license_number"] == "MP 999"


def test_usuario_no_admin_no_puede_editar(users):
    _, _, user_client = users
    r = user_client.put("/api/settings", {"business_name": "Hack"}, format="json")
    assert r.status_code == 403
