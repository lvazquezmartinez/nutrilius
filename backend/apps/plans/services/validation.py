"""
Validación posterior a la IA (RF-IA-04).

Recalcula las calorías y macros del plan **generado** y verifica que cumpla los objetivos
del motor de reglas (dentro de una tolerancia) y que **no viole las restricciones duras**.
Si no cumple, el plan se marca para revisión (no llega al paciente).

Esquema de `content` esperado::

    {
      "days": [
        {"label": "Lunes", "meals": [
            {"slot": "desayuno", "text": "...", "kcal": 350,
             "protein_g": 20, "carbs_g": 40, "fat_g": 10},
            ...
        ]},
        ...
      ]
    }
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict

DEFAULT_TOLERANCE = 0.10  # ±10 % sobre el objetivo


@dataclass
class ValidationReport:
    passed: bool
    avg_kcal: float
    avg_protein_g: float
    avg_carbs_g: float
    avg_fat_g: float
    target_kcal: int
    deltas: dict = field(default_factory=dict)      # desvío relativo por métrica
    violations: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return asdict(self)


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def summarize(content: dict) -> dict:
    """Promedio diario de kcal y macros a partir del contenido del plan."""
    days = (content or {}).get("days") or []
    n = len(days) or 1
    totals = {"kcal": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
    for day in days:
        for meal in day.get("meals", []):
            totals["kcal"] += _num(meal.get("kcal"))
            totals["protein_g"] += _num(meal.get("protein_g"))
            totals["carbs_g"] += _num(meal.get("carbs_g"))
            totals["fat_g"] += _num(meal.get("fat_g"))
    return {k: round(v / n, 1) for k, v in totals.items()}


def check_constraints(content: dict, hard_constraints: list[str]) -> list[str]:
    """
    Detecta restricciones duras aparentemente violadas: si el término prohibido aparece
    en el texto de alguna comida. Chequeo textual (defensa en profundidad; la IA ya se
    acota por prompt). Devuelve la lista de violaciones encontradas.
    """
    violations: list[str] = []
    text_blob = " ".join(
        (meal.get("text") or "").lower()
        for day in (content or {}).get("days", [])
        for meal in day.get("meals", [])
    )
    for constraint in hard_constraints or []:
        # term = parte luego de "categoría: "
        term = constraint.split(":", 1)[-1].strip().lower()
        if term and term in text_blob:
            violations.append(constraint)
    return violations


def validate_plan(content: dict, targets, *, tolerance: float = DEFAULT_TOLERANCE) -> ValidationReport:
    """
    Valida el plan contra los objetivos (`Targets` o dict con kcal/protein_g/carbs_g/fat_g)
    y las restricciones duras. `passed` es True solo si kcal y macros están dentro de la
    tolerancia y no hay restricciones violadas.
    """
    t = targets.as_dict() if hasattr(targets, "as_dict") else dict(targets)
    avg = summarize(content)

    def delta(actual, target):
        if not target:
            return 0.0
        return round((actual - target) / target, 3)

    deltas = {
        "kcal": delta(avg["kcal"], t["kcal"]),
        "protein_g": delta(avg["protein_g"], t["protein_g"]),
        "carbs_g": delta(avg["carbs_g"], t["carbs_g"]),
        "fat_g": delta(avg["fat_g"], t["fat_g"]),
    }
    within = all(abs(d) <= tolerance for d in deltas.values())
    violations = check_constraints(content, t.get("hard_constraints", []))

    return ValidationReport(
        passed=bool(within and not violations),
        avg_kcal=avg["kcal"], avg_protein_g=avg["protein_g"],
        avg_carbs_g=avg["carbs_g"], avg_fat_g=avg["fat_g"],
        target_kcal=t["kcal"], deltas=deltas, violations=violations,
    )
