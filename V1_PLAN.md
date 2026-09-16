# Plan de reconstrucción — Nutrilius

Reconstrucción **desde cero** (2026-09). No es un port: se rehace el backend en
`Python + Django + Django REST Framework` + PostgreSQL, tomando como referencia
funcional el relevamiento (`REQUERIMIENTOS.md`, `CASOS_DE_USO_Y_FLUJOS.md`,
`PROJECT_TECHNICAL_SPEC.md`) y la versión previa (Spring Boot + MySQL). Infra en
GCP Compute Engine + Terraform (`INFRAESTRUCTURA.md`).

Nada del backend está implementado en Django todavía: todos los ítems arrancan
pendientes. La lógica de dominio y los contratos se conservan del relevamiento.
Los IDs `RF-*` / `RNF-*` refieren a `REQUERIMIENTOS.md`.

> **Convención:** los **tests son parte de cada fase** (`pytest` + `pytest-django`
> en `backend/apps/<modulo>/tests/`). Una fase no se da por cerrada sin su suite en
> verde. Cada módulo detalla qué cubre en `MODULOS.md` (sección **Tests**).

---

## Fase 0 — Setup y base técnica ✅
- [x] Proyecto Django + DRF, estructura por apps (`config/` + `apps/`, apps de dominio comentadas en INSTALLED_APPS para habilitar por fase)
- [x] Configuración por entorno + `.env`, settings split (`base`/`dev`/`prod`) con endurecimiento de seguridad en prod
- [x] PostgreSQL configurado (migraciones de dominio se agregan por fase) (RNF-12)
- [x] Docker Compose de desarrollo (servicios `backend` + `worker`)
- [x] Celery + broker configurado (RNF-10)
- [x] Cache Redis (`django-redis`)
- [x] Storage S3-compatible configurado en prod (`django-storages`) (RNF-11)
- [x] Health checks (`/health/live`, `/health/ready`)
- Verificado: `manage.py check` sin issues en contenedor (Python 3.12).

## Fase 1 — Identidad y multi-tenant  🚧
- [x] Modelo `Tenant` + capa de tenancy: FK a tenant + `TenantManager` + `TenantMiddleware` de contexto (RNF-01)
- [x] Tests de la fase (18 casos, verdes): flujo de auth, usuarios internos, aislamiento entre tenants a nivel endpoint, context-var/middleware. Filtrado del `TenantManager` sobre entidades reales → se cubre en Fase 2 con el primer modelo tenant-owned.
- [x] `User` propio + roles `SUPER_ADMIN` / `ADMIN` / `USER` (RF-06)
- [x] Registro de tenant + admin (RF-01) — verificado E2E
- [x] Login JWT + refresh (`simplejwt`), exige email confirmado (RF-02) — verificado E2E
- [x] Confirmación de email con token/expiración de un solo uso (RF-03) — verificado E2E
- [x] Forgot / reset password con anti-enumeración (RF-04)
- [x] Gestión de usuarios internos (listar, crear, activar/desactivar) (RF-05)
- [x] Auditoría base (`AuditEvent`) de eventos sensibles (RNF-04) — verificado E2E
- Verificado: migraciones aplicadas en Postgres + flujo register→confirm→login→me OK.

## Fase 2 — Gestión clínica ✅
- [x] Pacientes: CRUD con campos completos, baja/reactivación lógica, `is_new`, búsqueda, auditoría de alta y de lectura clínica (RF-07, RF-08, RF-09)
- [x] Anamnesis: campos estructurados (append-only) + plantilla JSON por tenant + reset (RF-10, RF-11, RF-12)
- [x] Métricas antropométricas en el tiempo, con IMC calculado si falta (RF-13)
- [x] Evoluciones clínicas (RF-14)
- [x] Visitas / agenda: fecha-hora, duración, estado, recordatorio (RF-15, RF-16, RF-17)
- [x] Base `TenantScopedModelViewSet` (scope explícito por tenant + contexto en `initial()`)
- [x] Tests de la fase (14 casos): CRUD, aislamiento entre tenants a nivel endpoint y **filtrado real del `TenantManager`**, validación de paciente ajeno, IMC, plantilla, auditoría.
- Verificado: migraciones aplicadas + 32 tests en verde (Fase 1 + 2).

## Fase 3 — Operación comercial y administración
- [ ] Obras sociales (insurances) por tenant (RF-19)
- [ ] Pagos: método, monto, estado, vencimiento, insurance/visita (RF-18)
- [ ] Configuración del tenant: datos, logo a storage externo, `slug`, plan/feature flags (RF-28, RF-29, RF-30, RNF-15)
- [ ] Dashboard: métricas agregadas (pacientes activos, próximos turnos, cobros)
- [ ] Super Admin: listar tenants, analytics, activar/desactivar, cambiar plan, reset admin (RF-31, RF-32, RF-33)
- [ ] Tests de la fase

## Fase 4 — Planes nutricionales + IA supervisada  ⭐ diferencial
- [ ] Modelo de plan con **máquina de estados** `BORRADOR_IA → EN_REVISION → APROBADO → COMPARTIDO` (RF-IA-06)
- [ ] **Motor de reglas**: requerimiento energético + macros + restricciones duras (RF-IA-01, RF-IA-02)
- [ ] Orquestación de IA: proveedor/modelo configurable, **seudonimización**, prompt versionado (RF-IA-03, RF-IA-05, RF-IA-09)
- [ ] **Validación post-IA**: recalcular calorías/macros y verificar restricciones (RF-IA-04)
- [ ] **Aprobación profesional** obligatoria (gate en backend) con firma quién/cuándo/versión (RF-IA-06)
- [ ] Edición manual, regenerar día/comida, comparar IA vs editado (RF-20, RF-IA-08)
- [ ] Plantillas de plan reutilizables (RF-22)
- [ ] Export a PDF con branding del tenant (RF-23)
- [ ] Compartir por link/token revocable + acceso público al PDF (RF-24, RF-25)
- [ ] Trazabilidad y costo por generación (RF-IA-07)
- [ ] Consentimiento del paciente para uso de IA (RF-IA-10)
- [ ] Tests de la fase (críticos: seudonimización, validador, gate de aprobación — ver MODULOS.md §7)

## Fase 5 — Portal público y self-scheduling
- [ ] Info y disponibilidad por `slug` (RF-26)
- [ ] Reserva sin login + creación de paciente nuevo (RF-27)
- [ ] Confirmación de turno por email
- [ ] Cancelación de turno por link
- [ ] Tests de la fase (endpoints públicos no filtran datos de otros tenants)

## Fase 6 — Integraciones y no funcionales
- [ ] Google Calendar: OAuth2 por tenant, sync de altas/cambios/cancelaciones, webhook
- [ ] Cifrado en reposo de datos clínicos sensibles (RNF-02)
- [ ] Auditoría de acceso (lectura) a datos clínicos (RNF-03)
- [ ] Rate limiting en auth, booking y links públicos (RNF-06)
- [ ] Tokens firmados con expiración corta (RNF-05)
- [ ] Derecho de borrado del paciente / ARCO (RNF-09)
- [ ] Observabilidad: logs estructurados, correlación por tenant, métricas (RNF-13)
- [ ] Backups: snapshots del disco + `pg_dump` a storage (RNF-17)

---

## Infra & Deploy (GCP + Terraform)
- [ ] Terraform: VPC, subnet, firewall, IP estática, Compute Engine, disco de datos, service account (RNF-14)
- [ ] `startup.sh`: Docker + Compose en la VM
- [ ] Bucket de state de Terraform
- [ ] Secretos fuera del repo/state (`.env` en la VM o Secret Manager) (RNF-07)
- [ ] TLS + Cloudflare delante del origen
- [ ] Política de snapshots del disco
- [ ] CI/CD (build + push de imágenes + deploy)

---

## Frontend (React) — activo reutilizable
El frontend React previo (design system, app shell, dashboard, pantallas de
pacientes) es un **activo de partida reutilizable**, no descartado. Al reconstruir
el backend hay que **re-conectarlo a la nueva API Django** y completar pantallas
faltantes (agenda, pagos, obras sociales, planes con estados de aprobación, portal
público, super admin). Se re-evalúa qué se conserva tal cual y qué se rehace.

---

## Fuera del alcance del prototipo (tesis)
- App móvil nativa
- Facturación electrónica / integración fiscal
- Uso clínico real con pacientes reales (es prototipo)
