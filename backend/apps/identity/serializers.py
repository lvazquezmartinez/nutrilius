from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Role, User


class RegisterSerializer(serializers.Serializer):
    """Alta de tenant + usuario admin (RF-01)."""

    business_name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con ese email.")
        return value.lower()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role",
                  "is_active", "email_verified", "created_at"]
        read_only_fields = ["id", "role", "is_active", "email_verified", "created_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Alta de usuario interno por el ADMIN (RF-05)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "password"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con ese email.")
        return value.lower()

    def validate_role(self, value):
        if value == Role.SUPER_ADMIN:
            raise serializers.ValidationError("No se puede crear un super admin desde acá.")
        return value


class GoogleRegisterSerializer(serializers.Serializer):
    """Registro de consultorio con Google: el token + lo que Google no aporta."""

    credential = serializers.CharField()
    business_name = serializers.CharField(max_length=200)
    first_name = serializers.CharField(max_length=120, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=120, required=False, allow_blank=True)


class RequestResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login que además exige email confirmado (RF-03) y adjunta datos del usuario."""

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.email_verified:
            raise serializers.ValidationError(
                {"detail": "Confirmá tu email antes de iniciar sesión."}
            )
        if not self.user.is_active:
            raise serializers.ValidationError({"detail": "La cuenta está desactivada."})
        data["user"] = UserSerializer(self.user).data
        return data
