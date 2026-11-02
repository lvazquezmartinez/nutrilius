"""Tests del validador post-IA (RF-IA-04) — funciones puras, sin DB."""
from apps.plans.services import rules, validation


def _targets(kcal=1600, goal="DESCENSO", constraints=None):
    m = rules.macro_targets(kcal, goal)
    return rules.Targets(
        kcal=kcal, goal=goal, hard_constraints=constraints or [],
        protein_g=m["protein_g"], carbs_g=m["carbs_g"], fat_g=m["fat_g"],
    )


def _day(label, kcal, p, c, f, groups=None):
    return {"label": label, "meals": [
        {"slot": "total", "text": "comidas del día", "kcal": kcal,
         "protein_g": p, "carbs_g": c, "fat_g": f,
         "groups": dict(validation.GAPA_DAILY) if groups is None else groups},
    ]}


def _meal(slot, text="comida casera", **groups):
    g = {k: 0 for k in validation.GAPA_GROUPS}
    g.update(groups)
    return {"slot": slot, "text": text, "kcal": 0, "protein_g": 0, "carbs_g": 0,
            "fat_g": 0, "groups": g}


def _menu_gapa(almuerzo_verduras=1, texto_cena="verduras al horno con arroz"):
    """Un día que cumple la Gráfica de alimentación saludable (5-4-3-1-2)."""
    return {"days": [{"label": "Lun", "meals": [
        _meal("desayuno", verduras_frutas=1, cereales_legumbres=1, lacteos=1),
        _meal("colacion", verduras_frutas=1),
        _meal("almuerzo", verduras_frutas=almuerzo_verduras, cereales_legumbres=1,
              carnes_huevos=1, aceites_semillas=1),
        _meal("merienda", cereales_legumbres=1, lacteos=1),
        _meal("cena", texto_cena, verduras_frutas=3 - almuerzo_verduras,
              cereales_legumbres=1, lacteos=1, aceites_semillas=1),
    ]}]}


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


# ── Guías Alimentarias para la Población Argentina ──────────────────────────────

def test_menu_que_cumple_las_guias_no_tiene_desvios():
    avg, issues = validation.check_guidelines(_menu_gapa())
    assert issues == []
    assert avg["verduras_frutas"] == 5 and avg["lacteos"] == 3


def test_menu_sin_porciones_por_grupo_no_pasa():
    t = _targets(1600)
    content = {"days": [{"label": "Lun", "meals": [
        {"slot": "almuerzo", "text": "guiso", "kcal": t.kcal, "protein_g": t.protein_g,
         "carbs_g": t.carbs_g, "fat_g": t.fat_g}]}]}
    report = validation.validate_plan(content, t)
    assert report.passed is False
    assert any("porciones por grupo" in i for i in report.guideline_issues)


def test_menu_con_pocas_verduras_y_frutas_no_pasa():
    t = _targets(1600)
    pocas = dict(validation.GAPA_DAILY, verduras_frutas=2)
    content = {"days": [_day("Lun", t.kcal, t.protein_g, t.carbs_g, t.fat_g, groups=pocas)]}
    report = validation.validate_plan(content, t)
    assert report.passed is False
    assert any("verduras_frutas" in i for i in report.guideline_issues)


def test_almuerzo_sin_verduras_se_informa():
    _, issues = validation.check_guidelines(_menu_gapa(almuerzo_verduras=0))
    assert any("almuerzo no incluye verduras" in i for i in issues)


def test_ultraprocesado_se_informa():
    _, issues = validation.check_guidelines(_menu_gapa(texto_cena="salchichas con puré"))
    assert "ultraprocesado: salchicha" in issues


def test_restriccion_de_lactosa_no_exige_lacteos():
    sin_lacteos = dict(validation.GAPA_DAILY, lacteos=0)
    content = {"days": [_day("Lun", 1600, 120, 160, 53, groups=sin_lacteos)]}
    _, issues = validation.check_guidelines(content, ["restricción: intolerancia a la lactosa"])
    assert issues == []
