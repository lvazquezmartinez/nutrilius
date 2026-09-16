"""Tests de gestión de usuarios internos del tenant (RF-05, DS-06)."""
import pytest

from apps.identity.models import Role, User

pytestmark = pytest.mark.django_db


def test_admin_lista_solo_usuarios_de_su_tenant(auth_client, make_tenant, make_user):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    client, admin = auth_client(email="admin@t1.local", role=Role.ADMIN, tenant=t1)
    make_user(email="colega@t1.local", role=Role.USER, tenant=t1)
    make_user(email="ajeno@t2.local", role=Role.USER, tenant=t2)

    r = client.get("/api/users")
    assert r.status_code == 200
    emails = {u["email"] for u in r.json()["results"]}
    assert "admin@t1.local" in emails and "colega@t1.local" in emails
    assert "ajeno@t2.local" not in emails  # aislamiento entre tenants


def test_admin_crea_usuario_interno(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, admin = auth_client(email="admin@t1.local", role=Role.ADMIN, tenant=t1)
    r = client.post("/api/users", {
        "email": "nuevo@t1.local", "password": "SuperSecret123", "role": "USER",
        "first_name": "Nuevo",
    }, format="json")
    assert r.status_code == 201
    nuevo = User.objects.get(email="nuevo@t1.local")
    assert nuevo.tenant_id == t1.id
    assert nuevo.email_verified is True


def test_user_comun_no_puede_gestionar_usuarios(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, user = auth_client(email="user@t1.local", role=Role.USER, tenant=t1)
    assert client.get("/api/users").status_code == 403
    assert client.post("/api/users", {
        "email": "x@t1.local", "password": "SuperSecret123", "role": "USER",
    }, format="json").status_code == 403


def test_toggle_activa_y_desactiva(auth_client, make_tenant, make_user):
    t1 = make_tenant("T1")
    client, admin = auth_client(email="admin@t1.local", role=Role.ADMIN, tenant=t1)
    colega = make_user(email="colega@t1.local", role=Role.USER, tenant=t1)

    r = client.post(f"/api/users/{colega.id}/toggle")
    assert r.status_code == 200
    colega.refresh_from_db()
    assert colega.is_active is False


def test_admin_no_puede_desactivarse_a_si_mismo(auth_client, make_tenant):
    t1 = make_tenant("T1")
    client, admin = auth_client(email="admin@t1.local", role=Role.ADMIN, tenant=t1)
    r = client.post(f"/api/users/{admin.id}/toggle")
    assert r.status_code == 400


def test_no_se_puede_togglear_usuario_de_otro_tenant(auth_client, make_tenant, make_user):
    t1 = make_tenant("T1")
    t2 = make_tenant("T2")
    client, admin = auth_client(email="admin@t1.local", role=Role.ADMIN, tenant=t1)
    ajeno = make_user(email="ajeno@t2.local", role=Role.USER, tenant=t2)
    r = client.post(f"/api/users/{ajeno.id}/toggle")
    assert r.status_code == 404  # no visible fuera del tenant
