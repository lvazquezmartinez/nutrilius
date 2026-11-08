"""Tests de configuración del consultorio (HU-17)."""
import pytest

from rest_framework.test import APIClient


@pytest.fixture
def ctx(db, make_tenant, auth_client):
    t = make_tenant()
    client, _ = auth_client(tenant=t, email="pro@t.local")
    return t, client


def test_usuario_del_consultorio_lee_la_config(ctx):
    _, client = ctx
    r = client.get("/api/settings")
    assert r.status_code == 200
    assert "business_name" in r.data


def test_usuario_del_consultorio_actualiza_la_config(ctx):
    _, client = ctx
    r = client.put("/api/settings", {
        "business_name": "Mi Consultorio", "nutritionist_name": "Dra. X",
        "license_number": "MP 999",
    }, format="json")
    assert r.status_code == 200
    assert r.data["business_name"] == "Mi Consultorio"
    assert r.data["license_number"] == "MP 999"


def test_no_autenticado_no_puede_editar():
    r = APIClient().put("/api/settings", {"business_name": "Hack"}, format="json")
    assert r.status_code in (401, 403)
