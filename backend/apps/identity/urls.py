from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ConfirmEmailView,
    GoogleLoginView,
    GoogleRegisterView,
    LoginView,
    MeView,
    RegisterView,
    RequestResetView,
    ResetView,
)

urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/confirm", ConfirmEmailView.as_view(), name="confirm-email"),
    path("auth/login", LoginView.as_view(), name="login"),
    path("auth/google", GoogleLoginView.as_view(), name="google-login"),
    path("auth/google/register", GoogleRegisterView.as_view(), name="google-register"),
    path("auth/refresh", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me", MeView.as_view(), name="me"),
    path("auth/request-reset", RequestResetView.as_view(), name="request-reset"),
    path("auth/reset", ResetView.as_view(), name="reset"),
]
