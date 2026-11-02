"""Utilidades de rate limiting (HU-23)."""
from django.conf import settings
from django.core.cache import cache
from rest_framework.throttling import AnonRateThrottle


def client_ip(request) -> str:
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def login_blocked(ip: str) -> bool:
    return cache.get(f"login_fail:{ip}", 0) >= settings.LOGIN_MAX_ATTEMPTS


def record_login_failure(ip: str) -> None:
    key = f"login_fail:{ip}"
    cache.set(key, cache.get(key, 0) + 1, settings.LOGIN_BLOCK_SECONDS)


def reset_login_failures(ip: str) -> None:
    cache.delete(f"login_fail:{ip}")


class PublicEndpointThrottle(AnonRateThrottle):
    """Throttle para endpoints públicos sin login (reservas, PDF por token)."""
    scope = "public"
