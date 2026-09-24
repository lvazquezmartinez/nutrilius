"""
Motor de reglas nutricionales (RF-IA-01 / RF-IA-02) — corre **antes** de la IA.

Calcula, de forma **determinista**, el requerimiento energético y la distribución de
macronutrientes según el objetivo, y deriva las **restricciones duras** que el plan no
puede violar. La IA (Fase 4) queda acotada a estos parámetros; nunca los decide.

Funciones puras (sin dependencias de Django) + un adaptador `targets_for` que extrae los
datos de los modelos `Patient` / `Anamnesis`.
"""
from __future__ import annotations

import datetime
import re
from dataclasses import dataclass, field, asdict

# ── Parámetros del modelo ────────────────────────────────────────────────────────

# Factores de actividad (Harris-Benedict / Mifflin) por nivel de actividad clínico.
ACTIVITY_FACTORS = {
    "SEDENTARY": 1.2,
    "LIGHT": 1.375,
    "MODERATE": 1.55,
    "ACTIVE": 1.725,
    "VERY_ACTIVE": 1.9,
}
DEFAULT_ACTIVITY = "MODERATE"

# Ajuste calórico sobre el gasto total (TDEE) según objetivo.
GOAL_KCAL_DELTA = {
    "DESCENSO": -500,     # déficit moderado
    "AUMENTO": +300,      # superávit moderado
    "MANTENIMIENTO": 0,
    "OTRO": 0,
}

# Distribución de macros (% de las kcal) según objetivo.
GOAL_MACRO_SPLIT = {
    "DESCENSO":      {"protein": 0.30, "carbs": 0.40, "fat": 0.30},
    "AUMENTO":       {"protein": 0.25, "carbs": 0.50, "fat": 0.25},
    "MANTENIMIENTO": {"protein": 0.25, "carbs": 0.45, "fat": 0.30},
    "OTRO":          {"protein": 0.25, "carbs": 0.45, "fat": 0.30},
}

# Piso de seguridad para no prescribir dietas peligrosamente bajas.
MIN_KCAL = {"F": 1200, "M": 1500, "X": 1200}

KCAL_PER_G = {"protein": 4, "carbs": 4, "fat": 9}


@dataclass
class Targets:
    """Objetivos calculados por el motor de reglas."""
    kcal: int
    protein_g: float
    carbs_g: float
    fat_g: float
    goal: str
    hard_constraints: list[str] = field(default_factory=list)

    def as_dict(self) -> dict:
        return asdict(self)


# ── Cálculos base ────────────────────────────────────────────────────────────────

def bmr_mifflin(sex: str, weight_kg: float, height_cm: float, age: int) -> float:
    """Tasa metabólica basal — ecuación de Mifflin-St Jeor."""
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    if sex == "M":
        return base + 5
    if sex == "F":
        return base - 161
    # Sexo no informado / otro: promedio de ambas constantes (-78).
    return base - 78


def tdee(bmr: float, activity_level: str) -> float:
    """Gasto energético total = BMR × factor de actividad."""
    return bmr * ACTIVITY_FACTORS.get(activity_level or DEFAULT_ACTIVITY, ACTIVITY_FACTORS[DEFAULT_ACTIVITY])


def target_kcal(tdee_value: float, goal: str, sex: str = "X") -> int:
    """Requerimiento energético objetivo, con piso de seguridad por sexo."""
    kcal = tdee_value + GOAL_KCAL_DELTA.get(goal, 0)
    kcal = max(kcal, MIN_KCAL.get(sex, 1200))
    return int(round(kcal / 10.0) * 10)  # redondeo a la decena


def macro_targets(kcal: int, goal: str) -> dict:
    """Gramos de proteínas, carbohidratos y grasas según objetivo."""
    split = GOAL_MACRO_SPLIT.get(goal, GOAL_MACRO_SPLIT["MANTENIMIENTO"])
    return {
        "protein_g": round(kcal * split["protein"] / KCAL_PER_G["protein"], 1),
        "carbs_g":   round(kcal * split["carbs"]   / KCAL_PER_G["carbs"], 1),
        "fat_g":     round(kcal * split["fat"]     / KCAL_PER_G["fat"], 1),
    }


# ── Restricciones duras (RF-IA-02) ───────────────────────────────────────────────

def _split_terms(text: str) -> list[str]:
    if not text:
        return []
    parts = re.split(r"[,;\n/]+", text)
    out = []
    for p in parts:
        p = p.strip()
        if p and p.lower() not in ("ninguna", "ninguno", "no", "n/a", "sin restricciones", "-"):
            out.append(p)
    return out


def derive_hard_constraints(*, allergies: str = "", restrictions: str = "",
                            aversions: str = "") -> list[str]:
    """
    Deriva la lista de restricciones duras a partir de los campos de la anamnesis.
    Cada ítem se prefija con su categoría para trazabilidad.
    """
    constraints: list[str] = []
    for term in _split_terms(allergies):
        constraints.append(f"alergia: {term}")
    for term in _split_terms(restrictions):
        constraints.append(f"restricción: {term}")
    for term in _split_terms(aversions):
        constraints.append(f"aversión: {term}")
    return constraints


# ── API principal ────────────────────────────────────────────────────────────────

def compute_targets(*, sex: str, weight_kg: float, height_cm: float, age: int,
                    activity_level: str, goal: str,
                    hard_constraints: list[str] | None = None) -> Targets:
    """Calcula los objetivos completos a partir de datos primitivos (función pura)."""
    bmr = bmr_mifflin(sex, weight_kg, height_cm, age)
    kcal = target_kcal(tdee(bmr, activity_level), goal, sex)
    macros = macro_targets(kcal, goal)
    return Targets(
        kcal=kcal, goal=goal, hard_constraints=hard_constraints or [],
        protein_g=macros["protein_g"], carbs_g=macros["carbs_g"], fat_g=macros["fat_g"],
    )


def _age_from(birth_date) -> int | None:
    if not birth_date:
        return None
    today = datetime.date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def targets_for(patient, anamnesis, *, goal: str, activity_level: str = DEFAULT_ACTIVITY) -> Targets:
    """
    Adaptador: arma los `Targets` leyendo `Patient` + `Anamnesis`.
    Lanza `ValueError` si faltan datos antropométricos imprescindibles.
    """
    age = _age_from(getattr(patient, "birth_date", None))
    weight = anamnesis.weight_kg if anamnesis and anamnesis.weight_kg is not None else None
    height = anamnesis.height_cm if anamnesis and anamnesis.height_cm is not None else None
    if age is None or weight is None or height is None:
        missing = [n for n, v in (("edad", age), ("peso", weight), ("talla", height)) if v is None]
        raise ValueError(f"Faltan datos para calcular el requerimiento: {', '.join(missing)}")

    constraints = derive_hard_constraints(
        allergies=getattr(anamnesis, "food_allergies", "") or "",
        restrictions=getattr(anamnesis, "medical_cultural_restrictions", "") or "",
        aversions=getattr(anamnesis, "food_aversions", "") or "",
    )
    return compute_targets(
        sex=patient.sex or "X", weight_kg=float(weight), height_cm=float(height),
        age=age, activity_level=activity_level, goal=goal, hard_constraints=constraints,
    )
