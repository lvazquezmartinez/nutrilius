"""Fixtures compartidas para los tests."""
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.identity.models import User
from apps.tenants.models import Tenant


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def make_tenant(db):
    def _make(name="Consultorio"):
        return Tenant.objects.create(name=name)
    return _make


@pytest.fixture
def make_user(db):
    def _make(email="user@test.local", password="SuperSecret123",
              tenant=None, email_verified=True, is_active=True):
        return User.objects.create_user(
            email=email, password=password, tenant=tenant,
            email_verified=email_verified, is_active=is_active,
        )
    return _make


@pytest.fixture
def auth_client(make_user):
    """Devuelve (client, user) autenticado con JWT."""
    def _make(**kwargs):
        user = make_user(**kwargs)
        client = APIClient()
        token = RefreshToken.for_user(user).access_token
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return client, user
    return _make
