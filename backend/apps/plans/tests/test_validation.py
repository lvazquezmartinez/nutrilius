"""Tests del validador post-IA (RF-IA-04) — funciones puras, sin DB."""
from apps.plans.services import rules, validation


def _targets(kcal=1600, goal="DESCENSO", constraints=None):
    m = rules.macro_targets(kcal, goal)
    return rules.Targets(
        kcal=kcal, goal=goal, hard_constraints=constraints or [],
        protein_g=m["protein_g"], carbs_g=m["carbs_g"], fat_g=m["fat_g"],
    )


def _day(label, kcal, p, c, f):
    return {"label": label, "meals": [
        {"slot": "total", "text": "comidas del día", "kcal": kcal,
         "protein_g": p, "carbs_g": c, "fat_g": f},
    ]}


def test_summarize_promedia_por_dia():
    content = {"days": [_day("Lun", 1600, 120, 160, 53), _day("Mar", 1400, 100, 150, 47)]}
    avg = validation.summarize(content)
    assert avg["kcal"] == 1500  # (1600+1400)/2


def test_plan_valido_pasa():
    t = _targets(1600)
    content = {"days": [_day("Lun", t.kcal, t.protein_g, t.carbs_g, t.fat_g)]}
    report = validation.validate_plan(content, t)
    assert report.passed is True
    assert report.violations == []
    assert abs(report.deltas["kcal"]) < 0.05


def test_plan_fuera_de_objetivo_no_pasa():
    t = _targets(1600)
    content = {"days": [_day("Lun", 900, 60, 80, 25)]}  # muy por debajo
    report = validation.validate_plan(content, t)
    assert report.passed is False
    assert report.deltas["kcal"] < -0.1


def test_plan_que_viola_restriccion_dura_no_pasa():
    t = _targets(1600, constraints=["alergia: maní"])
    content = {"days": [{
        "label": "Lun",
        "meals": [{"slot": "almuerzo", "text": "Ensalada con maní",
                   "kcal": 1600, "protein_g": 120, "carbs_g": 160, "fat_g": 53}],
    }]}
    report = validation.validate_plan(content, t)
    assert report.passed is False
    assert "alergia: maní" in report.violations


def test_acepta_targets_como_dict():
    t = {"kcal": 1600, "protein_g": 120, "carbs_g": 160, "fat_g": 53, "hard_constraints": []}
    content = {"days": [_day("Lun", 1600, 120, 160, 53)]}
    report = validation.validate_plan(content, t)
    assert report.passed is True
