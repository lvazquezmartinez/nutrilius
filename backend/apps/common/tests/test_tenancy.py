"""
Tests de la capa de tenancy (RNF-01 / DS-01).

Validan el context-var de tenant y que el `TenantMiddleware` lo setea desde el
usuario autenticado y lo limpia al responder. El filtrado del `TenantManager`
sobre entidades reales se prueba con el primer modelo tenant-owned (Fase 2); el
aislamiento a nivel endpoint ya se cubre en `identity/tests/test_users.py`.
"""
import pytest

from apps.common.tenancy import (
    get_current_tenant_id,
    set_current_tenant_id,
)

pytestmark = pytest.mark.django_db


def test_context_var_set_get():
    set_current_tenant_id(None)
    assert get_current_tenant_id() is None
    set_current_tenant_id(42)
    assert get_current_tenant_id() == 42
    set_current_tenant_id(None)


def test_middleware_setea_y_limpia_tenant(client, make_user, make_tenant):
    """El TenantMiddleware setea el tenant del usuario autenticado y lo limpia al responder."""
    from rest_framework_simplejwt.tokens import RefreshToken

    t1 = make_tenant("T1")
    user = make_user(email="admin@t1.local", tenant=t1)
    token = RefreshToken.for_user(user).access_token

    # Un request autenticado no debe dejar el context-var "pegado" tras responder.
    resp = client.get("/api/auth/me", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert resp.status_code == 200
    assert get_current_tenant_id() is None  # limpiado en process_response
