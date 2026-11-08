from rest_framework.permissions import BasePermission


class IsTenantAdmin(BasePermission):
    """Usuario autenticado que pertenece a un consultorio.

    Cada consultorio tiene un único usuario, que es su administrador. El recurso
    ya queda acotado al consultorio del usuario por la capa de tenancy, de modo
    que basta con exigir un usuario autenticado con consultorio asignado.
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.tenant_id)
