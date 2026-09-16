"""
Base DRF para recursos con scope por tenant (RNF-01 / DS-01).

`TenantScopedModelViewSet` filtra SIEMPRE por el tenant del usuario autenticado de
forma explícita (no depende solo del context-var), setea el tenant al crear y, si el
modelo tiene `created_by`, lo completa con el usuario. Si el usuario no tiene tenant
(p. ej. SUPER_ADMIN), no ve nada por estos endpoints.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .tenancy import set_current_tenant_id


class TenantScopedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def initial(self, request, *args, **kwargs):
        # Corre DESPUÉS de la autenticación de DRF: recién acá `request.user` es el
        # usuario del JWT. Fijamos el contexto de tenant para que los querysets de los
        # campos FK de los serializers (TenantManager) también queden acotados.
        super().initial(request, *args, **kwargs)
        set_current_tenant_id(self.get_tenant_id())

    def get_tenant_id(self):
        return getattr(self.request.user, "tenant_id", None)

    def get_queryset(self):
        model = self.queryset.model
        base = model.all_objects.all()
        tenant_id = self.get_tenant_id()
        if tenant_id is None:
            return base.none()
        return base.filter(tenant_id=tenant_id)

    def perform_create(self, serializer):
        model = serializer.Meta.model
        extra = {"tenant_id": self.get_tenant_id()}
        field_names = {f.name for f in model._meta.get_fields()}
        if "created_by" in field_names:
            extra["created_by"] = self.request.user
        serializer.save(**extra)
