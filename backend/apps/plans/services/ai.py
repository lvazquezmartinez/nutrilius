"""
Orquestación de IA (RF-IA-03 / RF-IA-07 / RF-IA-09) — proveedor configurable tras interfaz.

El LLM solo **propone** alimentos dentro de los parámetros que le pasa el motor de reglas;
nunca decide calorías ni restricciones. El prompt le pide armar el menú según las Guías
Alimentarias para la Población Argentina e informar las porciones por grupo de cada comida,
que después controla `validation.check_guidelines`. El proveedor real (OpenAI, o compatible como
OpenRouter) se enchufa por configuración; sin API key se usa `FakeProvider` (determinista),
lo que permite construir y testear el flujo sin depender de un servicio externo ni de red.

`generate(payload)` devuelve siempre::

    {"content": {...}, "raw": {...}, "usage": {"input_tokens", "output_tokens", "estimated_cost_usd"}}
"""
from __future__ import annotations

import json
from typing import Protocol

from django.conf import settings

from .validation import GAPA_GROUPS

# Distribución de las kcal diarias por comida (suma 1.0).
MEAL_SLOTS = [
    ("desayuno", 0.22),
    ("colacion", 0.08),
    ("almuerzo", 0.30),
    ("merienda", 0.10),
    ("cena", 0.30),
]
# Porciones por grupo de las Guías Alimentarias que aporta cada comida en el FakeProvider
# (suman 5 verduras/frutas, 4 cereales, 3 lácteos, 1 carne/huevo y 2 aceites por día).
FAKE_GROUPS = {
    "desayuno": {"verduras_frutas": 1, "cereales_legumbres": 1, "lacteos": 1,
                 "carnes_huevos": 0, "aceites_semillas": 0},
    "colacion": {"verduras_frutas": 1, "cereales_legumbres": 0, "lacteos": 0,
                 "carnes_huevos": 0, "aceites_semillas": 0},
    "almuerzo": {"verduras_frutas": 1, "cereales_legumbres": 1, "lacteos": 0,
                 "carnes_huevos": 1, "aceites_semillas": 1},
    "merienda": {"verduras_frutas": 0, "cereales_legumbres": 1, "lacteos": 1,
                 "carnes_huevos": 0, "aceites_semillas": 0},
    "cena":     {"verduras_frutas": 2, "cereales_legumbres": 1, "lacteos": 1,
                 "carnes_huevos": 0, "aceites_semillas": 1},
}
DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

# Precio orientativo (USD por 1M de tokens) para estimar el costo (RF-IA-07).
# Ajustable; si el modelo no está, el costo queda en None.
MODEL_PRICES = {
    "gpt-4o-mini": {"in": 0.15, "out": 0.60},
    "gpt-4o":      {"in": 2.50, "out": 10.00},
    "gpt-4.1-mini":{"in": 0.40, "out": 1.60},
}


def _empty_usage() -> dict:
    return {"input_tokens": None, "output_tokens": None, "estimated_cost_usd": None}


def _estimate_cost(model: str, in_tokens: int | None, out_tokens: int | None):
    price = MODEL_PRICES.get(model)
    if not price or in_tokens is None or out_tokens is None:
        return None
    return round((in_tokens * price["in"] + out_tokens * price["out"]) / 1_000_000, 6)


class PlanProvider(Protocol):
    name: str
    model: str

    def generate(self, payload: dict) -> dict: ...


# ── Fake (dev/tests) ─────────────────────────────────────────────────────────────

class FakeProvider:
    """
    Proveedor determinista para desarrollo y tests. Genera 7 días que respetan exactamente
    los objetivos de kcal/macros (para que la validación pase) sin llamar a ningún servicio.
    """
    name = "fake"
    model = "fake-deterministic-v1"

    def generate(self, payload: dict) -> dict:
        kcal = payload["kcal"]
        macros = payload["macros"]
        days = []
        for day in DAYS:
            meals = [{
                "slot": slot,
                "text": f"Opción {slot} equilibrada",
                "kcal": round(kcal * frac),
                "protein_g": round(macros["protein_g"] * frac, 1),
                "carbs_g": round(macros["carbs_g"] * frac, 1),
                "fat_g": round(macros["fat_g"] * frac, 1),
                "groups": dict(FAKE_GROUPS[slot]),
            } for slot, frac in MEAL_SLOTS]
            days.append({"label": day, "meals": meals})
        return {"content": {"days": days}, "raw": {"provider": self.name, "echo": payload},
                "usage": _empty_usage()}


# ── OpenAI (o compatible: OpenRouter vía AI_BASE_URL) ─────────────────────────────

SYSTEM_PROMPT = (
    "Sos un asistente de un nutricionista matriculado en Argentina. Tu tarea es PROPONER "
    "un plan alimentario semanal (7 días) ajustado EXACTAMENTE a los parámetros dados: "
    "calorías objetivo, macronutrientes (proteínas, carbohidratos, grasas) y restricciones "
    "duras que NO podés violar bajo ninguna circunstancia. NO tomes decisiones clínicas ni "
    "cambies las calorías/macros: solo elegís los alimentos dentro de esos límites.\n"
    "Armá el menú según las Guías Alimentarias para la Población Argentina y su Gráfica de "
    "alimentación saludable. Cada día debe incluir, como referencia:\n"
    "- Verduras y frutas: 5 porciones (1 porción = ½ plato playo de verduras o 1 fruta). "
    "Al menos medio plato de verduras en el almuerzo y en la cena, y 2 o 3 frutas.\n"
    "- Legumbres, cereales, papa, pan y pastas: 4 porciones (1 porción = 60 g de pan, "
    "½ taza de legumbres, cereales o pastas cocidas, 1 papa mediana, ½ choclo o "
    "½ mandioca chica).\n"
    "- Leche, yogur y queso: 3 porciones (1 porción = 1 taza de leche o yogur, 1 rodaja de "
    "queso del tamaño de un mazo de cartas o 1 cucharada de postre de queso crema).\n"
    "- Carnes y huevos: 1 porción (1 porción = el tamaño de la palma de la mano o ¼ del "
    "plato, o 1 huevo).\n"
    "- Aceites, frutas secas y semillas: 2 porciones (1 porción = 1 cucharada sopera de "
    "aceite, 1 puñado de frutas secas o 1 cucharada sopera de semillas).\n"
    "Las porciones de verduras y frutas, lácteos y carnes son el mínimo. Las de cereales y "
    "aceites pueden subir o bajar para llegar a las calorías objetivo. Si una restricción "
    "dura excluye un grupo, reemplazalo por alimentos permitidos y no lo cuentes.\n"
    "Priorizá preparaciones caseras y simples, como las del recetario «Comé rico, comé "
    "saludable». Usá poca sal, nada de azúcar agregada y agua segura como bebida. NO "
    "incluyas productos ultraprocesados: gaseosas, jugos azucarados, golosinas, galletitas, "
    "snacks, fiambres, embutidos ni salchichas.\n"
    "Devolvé ÚNICAMENTE un JSON con esta forma: "
    '{"days":[{"label":"Lunes","meals":[{"slot":"desayuno","text":"...","kcal":0,'
    '"protein_g":0,"carbs_g":0,"fat_g":0,"groups":{"verduras_frutas":0,'
    '"cereales_legumbres":0,"lacteos":0,"carnes_huevos":0,"aceites_semillas":0}}, ...]}, ...]}. '
    "En \"groups\" indicá cuántas porciones de cada grupo aporta la comida. "
    "Cada día debe tener las comidas: desayuno, colacion, almuerzo, merienda, cena. "
    "La suma diaria de kcal y macros debe aproximarse a los objetivos."
)
PROMPT_VERSION = "v2-gapa"


class OpenAIProvider:
    """Proveedor real vía la API de OpenAI (o endpoint compatible con `AI_BASE_URL`)."""

    def __init__(self, *, api_key: str, model: str, base_url: str = "", name: str = "openai"):
        self.name = name
        self.model = model
        self._api_key = api_key
        self._base_url = base_url or None

    def _client(self):
        # Import diferido: solo se necesita cuando hay proveedor real configurado.
        from openai import OpenAI
        return OpenAI(api_key=self._api_key, base_url=self._base_url)

    def generate(self, payload: dict) -> dict:
        client = self._client()
        user_msg = (
            "Parámetros del plan (todos obligatorios):\n"
            f"- Edad: {payload['age']} · Sexo: {payload['sex']}\n"
            f"- Objetivo: {payload['goal']}\n"
            f"- Calorías objetivo/día: {payload['kcal']}\n"
            f"- Macros/día: proteínas {payload['macros']['protein_g']} g, "
            f"carbohidratos {payload['macros']['carbs_g']} g, grasas {payload['macros']['fat_g']} g\n"
            f"- Restricciones duras (NO violar): {payload['hard_constraints'] or 'ninguna'}\n"
            f"- Localización: {payload.get('locale', 'es-AR')}"
        )
        resp = client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},
            temperature=0.7,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
        )
        raw_text = resp.choices[0].message.content or "{}"
        content = self._normalize(json.loads(raw_text))

        usage_obj = getattr(resp, "usage", None)
        in_tok = getattr(usage_obj, "prompt_tokens", None)
        out_tok = getattr(usage_obj, "completion_tokens", None)
        usage = {
            "input_tokens": in_tok,
            "output_tokens": out_tok,
            "estimated_cost_usd": _estimate_cost(self.model, in_tok, out_tok),
        }
        return {"content": content, "raw": {"id": getattr(resp, "id", None), "model": self.model},
                "usage": usage}

    @staticmethod
    def _normalize(data: dict) -> dict:
        """Sanea la respuesta a nuestro esquema (numéricos, claves esperadas)."""
        days = []
        for day in (data or {}).get("days", []):
            meals = []
            for m in day.get("meals", []):
                meals.append({
                    "slot": str(m.get("slot", "")),
                    "text": str(m.get("text", "")),
                    "kcal": float(m.get("kcal", 0) or 0),
                    "protein_g": float(m.get("protein_g", 0) or 0),
                    "carbs_g": float(m.get("carbs_g", 0) or 0),
                    "fat_g": float(m.get("fat_g", 0) or 0),
                    "groups": {g: float((m.get("groups") or {}).get(g, 0) or 0)
                               for g in GAPA_GROUPS},
                })
            days.append({"label": str(day.get("label", "")), "meals": meals})
        return {"days": days}


def get_provider() -> PlanProvider:
    """Devuelve el proveedor configurado; sin API key o proveedor FAKE, usa `FakeProvider`."""
    provider = (getattr(settings, "AI_PROVIDER", "") or "").upper()
    api_key = getattr(settings, "AI_API_KEY", "") or ""
    model = getattr(settings, "AI_MODEL", "gpt-4o-mini") or "gpt-4o-mini"
    base_url = getattr(settings, "AI_BASE_URL", "") or ""

    if not api_key or provider in ("", "FAKE"):
        return FakeProvider()
    if provider in ("OPENAI", "OPENROUTER"):
        return OpenAIProvider(api_key=api_key, model=model, base_url=base_url,
                              name=provider.lower())
    return FakeProvider()
