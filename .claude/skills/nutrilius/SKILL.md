---
name: nutrilius
description: Central reference for the Nutrilius project — what it is, its modules and how they relate, the non-negotiable rules, and where every design doc lives. Load this before planning a build, making a cross-module change, or reviewing/correcting code, so changes respect the architecture and constraints.
---

# Nutrilius — Guía central del proyecto

Nutrilius es un **SaaS multi-tenant para profesionales de nutrición** (Argentina, español rioplatense) y es el **TFG (tesis)** de Lisandro. Su diferencial es la **asistencia de IA supervisada** para armar planes alimentarios: la IA propone, un motor de reglas la acota y un profesional aprueba.

Se está **reconstruyendo desde cero** en `Python + Django + Django REST Framework` + PostgreSQL (una Django app por módulo), con frontend React (activo reutilizable) e infra en GCP Compute Engine + Terraform. No es un port de versiones previas (hubo una en Spring Boot+MySQL y otra en .NET); esas son referencia funcional, no código a portar.

## Cómo usar esta skill

1. Para **entender el proyecto** o **planear una construcción**: leé el mapa de módulos abajo y luego el doc que corresponda.
2. Para **un cambio que toca un módulo**: identificá el módulo dueño en `MODULOS.md`, revisá sus dependencias (quién lo usa / de quién depende) y respetá las reglas no negociables.
3. Para **el módulo de IA**: es el corazón de la tesis y tiene reglas estrictas — leé siempre las reglas no negociables antes de tocarlo.
4. Antes de dar por cerrado un cambio: verificá aislamiento por tenant, auditoría y (si aplica) el gate de aprobación de planes.
5. **Tests son parte de cada fase/cambio**, no un paso posterior: toda funcionalidad nueva se entrega con su suite `pytest` en verde, y su cobertura se detalla en la sección **Tests** del módulo en `MODULOS.md`. Correr: `docker compose run --rm backend sh -c "pip install -r requirements-dev.txt && pytest"`.

## Documentos de referencia (raíz del repo)

| Doc | Para qué |
|---|---|
| `MODULOS.md` | Detalle de cada módulo: propósito, entidades, dependencias, reglas. **Punto de entrada para cambios.** |
| `REQUERIMIENTOS.md` | Requerimientos funcionales (RF/RF-IA) y no funcionales (RNF), con IDs citables. |
| `CASOS_DE_USO_Y_FLUJOS.md` | Actores, casos de uso y flujos de negocio (Mermaid), incl. proceso integrador. |
| `PROJECT_TECHNICAL_SPEC.md` | Spec funcional completa + recomendaciones de arquitectura (§12 stack, §12.3 bounded contexts). |
| `INFRAESTRUCTURA.md` | Deploy: GCP Compute Engine + Terraform + Docker Compose + Cloudflare. |
| `V1_PLAN.md` | Plan de reconstrucción por fases (0 a 6). Estado de avance. |

## Mapa de módulos

Bounded contexts (una Django app cada uno). Detalle y diagrama de dependencias en `MODULOS.md`.

1. **Identity & Access** — auth, usuarios, roles, JWT.
2. **Tenant Management** — tenant, settings, feature flags, slug público. Raíz del aislamiento.
3. **Clinical Records** — pacientes, anamnesis (+plantilla), métricas, evoluciones. Datos sensibles.
4. **Scheduling** — turnos/agenda, recordatorios.
5. **Billing** — pagos, obras sociales.
6. **Nutrition Plans** — plan del paciente, plantillas, PDF, compartición por token.
7. **AI Orchestration** ⭐ — motor de reglas → IA → validación. El diferencial.
8. **Messaging** — email/notificaciones (async, Celery).
9. **Public Portal** — reservas por slug sin login, acceso a PDF por token.
10. **Super Admin & Analytics** — administración transversal de tenants.
11. **Auditoría** — transversal; trazabilidad de eventos y acceso a datos de salud.

Relaciones clave: Clinical es el núcleo; Scheduling/Billing/Plans cuelgan de Clinical; AI Orchestration lee Clinical y escribe en Plans; Public Portal orquesta Scheduling+Plans+Tenant; Auditoría y Tenant son transversales.

## Reglas NO negociables (verificar en todo cambio)

1. **Aislamiento por tenant.** Toda entidad de negocio lleva `tenant_id`; todo query se filtra por el tenant del usuario. Nunca cruzar datos entre tenants (RNF-01).
2. **IA supervisada, nunca autónoma.** El generador de planes es siempre: motor de reglas (GET+macros+restricciones duras) → IA acotada → validación. La IA no decide sola (RF-IA-01..04).
3. **Aprobación profesional obligatoria.** Máquina de estados `BORRADOR_IA → EN_REVISION → APROBADO → COMPARTIDO`; el paciente solo ve `APROBADO`/`COMPARTIDO`, forzado en backend (RF-IA-06).
4. **Datos sensibles de salud.** Anamnesis/métricas/evoluciones: cifrado en reposo, acceso auditado, y **seudonimización** antes de enviar a la IA (nunca nombre/DNI/contacto) (RNF-02/03, RF-IA-05).
5. **Trazabilidad de IA.** Guardar prompt, proveedor, modelo, versión, timestamp, usuario y costo por generación (RF-IA-07). Proveedor/modelo configurable, sin hardcodear (RF-IA-09).
6. **Secretos** fuera del repo y del state de Terraform (RNF-07).

## Contexto de tesis

Es un TFG en la Universidad Siglo 21. La devolución del asesor pide que los tres puntos —motor de reglas, aprobación profesional y seguridad de datos de salud— sean **restricciones de diseño explícitas**, no menciones al pasar. Están codificados en RF-IA-* y RNF-* y son las reglas no negociables de arriba.
