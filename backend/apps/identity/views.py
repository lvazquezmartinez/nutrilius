from django.conf import settings
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.audit.models import AuditEvent
from apps.audit.services import log_event
from apps.tenants.models import Tenant

from .google import GoogleAuthError, verify_google_token
from .models import EmailVerificationToken, PasswordResetToken, Role, User
from .permissions import IsTenantAdmin
from .serializers import (
    EmailTokenObtainPairSerializer,
    GoogleRegisterSerializer,
    RegisterSerializer,
    RequestResetSerializer,
    ResetSerializer,
    UserCreateSerializer,
    UserSerializer,
)
from .tasks import send_password_reset_email, send_verification_email


def _tokens_for(user):
    """Emite el par access/refresh + datos del usuario (mismo formato que el login)."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }


def _dispatch_email(task, *args):
    """
    Encola una tarea de email de forma tolerante a fallos. Si no hay broker
    disponible (serverless sin Celery), no rompe el request; la migración a
    Cloud Tasks queda pendiente. Ver INFRAESTRUCTURA.md / deuda técnica.
    """
    import logging
    try:
        task.delay(*args)
    except Exception:  # broker no disponible u otro fallo de encolado
        logging.getLogger("identity").warning("No se pudo encolar %s", task.name)


class RegisterView(APIView):
    """Alta de consultorio + usuario admin (RF-01)."""

    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        tenant = Tenant.objects.create(name=data["business_name"])
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            role=Role.ADMIN,
            tenant=tenant,
            email_verified=False,
        )
        token = EmailVerificationToken.issue(user, settings.EMAIL_VERIFICATION_TTL_HOURS)
        _dispatch_email(send_verification_email, user.email, token.token)
        log_event(AuditEvent.Action.TENANT_REGISTERED, actor=user, tenant_id=tenant.id,
                  entity="Tenant", entity_id=tenant.id, request=request)
        return Response(
            {"detail": "Cuenta creada. Revisá tu email para confirmarla."},
            status=status.HTTP_201_CREATED,
        )


class ConfirmEmailView(APIView):
    """Confirmación de email por token (RF-03)."""

    permission_classes = [AllowAny]

    def post(self, request):
        token_value = request.data.get("token", "")
        token = EmailVerificationToken.objects.filter(token=token_value).first()
        if token is None or not token.is_valid():
            return Response({"detail": "Token inválido o vencido."},
                            status=status.HTTP_400_BAD_REQUEST)
        user = token.user
        user.email_verified = True
        user.save(update_fields=["email_verified"])
        token.mark_used()
        log_event(AuditEvent.Action.EMAIL_CONFIRMED, actor=user, request=request)
        return Response({"detail": "Email confirmado. Ya podés iniciar sesión."})


class LoginView(TokenObtainPairView):
    """Login JWT (RF-02). Exige email confirmado."""

    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        from rest_framework.response import Response as DRFResponse
        from apps.common.ratelimit import (
            client_ip, login_blocked, record_login_failure, reset_login_failures,
        )
        ip = client_ip(request)
        if login_blocked(ip):
            return DRFResponse(
                {"detail": "Demasiados intentos fallidos. Probá de nuevo en unos minutos."},
                status=429)
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            # simplejwt lanza excepción ante credenciales inválidas (no devuelve 401).
            record_login_failure(ip)
            log_event(AuditEvent.Action.LOGIN_FAILED, request=request,
                      metadata={"email": request.data.get("email", "")})
            raise
        if response.status_code == 200:
            reset_login_failures(ip)
            user = User.objects.filter(email__iexact=request.data.get("email", "")).first()
            log_event(AuditEvent.Action.LOGIN, actor=user, request=request)
        return response


class GoogleLoginView(APIView):
    """Login con Google. Si el usuario no existe, indica que falta registrarse."""

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = verify_google_token(request.data.get("credential", ""))
        except GoogleAuthError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=data["email"], is_active=True).first()
        if user is None:
            # El frontend muestra el formulario de registro con estos datos precargados.
            return Response({"needs_registration": True, **data})

        log_event(AuditEvent.Action.LOGIN, actor=user, request=request,
                  metadata={"via": "google"})
        return Response(_tokens_for(user))


class GoogleRegisterView(APIView):
    """Registro de consultorio con Google + formulario para completar lo que falta."""

    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = GoogleRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            data = verify_google_token(serializer.validated_data["credential"])
        except GoogleAuthError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=data["email"]).exists():
            return Response({"detail": "Ya existe una cuenta con ese email."},
                            status=status.HTTP_400_BAD_REQUEST)

        tenant = Tenant.objects.create(name=serializer.validated_data["business_name"])
        user = User.objects.create_user(
            email=data["email"],
            password=None,  # sin contraseña: entra por Google (o setea una vía reset)
            first_name=serializer.validated_data.get("first_name") or data["first_name"],
            last_name=serializer.validated_data.get("last_name") or data["last_name"],
            role=Role.ADMIN,
            tenant=tenant,
            email_verified=True,  # Google ya verificó el email
        )
        log_event(AuditEvent.Action.TENANT_REGISTERED, actor=user, tenant_id=tenant.id,
                  entity="Tenant", entity_id=tenant.id, request=request,
                  metadata={"via": "google"})
        return Response(_tokens_for(user), status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class RequestResetView(APIView):
    """Solicitud de reset (RF-04). No revela si el email existe (anti-enumeración)."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user is not None:
            token = PasswordResetToken.issue(user, settings.PASSWORD_RESET_TTL_HOURS)
            _dispatch_email(send_password_reset_email, user.email, token.token)
            log_event(AuditEvent.Action.PASSWORD_RESET_REQUEST, actor=user, request=request)
        return Response({"detail": "Si el email existe, te enviamos un enlace."})


class ResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = PasswordResetToken.objects.filter(
            token=serializer.validated_data["token"]
        ).first()
        if token is None or not token.is_valid():
            return Response({"detail": "Token inválido o vencido."},
                            status=status.HTTP_400_BAD_REQUEST)
        user = token.user
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        token.mark_used()
        log_event(AuditEvent.Action.PASSWORD_RESET, actor=user, request=request)
        return Response({"detail": "Contraseña actualizada."})


class UserListCreateView(generics.ListCreateAPIView):
    """Gestión de usuarios internos del tenant (RF-05). Solo ADMIN."""

    permission_classes = [IsTenantAdmin]

    def get_queryset(self):
        return User.objects.filter(tenant_id=self.request.user.tenant_id).order_by("email")

    def get_serializer_class(self):
        return UserCreateSerializer if self.request.method == "POST" else UserSerializer

    def perform_create(self, serializer):
        user = serializer.save(
            tenant_id=self.request.user.tenant_id,
            email_verified=True,  # alta interna por el admin
            is_active=True,
        )
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        log_event(AuditEvent.Action.USER_CREATED, actor=self.request.user,
                  entity="User", entity_id=user.id, request=self.request)


class UserToggleView(APIView):
    """Activar / desactivar un usuario del tenant (RF-05). Solo ADMIN."""

    permission_classes = [IsTenantAdmin]

    def post(self, request, pk):
        user = User.objects.filter(pk=pk, tenant_id=request.user.tenant_id).first()
        if user is None:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        if user.id == request.user.id:
            return Response({"detail": "No podés desactivarte a vos mismo."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        log_event(AuditEvent.Action.USER_TOGGLED, actor=request.user, entity="User",
                  entity_id=user.id, metadata={"is_active": user.is_active}, request=request)
        return Response(UserSerializer(user).data)
