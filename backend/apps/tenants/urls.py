from django.urls import path

from .views import TenantSettingsView

urlpatterns = [
    path("settings", TenantSettingsView.as_view(), name="tenant-settings"),
]
