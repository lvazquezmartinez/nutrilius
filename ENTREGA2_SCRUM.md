# Nutrilius — Descripción del sistema con artefactos de Scrum (Entrega 2)

> **Propósito.** Este documento traduce el estado **real del código** a los artefactos de
> Scrum que pide la Entrega 2 (product backlog, historias de usuario, sprint backlog),
> en reemplazo de los diagramas UML formales. Es el **insumo de verdad** para redactar
> esa sección de la tesis: cada ítem indica su estado efectivo (implementado / pendiente),
> su requerimiento asociado (`RF-*`/`RNF-*` de `REQUERIMIENTOS.md`) y el sprint.
>
> Fuentes: `REQUERIMIENTOS.md`, `V1_PLAN.md`, `MODULOS.md` y el código en `backend/` y
> `frontend/`. Estado verificado al 2026-09-21 (40 tests backend en verde, app en
> producción en `nutrilius.com.ar`).

---

## 1. Marco Scrum del proyecto

Es un **TFG (prototipo)** gestionado con Scrum adaptado a un equipo unipersonal.

| Rol | Quién |
|---|---|
| **Product Owner** | El tesista (define prioridades y alcance) |
| **Scrum Team / Dev** | El tesista |
| **Usuario / stakeholder** | Nutricionista de un consultorio pequeño-mediano (organización **modelada**: sin sistemas heredados más allá de planillas y documentos) |

- **Duración de sprint:** 2 semanas.
- **Incremento:** cada sprint deja software **desplegado y probado** (Definition of Done, §5).
- **Organización modelada:** consultorio de nutrición chico/mediano, uno o más profesionales, atención presencial y remota, sin infraestructura previa (solo planillas y documentos).

### Épicas (una por bounded context — ver `MODULOS.md`)

| # | Épica | Módulo | Estado |
|---|---|---|---|
| E1 | Identidad y acceso | Identity & Access | ✅ Hecho |
| E2 | Gestión de pacientes | Clinical Records | ✅ Hecho |
| E3 | Registro clínico (anamnesis, métricas, evoluciones) | Clinical Records | ✅ Hecho |
| E4 | Agenda y turnos | Scheduling | 🟡 Parcial (backend + ficha ✅; calendario global ⏳) |
| E5 | Panel / dashboard | Dashboard | ✅ Hecho |
| E6 | **Planes alimentarios + IA supervisada** ⭐ | Nutrition Plans + AI Orchestration | ⏳ Pendiente (diferencial) |
| E7 | Recontacto por inactividad | Scheduling / Messaging | ⏳ Pendiente |
| E8 | Configuración del consultorio | Tenant Management | ⏳ Pendiente |
| E9 | Portal público y self-scheduling | Public Portal | ⏳ Pendiente |
| E10 | Super Admin y analíticas | Super Admin | ⏳ Pendiente |
| ET | Seguridad, infraestructura y calidad (transversal) | Auditoría / Infra | 🟡 Parcial |
| — | Pagos y obras sociales | Billing | ⛔ **Fuera de alcance de la tesis** |

Leyenda de estado: ✅ Hecho · 🟡 Parcial · 🚧 En curso · ⏳ Pendiente · ⛔ Fuera de alcance

---

## 2. Product Backlog

Ordenado por prioridad de negocio. `Est.` = estimación relativa en *story points* (Fibonacci).

| ID | Épica | Historia de usuario (resumen) | RF/RNF | Prioridad | Est. | Estado | Sprint |
|---|---|---|---|---|---|---|---|
| PB-01 | E1 | Registrar consultorio + usuario admin | RF-01 | Alta | 5 | ✅ | S1 |
| PB-02 | E1 | Login con email/contraseña (JWT) | RF-02 | Alta | 3 | ✅ | S1 |
| PB-03 | E1 | Confirmar email antes de operar | RF-03 | Alta | 3 | ✅ | S1 |
| PB-04 | E1 | Recuperar contraseña | RF-04 | Media | 3 | ✅ | S1 |
| PB-05 | E1 | Gestionar usuarios internos (crear/activar/desactivar) | RF-05 | Media | 3 | ✅ | S1 |
| PB-06 | E1 | Autorización por rol (SUPER_ADMIN/ADMIN/USER) | RF-06 | Alta | 3 | ✅ | S1 |
| PB-07 | E1 | Ingreso con Google (alta + completar datos) | (nuevo) | Media | 5 | ✅ | S3 |
| PB-08 | E2 | Alta/edición de paciente con ficha completa | RF-07 | Alta | 5 | ✅ | S2 |
| PB-09 | E2 | Listar/buscar pacientes + baja/reactivación lógica | RF-08 | Alta | 3 | ✅ | S2 |
| PB-10 | E2 | Marca de paciente "nuevo" | RF-09 | Baja | 1 | ✅ | S2 |
| PB-11 | E3 | Registrar anamnesis (una por paciente, editable) | RF-10 | Alta | 8 | ✅ | S2 |
| PB-12 | E3 | Plantilla de anamnesis por tenant + reset | RF-11, RF-12 | Baja | 3 | ✅ | S2 |
| PB-13 | E3 | Métricas antropométricas en el tiempo (IMC calc.) | RF-13 | Media | 3 | ✅ | S2 |
| PB-14 | E3 | Evoluciones clínicas fechadas (antropometría/composición) | RF-14 | Alta | 5 | ✅ | S2 |
| PB-15 | E3 | **Gráfico de tendencia** (peso, % músculo, IMC, grasa, cintura) | (nuevo) | Media | 3 | ✅ | S3 |
| PB-16 | E4 | Turnos con estado/motivo; cancelar y completar | RF-15 | Alta | 5 | ✅ | S2 |
| PB-17 | E4 | Marca de recordatorio enviado | RF-17 | Baja | 1 | ✅ | S2 |
| PB-18 | E4 | **Agenda/calendario global** del consultorio | RF-16 | Media | 5 | ⏳ | S4 |
| PB-19 | E5 | Dashboard con métricas reales (activos, nuevos, turnos hoy) | (deriv.) | Media | 3 | ✅ | S3 |
| PB-20 | E6 | Motor de reglas: requerimiento energético + macros | RF-IA-01 | **Alta** | 8 | ⏳ | S4 |
| PB-21 | E6 | Restricciones duras (patologías/alergias/intolerancias) | RF-IA-02 | **Alta** | 5 | ⏳ | S4 |
| PB-22 | E6 | Generación IA acotada a los parámetros + localizada AR | RF-IA-03, RF-21 | **Alta** | 8 | ⏳ | S4 |
| PB-23 | E6 | Validación post-IA (recálculo de calorías/macros) | RF-IA-04 | **Alta** | 5 | ⏳ | S4 |
| PB-24 | E6 | Seudonimización antes de enviar a la IA | RF-IA-05, RNF-02 | **Alta** | 5 | ⏳ | S4 |
| PB-25 | E6 | Máquina de estados + **aprobación profesional obligatoria** | RF-IA-06 | **Alta** | 8 | ⏳ | S4 |
| PB-26 | E6 | Trazabilidad de la generación (prompt/modelo/costo) | RF-IA-07 | Media | 3 | ⏳ | S4 |
| PB-27 | E6 | Edición manual, regenerar día/comida, comparar IA vs editado | RF-20, RF-IA-08 | Media | 5 | ⏳ | S4 |
| PB-28 | E6 | Consentimiento del paciente para uso de IA | RF-IA-10 | **Alta** | 3 | ⏳ | S4 |
| PB-29 | E6 | Plantillas de plan reutilizables | RF-22 | Baja | 3 | ⏳ | S4 |
| PB-30 | E6 | Export del plan a PDF con branding | RF-23 | Media | 5 | ⏳ | S4 |
| PB-31 | E6 | Compartir plan por link/token revocable + PDF público | RF-24, RF-25 | Media | 5 | ⏳ | S4 |
| PB-32 | E7 | Recontacto por inactividad (pacientes sin visita en N días) | (nuevo, deriv. Visit) | Media | 3 | ⏳ | S4 |
| PB-33 | E8 | Configuración del consultorio (datos, logo, matrícula) | RF-28 | Media | 3 | ⏳ | S4 |
| PB-34 | E8 | Slug público único + plan/feature flags | RF-29, RF-30, RNF-15 | Baja | 3 | ⏳ | S5 |
| PB-35 | E9 | Página pública por slug: info y disponibilidad | RF-26 | Media | 5 | ⏳ | S5 |
| PB-36 | E9 | Reserva sin login (crea paciente nuevo) + confirmación | RF-27 | Media | 5 | ⏳ | S5 |
| PB-37 | E10 | Super Admin: listar tenants + analíticas | RF-31 | Baja | 5 | ⏳ | S5 |
| PB-38 | E10 | Activar/desactivar tenant, cambiar plan, reset admin | RF-32, RF-33 | Baja | 3 | ⏳ | S5 |
| PB-T1 | ET | Aislamiento multi-tenant (tenant_id + filtrado central) | RNF-01 | Alta | 8 | ✅ | S1 |
| PB-T2 | ET | Auditoría de eventos sensibles (AuditEvent) | RNF-04 | Media | 3 | ✅ | S1 |
| PB-T3 | ET | Secretos fuera del repo (Secret Manager) | RNF-07 | Alta | 3 | ✅ | S0 |
| PB-T4 | ET | Despliegue serverless GCP + Terraform | RNF-14 | Alta | 8 | ✅ | S0/S3 |
| PB-T5 | ET | CI/CD (tests + build + deploy) con WIF; versionado por tags | RNF-12 | Media | 5 | ✅ | S3 |
| PB-T6 | ET | Cifrado en reposo de datos clínicos sensibles | RNF-02 | Media | 5 | ⏳ | S6 |
| PB-T7 | ET | Auditoría de **acceso** (lectura) a datos clínicos | RNF-03 | Media | 3 | ⏳ | S6 |
| PB-T8 | ET | Rate limiting en auth/booking/links públicos | RNF-06 | Media | 3 | ⏳ | S6 |
| PB-T9 | ET | Derecho de borrado del paciente (ARCO) | RNF-09 | Baja | 3 | ⏳ | S6 |
| PB-T10 | ET | Observabilidad (logs estructurados, métricas por tenant) | RNF-13 | Baja | 3 | ⏳ | S6 |
| PB-T11 | ET | Backups y restore de DB y archivos | RNF-17 | Media | 3 | ⏳ | S6 |

**Resumen de avance:** 25 de 44 ítems del backlog **completados** (todo el núcleo de gestión: identidad, pacientes, registro clínico, turnos, dashboard, multi-tenant, infra/CI-CD). Lo pendiente de mayor valor es la **Épica 6 (Planes + IA supervisada)**, el diferencial del TFG.

---

## 3. Sprint Backlog (por sprint, con incremento entregado)

### Sprint 0 — Setup técnico e infraestructura base ✅
**Objetivo:** dejar el esqueleto técnico listo para construir por módulos.
- Proyecto Django + DRF por apps; settings por entorno; Docker Compose.
- PostgreSQL, Celery, cache, storage S3-compatible, health checks.
- Terraform base + Secret Manager + bucket de state (`RNF-07`, `RNF-14`).
- **Incremento:** entorno reproducible + `manage.py check` OK.

### Sprint 1 — Identidad y multi-tenant ✅
**Objetivo:** que un consultorio pueda registrarse y operar aislado y seguro.
- PB-01…PB-06, PB-T1, PB-T2.
- **Incremento:** flujo register → confirm → login → me; usuarios internos; aislamiento por tenant.
- **Tests:** 18 (auth, usuarios, aislamiento endpoint, middleware/context-var).

### Sprint 2 — Gestión clínica ✅
**Objetivo:** ficha del paciente y registro clínico completo.
- PB-08…PB-14, PB-16, PB-17.
- **Incremento:** pacientes (CRUD+búsqueda), anamnesis (+plantilla), métricas, evoluciones, turnos con estados; UI de fichas con pestañas (anamnesis, evoluciones, turnos).
- **Tests:** 14 (CRUD, aislamiento real del TenantManager, paciente ajeno, IMC, plantilla, auditoría).

### Sprint 3 — Operación, panel, deploy y accesos ✅
**Objetivo:** poner el sistema en producción, usable de punta a punta.
- PB-07 (Google), PB-15 (gráfico de tendencia), PB-19 (dashboard), PB-T4, PB-T5.
- **Incremento:** app **desplegada en `nutrilius.com.ar`**; login Google; dashboard con datos reales; CI/CD con WIF; **versionado release-driven por tags** (`v*.*.*`).
- **Tests:** dashboard + google + users (completan los 40 totales).

### Sprint 4 — Planes alimentarios + IA supervisada ⭐ (planificado)
**Objetivo:** el corazón de la tesis — generar planes con IA **supervisada** (regla → IA → validación → aprobación).
- PB-20…PB-33 (motor de reglas, restricciones duras, IA acotada, validación, seudonimización, máquina de estados + aprobación, trazabilidad, consentimiento, PDF, compartición) + PB-18 (agenda global) + PB-32 (recontacto por inactividad).
- **Incremento esperado:** plan generado por IA que **ningún paciente ve hasta que el profesional lo aprueba** (regla forzada en backend).
- **Tests críticos:** seudonimización, validador post-IA, gate de aprobación.

### Sprint 5 — Portal público, self-scheduling y super admin (planificado)
- PB-34…PB-38: portal por slug, reserva sin login, administración transversal de tenants.

### Sprint 6 — Endurecimiento de seguridad y calidad (planificado)
- PB-T6…PB-T11: cifrado en reposo, auditoría de lectura clínica, rate limiting, ARCO, observabilidad, backups.

---

## 4. Historias de usuario detalladas (con criterios de aceptación)

> Se detallan las **implementadas** clave y la **historia núcleo pendiente** (IA), que es
> la que conviene mostrar completa en la defensa. Formato: *Como… quiero… para…*.

### HU-01 · Registro del consultorio (PB-01, RF-01) — ✅ Hecho
**Como** nutricionista dueño de un consultorio **quiero** registrar mi consultorio y mi
usuario administrador **para** empezar a gestionar mis pacientes.
**Criterios de aceptación:**
- Al registrarme se crea el *tenant* y un usuario con rol `ADMIN` asociado.
- Recibo un email de confirmación; no puedo operar hasta confirmar.
- Dos consultorios distintos nunca ven datos del otro.

### HU-11 · Anamnesis del paciente (PB-11, RF-10) — ✅ Hecho
**Como** profesional **quiero** cargar la anamnesis del paciente (datos generales,
hábitos, recordatorio de 24 h, antropometría) **para** tener su historia clínica y
alimentar luego la generación del plan.
**Criterios de aceptación:**
- Hay **una** anamnesis por paciente, editable (upsert).
- Los datos quedan asociados al tenant y auditados.
- Los campos relevantes (edad, sexo, patologías, objetivos) quedan disponibles para el motor de IA.

### HU-14 · Evoluciones y tendencia (PB-14/PB-15, RF-14) — ✅ Hecho
**Como** profesional **quiero** registrar cada control con antropometría/composición y
**ver la evolución en un gráfico** **para** evaluar el progreso del paciente.
**Criterios de aceptación:**
- Cada evolución guarda peso, talla, IMC (calculado), cintura/cadera/brazo, % grasa, % músculo, TA y notas.
- El gráfico muestra la tendencia de una métrica seleccionable (peso, % músculo, IMC, grasa, cintura) cuando hay ≥2 registros.

### HU-25 · Generación de plan con IA supervisada (PB-20…PB-25, RF-IA-*) — ⏳ Pendiente ⭐
**Como** profesional **quiero** que el sistema **proponga** un plan alimentario con IA,
acotado por un motor de reglas y **sujeto a mi aprobación**, **para** ahorrar tiempo sin
resignar el control clínico ni la seguridad del paciente.
**Criterios de aceptación (restricciones de diseño de la tesis):**
1. Antes de la IA, un **motor de reglas** calcula requerimiento energético y macros y deriva **restricciones duras** (patologías/alergias).
2. A la IA se envía información **seudonimizada** (nunca nombre/DNI/contacto).
3. La IA solo propone **dentro** de esos parámetros (localizado a Argentina).
4. Un **validador post-IA** recalcula calorías/macros; si no cumplen, se marca para revisión.
5. El plan nace en estado `BORRADOR_IA` y **el paciente no lo ve** hasta `APROBADO`/`COMPARTIDO`; la transición exige **aprobación profesional** (gate en backend, firma quién/cuándo/versión).
6. Se registra la **trazabilidad** (prompt, proveedor, modelo, versión, costo) y el **consentimiento** del paciente.

*(El resto de las historias se derivan directamente de la tabla del §2 con el mismo formato.)*

---

## 5. Definition of Done (DoD)

Un ítem está **terminado** cuando:
1. Cumple sus criterios de aceptación.
2. Respeta las **reglas no negociables** (aislamiento por tenant, IA supervisada, aprobación obligatoria, datos de salud protegidos — ver `SKILL.md`).
3. Tiene **tests `pytest` en verde** (backend) y build de frontend OK.
4. Está documentado en el módulo correspondiente (`MODULOS.md`).
5. Quedó **desplegado** (o desplegable por el pipeline) sin romper lo existente.

---

## 6. Notas de alcance para la Entrega 2

- **Pagos y obras sociales** (RF-18/19) están **fuera del alcance** de la tesis (el objetivo
  general es agenda, anamnesis y planes con IA). Se documentan como continuación posible.
- **Datos reales:** el prototipo se prueba con datos **sintéticos/anonimizados**; cualquier
  caso derivado de un consultorio real se trata **seudonimizado y con consentimiento**
  (Ley 25.326). *(Redacción final del apartado a confirmar por el PO.)*
- **DER (estructura de datos):** el modelo objetivo del prototipo suma a las entidades ya
  implementadas (`Tenant`, `User`, `Patient`, `Anamnesis`, `PatientMetric`, `Evolution`,
  `Visit`, `AuditEvent`) las entidades de la Épica 6 aún por diseñar: `NutritionPlan`
  (con máquina de estados), `PlanTemplate`, `PlanGeneration` (traza IA), `PatientConsent`
  y `TenantSettings`. Conviene diseñarlas antes de dibujar el DER final.
