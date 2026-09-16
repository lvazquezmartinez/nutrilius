from rest_framework.permissions import BasePermission

from .models import Role


class IsTenantAdmin(BasePermission):
    """Solo ADMIN del tenant (gestión de usuarios internos, config)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == Role.ADMIN)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == Role.SUPER_ADMIN)
