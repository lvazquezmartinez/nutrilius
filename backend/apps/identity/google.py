"""
Verificación de identidad de Google (Sign in with Google).

El frontend obtiene un ID token con Google Identity Services y lo manda al backend;
acá se verifica contra NUESTRO Client ID y se extrae el email (ya verificado por
Google). No usa el client_secret: alcanza con el Client ID para validar el token.
"""
from django.conf import settings


class GoogleAuthError(Exception):
    pass


def verify_google_token(credential):
    """Devuelve {email, first_name, last_name} o lanza GoogleAuthError."""
    if not settings.GOOGLE_OAUTH_CLIENT_ID:
        raise GoogleAuthError("El login con Google no está configurado.")
    if not credential:
        raise GoogleAuthError("Falta el token de Google.")

    # Import diferido para no exigir la librería si no se usa.
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token

    try:
        info = id_token.verify_oauth2_token(
            credential, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
        )
    except ValueError as exc:
        raise GoogleAuthError("Token de Google inválido.") from exc

    if not info.get("email_verified"):
        raise GoogleAuthError("El email de Google no está verificado.")

    return {
        "email": info["email"].lower(),
        "first_name": info.get("given_name", ""),
        "last_name": info.get("family_name", ""),
    }
