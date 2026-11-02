"""
Validación posterior a la IA (RF-IA-04).

Recalcula las calorías y macros del plan **generado** y verifica que cumpla los objetivos
del motor de reglas (dentro de una tolerancia) y que **no viole las restricciones duras**.
Además controla el menú contra las Guías Alimentarias para la Población Argentina y su
Gráfica de alimentación saludable (Ministerio de Salud): porciones mínimas por grupo,
verduras en almuerzo y cena, y ausencia de productos ultraprocesados.
Si no cumple, el plan se marca para revisión (no llega al paciente).

Esquema de `content` esperado::

    {
      "days": [
        {"label": "Lunes", "meals": [
            {"slot": "desayuno", "text": "...", "kcal": 350,
             "protein_g": 20, "carbs_g": 40, "fat_g": 10,
             "groups": {"verduras_frutas": 1, "cereales_legumbres": 1, "lacteos": 1,
                        "carnes_huevos": 0, "aceites_semillas": 0}},
            ...
        ]},
        ...
      ]
    }
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict

DEFAULT_TOLERANCE = 0.10  # ±10 % sobre el objetivo

# ── Guías Alimentarias para la Población Argentina (Gráfica de alimentación saludable) ──
# Porciones diarias recomendadas por grupo. Los mínimos se exigen para verduras y frutas,
# lácteos y carnes/huevos. Cereales y aceites pueden variar para llegar a las kcal objetivo.
GAPA_GROUPS = ("verduras_frutas", "cereales_legumbres", "lacteos", "carnes_huevos", "aceites_semillas")
GAPA_DAILY = {"verduras_frutas": 5, "cereales_legumbres": 4, "lacteos": 3,
              "carnes_huevos": 1, "aceites_semillas": 2}
GAPA_MIN = {"verduras_frutas": 5, "lacteos": 3, "carnes_huevos": 1}
MAIN_MEALS = ("almuerzo", "cena")  # al menos medio plato de verduras en cada una

# Productos ultraprocesados que las Guías recomiendan evitar (6.º grupo, de consumo opcional).
ULTRAPROCESSED_TERMS = (
    "gaseosa", "jugo en polvo", "jugo azucarado", "golosina", "caramelo", "alfajor",
    "galletita", "snack", "papas fritas de paquete", "fiambre", "embutido", "salchicha",
    "salame", "mortadela", "nugget", "sopa instantánea", "caldo en cubo",
)

# Restricciones que excluyen un grupo completo (no se exige su mínimo).
GROUP_EXCLUSIONS = {
    "lacteos": ("lact", "leche", "lácte", "lacte", "vegan"),
    "carnes_huevos": ("vegan",),
}


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
    avg_groups: dict = field(default_factory=dict)  # porciones promedio por grupo y día
    guideline_issues: list[str] = field(default_factory=list)  # desvíos respecto de las Guías

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


def _excluded_groups(hard_constraints: list[str]) -> set[str]:
    blob = " ".join(c.lower() for c in hard_constraints or [])
    return {g for g, keys in GROUP_EXCLUSIONS.items() if any(k in blob for k in keys)}


def check_guidelines(content: dict, hard_constraints: list[str] | None = None) -> tuple[dict, list[str]]:
    """
    Controla el menú contra las Guías Alimentarias para la Población Argentina.
    Usa las porciones por grupo que informa cada comida (`groups`) y el texto de las
    comidas. Devuelve (promedio de porciones por grupo y día, lista de desvíos).
    """
    days = (content or {}).get("days") or []
    issues: list[str] = []
    excluded = _excluded_groups(hard_constraints or [])
    totals = {g: 0.0 for g in GAPA_GROUPS}

    for day in days:
        label = day.get("label") or "?"
        meals = day.get("meals", [])
        if not any(isinstance(m.get("groups"), dict) for m in meals):
            issues.append(f"{label}: no informa las porciones por grupo de alimentos")
            continue
        day_groups = {g: 0.0 for g in GAPA_GROUPS}
        for meal in meals:
            for g in GAPA_GROUPS:
                day_groups[g] += _num((meal.get("groups") or {}).get(g))
            slot = (meal.get("slot") or "").lower()
            if slot in MAIN_MEALS and _num((meal.get("groups") or {}).get("verduras_frutas")) < 1:
                issues.append(f"{label}: el {slot} no incluye verduras")
        for g, minimum in GAPA_MIN.items():
            if g not in excluded and day_groups[g] < minimum:
                issues.append(f"{label}: {g} {day_groups[g]:g} de {minimum} porciones")
        for g in GAPA_GROUPS:
            totals[g] += day_groups[g]

    text_blob = " ".join(
        (meal.get("text") or "").lower() for day in days for meal in day.get("meals", [])
    )
    for term in ULTRAPROCESSED_TERMS:
        if term in text_blob:
            issues.append(f"ultraprocesado: {term}")

    n = len(days) or 1
    return {g: round(v / n, 1) for g, v in totals.items()}, issues


def validate_plan(content: dict, targets, *, tolerance: float = DEFAULT_TOLERANCE) -> ValidationReport:
    """
    Valida el plan contra los objetivos (`Targets` o dict con kcal/protein_g/carbs_g/fat_g)
    y las restricciones duras. `passed` es True solo si kcal y macros están dentro de la
    tolerancia, no hay restricciones violadas y el menú respeta las Guías Alimentarias.
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
    avg_groups, guideline_issues = check_guidelines(content, t.get("hard_constraints", []))

    return ValidationReport(
        passed=bool(within and not violations and not guideline_issues),
        avg_kcal=avg["kcal"], avg_protein_g=avg["protein_g"],
        avg_carbs_g=avg["carbs_g"], avg_fat_g=avg["fat_g"],
        target_kcal=t["kcal"], deltas=deltas, violations=violations,
        avg_groups=avg_groups, guideline_issues=guideline_issues,
    )
