"""Envío de emails de identidad como tareas async (RNF-10). En dev corren eager."""
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_verification_email(email, token):
    link = f"{settings.APP_FRONTEND_URL}/confirmar-email?token={token}"
    send_mail(
        subject="Confirmá tu cuenta en Nutrilius",
        message=f"Hola, confirmá tu email ingresando a: {link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


@shared_task
def send_password_reset_email(email, token):
    link = f"{settings.APP_FRONTEND_URL}/reset-password?token={token}"
    send_mail(
        subject="Restablecé tu contraseña de Nutrilius",
        message=f"Para restablecer tu contraseña ingresá a: {link}\n"
                f"Si no lo solicitaste, ignorá este mensaje.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
