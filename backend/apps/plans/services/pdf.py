"""
Exportación del plan aprobado a PDF con branding del consultorio (HU-14 / RF-23).

Usa reportlab (puro Python, sin dependencias de sistema → corre en Cloud Run tal cual).
El logo se embebe solo si `logo_url` es accesible; si falla, se omite sin romper el PDF.
"""
from __future__ import annotations

import io
from urllib.request import urlopen

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image,
)

PRIMARY = colors.HexColor("#1E4D6B")
ACCENT = colors.HexColor("#3DAA7F")
MUTED = colors.HexColor("#64748b")
SLOT_ORDER = ["desayuno", "colacion", "almuerzo", "merienda", "cena"]
SLOT_LABEL = {"desayuno": "Desayuno", "colacion": "Colación", "almuerzo": "Almuerzo",
              "merienda": "Merienda", "cena": "Cena"}


def _fetch_logo(logo_url: str):
    if not logo_url:
        return None
    try:
        with urlopen(logo_url, timeout=4) as r:  # noqa: S310 (url de config del propio tenant)
            data = r.read()
        img = Image(io.BytesIO(data))
        img.drawHeight, img.drawWidth = 16 * mm, 16 * mm
        return img
    except Exception:
        return None


def build_plan_pdf(plan, settings_obj=None) -> bytes:
    """Devuelve los bytes del PDF del plan."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4),
                            leftMargin=14 * mm, rightMargin=14 * mm,
                            topMargin=12 * mm, bottomMargin=12 * mm,
                            title=f"Plan alimentario - {plan.patient}")
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Title"], fontSize=18, textColor=PRIMARY, spaceAfter=2)
    sub = ParagraphStyle("sub", parent=styles["Normal"], fontSize=10, textColor=MUTED)
    cell = ParagraphStyle("cell", parent=styles["Normal"], fontSize=8, leading=10)
    kc = ParagraphStyle("kc", parent=styles["Normal"], fontSize=7, textColor=MUTED)

    business = getattr(settings_obj, "business_name", "") or "Nutrilius"
    prof = getattr(settings_obj, "nutritionist_name", "") or ""
    lic = getattr(settings_obj, "license_number", "") or ""

    story = []
    header_bits = [Paragraph(business, h1)]
    meta = " · ".join(x for x in [prof, f"MP {lic}" if lic else ""] if x)
    if meta:
        header_bits.append(Paragraph(meta, sub))
    logo = _fetch_logo(getattr(settings_obj, "logo_url", "") or "")
    if logo:
        story.append(Table([[logo, header_bits]], colWidths=[20 * mm, None],
                           style=TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")])))
    else:
        story.extend(header_bits)
    story.append(Spacer(1, 6))

    goal = plan.get_goal_display() if plan.goal else "—"
    story.append(Paragraph(f"<b>Paciente:</b> {plan.patient}", sub))
    macros = f"{plan.target_kcal or '—'} kcal/día · P {plan.target_protein_g or '—'} g · " \
             f"C {plan.target_carbs_g or '—'} g · G {plan.target_fat_g or '—'} g"
    story.append(Paragraph(f"<b>Objetivo:</b> {goal} &nbsp;&nbsp; <b>Requerimiento:</b> {macros}", sub))
    if plan.hard_constraints:
        story.append(Paragraph(f"<b>Restricciones:</b> {', '.join(plan.hard_constraints)}", sub))
    story.append(Spacer(1, 8))

    # Tabla semanal: columnas Día + comidas presentes.
    days = (plan.content or {}).get("days", []) if isinstance(plan.content, dict) else []
    slots = [s for s in SLOT_ORDER
             if any(any(m.get("slot") == s for m in d.get("meals", [])) for d in days)]
    head = ["Día"] + [SLOT_LABEL[s] for s in slots]
    rows = [head]
    for d in days:
        row = [Paragraph(f"<b>{d.get('label', '')}</b>", cell)]
        for s in slots:
            meal = next((m for m in d.get("meals", []) if m.get("slot") == s), None)
            if meal:
                txt = f"{meal.get('text', '')}<br/><font size=7 color='#64748b'>{round(meal.get('kcal', 0))} kcal</font>"
                row.append(Paragraph(txt, cell))
            else:
                row.append(Paragraph("—", cell))
        rows.append(row)

    col_w = [22 * mm] + [(doc.width - 22 * mm) / max(len(slots), 1)] * len(slots)
    table = Table(rows, colWidths=col_w, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5E7EB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAFB")]),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(table)
    story.append(Spacer(1, 8))

    approved = ""
    if plan.approved_at:
        approved = f" · Aprobado el {plan.approved_at:%d/%m/%Y}"
    story.append(Paragraph(f"<font size=7 color='#9aa4b0'>Generado por Nutrilius{approved} · "
                           f"Plan revisado y aprobado por el profesional.</font>", kc))

    doc.build(story)
    return buf.getvalue()
