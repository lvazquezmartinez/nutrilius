"""
Orquestación de IA (RF-IA-03 / RF-IA-09) — proveedor configurable detrás de una interfaz.

El LLM solo **propone** alimentos dentro de los parámetros que le pasa el motor de reglas;
nunca decide calorías ni restricciones. El proveedor real (OpenAI/OpenRouter) se enchufa
por configuración; mientras no haya API key, se usa `FakeProvider` (determinista), lo que
permite construir y testear todo el flujo sin depender de un servicio externo.
"""
from __future__ import annotations

from typing import Protocol

from django.conf import settings

# Distribución de las kcal diarias por comida (suma 1.0).
MEAL_SLOTS = [
    ("desayuno", 0.22),
    ("colacion", 0.08),
    ("almuerzo", 0.30),
    ("merienda", 0.10),
    ("cena", 0.30),
]
DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]


class PlanProvider(Protocol):
    name: str
    model: str

    def generate(self, payload: dict) -> dict:
        """Recibe el payload seudonimizado y devuelve {'content': {...}, 'raw': {...}}."""
        ...


class FakeProvider:
    """
    Proveedor determinista para desarrollo y tests. Genera un plan de 7 días que respeta
    exactamente los objetivos de kcal/macros del motor de reglas (para que la validación
    posterior pase) y evita textualmente las restricciones duras.
    """
    name = "fake"
    model = "fake-deterministic-v1"

    def generate(self, payload: dict) -> dict:
        kcal = payload["kcal"]
        macros = payload["macros"]
        days = []
        for day in DAYS:
            meals = []
            for slot, frac in MEAL_SLOTS:
                meals.append({
                    "slot": slot,
                    "text": f"Opción {slot} equilibrada (localizada a Argentina)",
                    "kcal": round(kcal * frac),
                    "protein_g": round(macros["protein_g"] * frac, 1),
                    "carbs_g": round(macros["carbs_g"] * frac, 1),
                    "fat_g": round(macros["fat_g"] * frac, 1),
                })
            days.append({"label": day, "meals": meals})
        return {"content": {"days": days}, "raw": {"provider": self.name, "echo": payload}}


def get_provider() -> PlanProvider:
    """
    Devuelve el proveedor configurado. Si no hay API key de IA, usa `FakeProvider`.
    (El proveedor real se implementa en un paso siguiente; la interfaz ya queda fija.)
    """
    api_key = getattr(settings, "AI_API_KEY", "") or ""
    provider = (getattr(settings, "AI_PROVIDER", "") or "").upper()
    if not api_key or provider in ("", "FAKE"):
        return FakeProvider()
    # TODO(Fase 4): OpenAIProvider / OpenRouterProvider con `api_key` y `AI_MODEL`.
    return FakeProvider()
