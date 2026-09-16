"""Health checks para la VM / load balancer / monitoreo."""
from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class LiveView(APIView):
    """Liveness: el proceso responde."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "live"})


class ReadyView(APIView):
    """Readiness: dependencias críticas (DB) disponibles."""

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_ok = True
        except Exception:
            db_ok = False
        status_code = 200 if db_ok else 503
        return Response({"status": "ready" if db_ok else "not-ready", "db": db_ok},
                        status=status_code)
