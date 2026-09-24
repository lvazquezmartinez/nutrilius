"""Tests del motor de reglas (RF-IA-01 / RF-IA-02) — funciones puras, sin DB."""
import datetime
from types import SimpleNamespace

import pytest

from apps.plans.services import rules


def test_bmr_mifflin_femenino():
    # 10*70 + 6.25*165 - 5*30 - 161 = 1420.25
    assert rules.bmr_mifflin("F", 70, 165, 30) == pytest.approx(1420.25)


def test_bmr_mifflin_masculino_mayor_que_femenino():
    assert rules.bmr_mifflin("M", 70, 165, 30) > rules.bmr_mifflin("F", 70, 165, 30)


def test_tdee_escala_por_actividad():
    bmr = 1500
    assert rules.tdee(bmr, "SEDENTARY") < rules.tdee(bmr, "MODERATE") < rules.tdee(bmr, "VERY_ACTIVE")


def test_target_kcal_descenso_resta_y_aumento_suma():
    base = 2000
    assert rules.target_kcal(base, "DESCENSO", "F") < base
    assert rules.target_kcal(base, "AUMENTO", "F") > base
    assert rules.target_kcal(base, "MANTENIMIENTO", "F") == base


def test_target_kcal_respeta_piso_de_seguridad():
    # TDEE bajo + déficit no puede caer por debajo del mínimo femenino (1200).
    assert rules.target_kcal(1300, "DESCENSO", "F") >= 1200


def test_macro_targets_suman_aprox_las_kcal():
    kcal = 1600
    m = rules.macro_targets(kcal, "DESCENSO")
    energia = m["protein_g"] * 4 + m["carbs_g"] * 4 + m["fat_g"] * 9
    assert energia == pytest.approx(kcal, rel=0.02)


def test_derive_hard_constraints_categoriza_y_filtra_ninguna():
    c = rules.derive_hard_constraints(
        allergies="Maní, Nueces", restrictions="Sin lactosa", aversions="Ninguna",
    )
    assert "alergia: Maní" in c
    assert "alergia: Nueces" in c
    assert "restricción: Sin lactosa" in c
    assert all("aversión" not in x for x in c)  # "Ninguna" se filtra


def test_compute_targets_devuelve_objetivos_completos():
    t = rules.compute_targets(
        sex="F", weight_kg=78, height_cm=165, age=34,
        activity_level="MODERATE", goal="DESCENSO",
        hard_constraints=["alergia: maní"],
    )
    assert t.kcal > 0 and t.protein_g > 0 and t.goal == "DESCENSO"
    assert t.hard_constraints == ["alergia: maní"]


def test_targets_for_lee_patient_y_anamnesis():
    patient = SimpleNamespace(sex="F", birth_date=datetime.date(1990, 5, 14))
    anamnesis = SimpleNamespace(
        weight_kg=78, height_cm=165, food_allergies="Maní",
        medical_cultural_restrictions="Sin lactosa", food_aversions="",
    )
    t = rules.targets_for(patient, anamnesis, goal="DESCENSO", activity_level="LIGHT")
    assert t.kcal > 0
    assert "alergia: Maní" in t.hard_constraints
    assert "restricción: Sin lactosa" in t.hard_constraints


def test_targets_for_falla_si_faltan_datos():
    patient = SimpleNamespace(sex="F", birth_date=None)
    anamnesis = SimpleNamespace(weight_kg=None, height_cm=165)
    with pytest.raises(ValueError):
        rules.targets_for(patient, anamnesis, goal="DESCENSO")
