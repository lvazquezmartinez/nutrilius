# Entrega final — Prototipo Nutrilius

## 1. Demo desplegada
- **URL:** https://nutrilius.com.ar
- **Usuario:** `demo@nutrilius.com.ar`
- **Contraseña:** `NutriliusDemo2026`

Datos **ficticios** (cuenta de demostración generada con `seed_demo`). No hay datos de
pacientes reales.

## 2. Estado de las historias de usuario

| HU | Descripción | Estado |
|---|---|---|
| **HU-11** | Agenda global (calendario del consultorio) | ✅ Hecha |
| **HU-13** | Generación de plan con IA supervisada (reglas → IA → validación → aprobación) | ✅ Hecha |
| **HU-14** | Exportación del plan a PDF con branding | ✅ Hecha |
| **HU-15** | Compartir el plan por enlace público revocable | ✅ Hecha |
| **HU-16** | Recontacto de pacientes inactivos | ✅ Hecha |
| **HU-17** | Configuración del consultorio | ✅ Hecha |
| **HU-18** | Reserva de turno por enlace público del consultorio | ✅ Hecha |
| **HU-20** | Auditoría de acceso a datos clínicos + vista admin | ✅ Hecha |
| **HU-22** | Cifrado en reposo de campos clínicos sensibles | ✅ Hecha |
| **HU-23** | Rate limiting (login + endpoints públicos) | ✅ Hecha |
| **HU-24** | Derechos del paciente (exportar / anonimizar, ARCO) | ✅ Hecha |
| **HU-25** | Copias de seguridad (PITR + export cross-region, Terraform) | ✅ Hecha |

**Definición de terminado:** cada HU cumple sus criterios, respeta el aislamiento por
consultorio y la aprobación obligatoria de planes, tiene pruebas automatizadas (95 tests),
está en `main` y desplegada.

### Políticas de acceso (verificadas, ya en la tesis)
- Email único + confirmación por enlace de un solo uso (vence 48 h). ✅
- Contraseña: mín. 8, no similar a nombre/email, no común, no solo numérica (validadores de Django). ✅
- PBKDF2-SHA256 (hasher por defecto de Django 5). ✅
- JWT acceso 60 min / refresh 30 días. ✅
- Recuperación con respuesta uniforme (anti-enumeración), enlace de un solo uso (vence 2 h). ✅
- Login con Google verificado contra el client ID. ✅
- Todo por HTTPS (Load Balancer + certificado administrado). ✅

## 3. Cambios respecto del modelo documentado (DER / diagrama de clases)

**No hay tablas nuevas** más allá de las ya documentadas en la tesis (`NutritionPlan`,
`PlanTemplate`, `PlanGeneration`, `PatientConsent`, `TenantSettings`). Cambios:

- **Enums ampliados** (no son tablas): `AuditEvent.Action` sumó acciones (PLAN_GENERATED,
  PLAN_APPROVED, PLAN_SHARED, PDF_EXPORTED, CONSENT_GRANTED/REVOKED, CONFIG_UPDATED,
  DATA_EXPORTED, DATA_ANONYMIZED); `AIProvider` sumó `FAKE`.
- **Cifrado en reposo (HU-22):** cuatro campos de texto pasaron a cifrados —
  `Anamnesis.medications`, `Anamnesis.reason_for_consultation`, `Anamnesis.final_comments`,
  `Evolution.clinical_notes`. La **columna sigue siendo `text`** (guarda el texto cifrado):
  **no cambia el esquema del DER**, solo cómo se almacena el contenido.
- El contenido del plan (`NutritionPlan.content`, JSON) incorpora las porciones por grupo
  de las Guías Alimentarias Argentinas dentro del mismo campo JSON (sin cambio de esquema).

## 4. Capturas
En `capturas-entrega2/` (cuenta demo, datos ficticios): inicio de sesión, panel de inicio,
evoluciones con el gráfico de tendencia, plan generado por IA (parámetros, validación,
estados), PDF del plan y página de reserva de turnos.

## 5. Cómo correr / desplegar
Ver `INSTRUCTIVO.md`.
