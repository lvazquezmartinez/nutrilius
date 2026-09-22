# Decisiones técnicas y de seguridad — Nutrilius

Registro de las decisiones de arquitectura, tecnología y seguridad de la
reconstrucción. Cada decisión indica **qué se eligió, qué alternativas se
consideraron y por qué**. Sirve de sustento para la tesis y de guía para construir
y revisar el sistema. Complementa `MODULOS.md`, `REQUERIMIENTOS.md` e
`INFRAESTRUCTURA.md`.

Formato: estilo ADR (Architecture Decision Record) resumido.

---

## Parte A — Decisiones técnicas

### DT-01 Lenguaje y framework de backend
- **Decisión:** `Python 3.12 + Django 5 + Django REST Framework`.
- **Alternativas:** .NET 8 (versión previa), Spring Boot (versión previa), Node/NestJS.
- **Por qué:** el diferencial del producto es la orquestación de IA + motor de reglas nutricionales; el ecosistema Python es el estándar para eso. Django aporta ORM maduro, migraciones, admin, auth y permisos de fábrica, acelerando el prototipo. DRF cubre la API REST directamente.

### DT-02 Estilo de arquitectura
- **Decisión:** **monolito modular** — un proyecto Django con **una app por módulo** (bounded context).
- **Alternativas:** microservicios; monolito sin separación clara.
- **Por qué:** para un prototipo de tesis operado por una VM única, microservicios son sobreingeniería. La separación por apps mantiene los límites del dominio (ver `MODULOS.md`) y permite extraer servicios más adelante si hace falta (p. ej. AI Orchestration).

### DT-03 Estrategia multi-tenant (shared-schema)
- **Decisión:** **shared database, shared schema** — una **única base PostgreSQL** con **tablas compartidas** por todos los consultorios; cada entidad de negocio lleva una columna **`tenant_id` obligatoria**. El aislamiento entre tenants es **lógico, a nivel de aplicación** (no hay separación física por base ni por esquema).
- **Cómo se implementa (capa de tenancy central):**
  1. `TenantMiddleware` toma el `tenant_id` del usuario autenticado (JWT) y lo guarda en un **`ContextVar` por request**.
  2. `TenantManager.get_queryset()` **filtra automáticamente** todo queryset por ese `tenant_id` — es el `objects` por defecto de `TenantOwnedModel`.
  3. `TenantScopedModelViewSet` refuerza el scope en cada endpoint (filtra por `request.user.tenant_id` y fija el contexto en `initial()`).
  4. El acceso sin scope (`all_objects` / `all_tenants`) queda reservado para uso administrativo **explícito**.
- **Alternativas:** `schema por tenant` (`django-tenants`), `base por tenant`, **Row-Level Security (RLS) de Postgres**.
- **Por qué:** simplicidad operativa y de costo para un prototipo de consultorios chicos/medianos — **una sola base, un juego de migraciones, un único backup**. Es un patrón estándar de SaaS. El diseño deja lugar para evolucionar sin reescribir el dominio.
- **Qué NO provee — riesgo residual:** no existe una barrera **en la base**. Quien se conecte por **SQL crudo** (connector/credenciales de la DB) ve **todos los tenants**. El aislamiento **depende de que el código esté correcto**: un query mal scopeado (`all_objects`, `.raw()`, SQL directo) podría filtrar datos entre consultorios. Se mitiga con los **tests automáticos anti-fuga** de DS-01, que verifican a nivel endpoint y a nivel del `TenantManager` que ningún tenant vea datos de otro.
- **Evolución / hardening (planteado, no en el prototipo):** **RLS de Postgres** — *policies* que fuerzan `tenant_id` en la propia base (seteando una variable de sesión por request), como **defensa en profundidad** para datos de salud aunque el filtro de la app falle; y `schema-per-tenant` para clientes premium.
- **Requerimiento:** RNF-01. Ver **DS-01**.

### DT-04 Autenticación de API
- **Decisión:** **JWT + refresh** con `djangorestframework-simplejwt`.
- **Alternativas:** sesiones de Django, tokens opacos server-side.
- **Por qué:** API stateless consumida por un SPA React; JWT es el encaje natural. El refresh permite sesiones largas sin exponer el access token.

### DT-05 Tareas asíncronas
- **Decisión:** **Cloud Tasks** (GCP) que encola trabajos como HTTP y los reingresa a un endpoint interno autenticado (OIDC) de la API en Cloud Run.
- **Alternativas:** Celery + Redis/RabbitMQ (requiere broker y worker siempre encendido); Pub/Sub; Django-Q.
- **Por qué:** en una arquitectura serverless no queremos un worker permanente ni Memorystore (costo fijo). Cloud Tasks da reintentos y desacople sin infraestructura extra. *(Actualizado desde Celery al pasar a serverless; las funciones de tarea se conservan, cambia el mecanismo de disparo.)*

### DT-06 Base de datos
- **Decisión:** **PostgreSQL**.
- **Alternativas:** MySQL (versión previa).
- **Por qué:** mejor soporte de JSON, índices, RLS y crecimiento del modelo; base sólida para datos clínicos.

### DT-07 Cache
- **Decisión:** **sin cache dedicada** en el prototipo serverless (se evita Memorystore por su costo fijo). En dev se usa Redis local; en prod, si hiciera falta, se evalúa Memorystore o cache local por instancia.
- **Alternativas:** Memorystore (Redis gestionado, ~USD 35/mes).
- **Por qué:** el prototipo no tiene una carga de lectura que justifique Redis gestionado; se prioriza costo. *(Actualizado al pasar a serverless.)*

### DT-08 Almacenamiento de archivos
- **Decisión:** **Google Cloud Storage (GCS)** vía `django-storages`; buckets privados con **URLs firmadas** para logos y PDFs. MinIO se usa solo en dev.
- **Alternativas:** guardar binarios en base (la versión previa guardaba el logo como `LONGBLOB`).
- **Por qué:** los binarios no deben vivir en la base; GCS es el storage nativo de la nube elegida y sirve además de origen para la CDN del frontend.

### DT-09 Integración de IA
- **Decisión:** capa propia de orquestación con **proveedor/modelo configurable** (OpenAI/OpenRouter), en 3 etapas: motor de reglas → LLM acotado → validación. Sin modelos hardcodeados.
- **Alternativas:** llamar directo al LLM desde el endpoint (anti-patrón de la versión previa).
- **Por qué:** garantiza validez clínica, permite fallback y medir costo/trazabilidad. Detalle en `MODULOS.md` §7 y reglas de seguridad DS-03.

### DT-10 Gestión de dependencias y entorno
- **Decisión:** `requirements.txt` (o `pyproject`/`uv` si se prefiere), Python 3.12, configuración por variables de entorno con `django-environ`, settings divididos (`base` / `dev` / `prod`).
- **Por qué:** reproducibilidad y separación de configuración por entorno; simple de entender para la defensa.

### DT-11 Infraestructura y despliegue
- **Decisión:** **serverless en GCP** con Terraform: API en **Cloud Run**, base en **Cloud SQL**, frontend estático en **GCS + HTTPS Load Balancer + Cloud CDN**, tareas en **Cloud Tasks**, archivos en **GCS**, secretos en **Secret Manager**.
- **Alternativas:** VM única (Compute Engine + Docker Compose) — enfoque previo; Kubernetes (GKE) — sobreingeniería.
- **Por qué:** escalar a cero, no administrar servidores y mantener los secretos fuera del código. Se acepta el costo fijo de Cloud SQL y del Load Balancer a cambio de operación mínima. Detalle en `INFRAESTRUCTURA.md`. *(Actualizado desde la VM única a serverless.)*

---

## Parte B — Decisiones de seguridad

### DS-01 Aislamiento entre tenants
- **Decisión:** `tenant_id` obligatorio en toda entidad de negocio; filtrado centralizado por el tenant del usuario autenticado (manager/queryset base + middleware de contexto). **Tests automáticos anti-fuga** que verifiquen que ningún endpoint devuelve datos de otro tenant.
- **Riesgo que mitiga:** fuga de datos entre consultorios — el riesgo más grave de un SaaS multi-tenant.
- **Riesgo residual:** al ser **shared-schema** (ver DT-03), el aislamiento es **de aplicación**, no de base: un query sin scope o el acceso por SQL crudo cruzan tenants. Por eso los tests anti-fuga son parte obligatoria de cada fase.
- **Hardening futuro:** **RLS de Postgres** como defensa en profundidad a nivel base.
- **Requerimiento:** RNF-01.

### DS-02 Protección de datos sensibles de salud
- **Decisión:** anamnesis, métricas y evoluciones se tratan como **datos sensibles de salud** (Ley 25.326, art. 8; Ley 26.529): **cifrado en reposo** de los campos sensibles y **auditoría del acceso de lectura**, no solo de escritura.
- **Riesgo que mitiga:** exposición o acceso indebido a historia clínica.
- **Requerimiento:** RNF-02, RNF-03.

### DS-03 Seudonimización ante la IA
- **Decisión:** al enviar datos al proveedor de IA se remueven identificadores (nombre, DNI, contacto); solo se envían edad, sexo, patologías, restricciones, objetivos y parámetros. Uso de proveedor/endpoint con **retención cero** (no-training) documentado.
- **Riesgo que mitiga:** envío de datos identificatorios de salud a un tercero fuera del país (exactamente lo que hacía la versión previa).
- **Requerimiento:** RF-IA-05.

### DS-04 Aprobación profesional como control de seguridad clínica
- **Decisión:** máquina de estados del plan con **gate de aprobación** forzado en backend; el paciente solo accede a planes `APROBADO`/`COMPARTIDO`, con registro de quién aprobó, cuándo y qué versión.
- **Riesgo que mitiga:** que un plan generado por IA llegue al paciente sin validación de un profesional matriculado (responsabilidad clínica y legal).
- **Requerimiento:** RF-IA-06.

### DS-05 Autenticación y tokens
- **Decisión:** contraseñas con el hasher de Django (PBKDF2/Argon2); JWT firmados con expiración corta y refresh rotativo; tokens de acción (confirmación, reset, compartición) firmados, con expiración y **revocables**.
- **Riesgo que mitiga:** secuestro de sesión, reutilización de tokens, enlaces públicos permanentes.
- **Requerimiento:** RNF-05.

### DS-06 Autorización (autenticación + tenant; rol acotado)
- **Estado real:** el control de acceso efectivo hoy es **autenticación obligatoria (JWT) + aislamiento por tenant**. Existe el enum de roles `SUPER_ADMIN` / `ADMIN` / `USER`, pero su **enforcement es acotado**:
  - `IsTenantAdmin` (rol `ADMIN`) protege **solo la gestión de usuarios internos** (`/users`, activar/desactivar).
  - `IsSuperAdmin` está **definido pero sin uso** (el módulo Super Admin no está construido).
  - **Todo lo clínico** (pacientes, anamnesis, evoluciones, turnos, dashboard) usa **solo `IsAuthenticated` + scope por tenant**: cualquier usuario del consultorio hace lo mismo sobre los datos de su tenant. **No hay una matriz de permisos por rol sobre los datos clínicos.**
- **Decisión de diseño:** para un consultorio chico —donde el profesional titular y su staff comparten la operación clínica— **no** se implementa RBAC granular sobre datos clínicos en el prototipo; el límite de seguridad es **tenant + autenticación** (+ rol `ADMIN` solo para administrar usuarios).
- **Riesgo que mitiga / residual:** evita operaciones administrativas de usuarios por parte de no-admins. **No** distingue permisos clínicos entre roles (riesgo asumido para el alcance actual).
- **Hardening futuro:** matriz de permisos por rol (p. ej. `USER` sin borrar/exportar) y activación de `IsSuperAdmin` al construir el módulo Super Admin.
- **Requerimiento:** RF-06.

### DS-07 Gestión de secretos
- **Decisión:** secretos (JWT, DB, API de IA, SMTP) en **GCP Secret Manager**, inyectados en Cloud Run como env/volúmenes al deploy. Terraform crea solo los *contenedores*; los valores se cargan aparte (CLI/consola), **nunca** en el repo, en `.tf`/`tfvars` ni en el state. En dev se usa `.env` local (git-ignored).
- **Riesgo que mitiga:** filtración de credenciales por el repo, el state o el código.
- **Requerimiento:** RNF-07.
- **Nota:** las credenciales SMTP reales que aparecían en un `.env.example` histórico deben **rotarse** (estuvieron en un repo).

### DS-08 Auditoría
- **Decisión:** `AuditEvent` inmutable que registra login, reset, confirmación, altas/bajas, **acceso a datos clínicos**, generación de planes IA (con prompt/modelo/versión/costo), export/compartición de PDF, cambios de config y acciones de super admin.
- **Riesgo que mitiga:** falta de trazabilidad ante incidentes; requisito de historia clínica.
- **Requerimiento:** RNF-03, RNF-04, RF-IA-07.

### DS-09 Superficies públicas
- **Decisión:** **rate limiting** en auth, booking y links públicos; validación de origen del frontend; los endpoints públicos nunca exponen datos de otros pacientes.
- **Riesgo que mitiga:** fuerza bruta, abuso de reservas, scraping de links públicos.
- **Requerimiento:** RNF-06, RNF-08.

### DS-10 Transporte y borde
- **Decisión:** TLS terminado en Cloudflare (o Let's Encrypt vía Nginx); Cloudflare Proxy oculta la IP de origen; CORS/CSP estrictos en producción.
- **Riesgo que mitiga:** intercepción en tránsito, exposición directa del origen.
- **Requerimiento:** RNF-08, RNF-14.

### DS-11 Consentimiento y derechos del paciente
- **Decisión:** consentimiento informado del paciente para el tratamiento de datos y el uso de IA (flag con fecha); soporte del **derecho de borrado** (ARCO).
- **Riesgo que mitiga:** incumplimiento de la normativa de protección de datos.
- **Requerimiento:** RF-IA-10, RNF-09.

### DS-12 Respaldo y recuperación
- **Decisión:** snapshots automáticos del disco de datos + `pg_dump` programado a storage externo; procedimiento de restore documentado.
- **Riesgo que mitiga:** pérdida de datos clínicos.
- **Requerimiento:** RNF-17.

---

## Parte C — Trade-offs asumidos (alcance de prototipo)

- **VM única = punto único de falla.** Aceptable para un prototipo; se mitiga con snapshots y se evoluciona a servicios administrados si hace falta.
- **Sin alta disponibilidad ni autoescalado.** Fuera del alcance de la tesis.
- **Cifrado en reposo a nivel de campo** puede empezar por cifrado de disco (CMEK) y evolucionar a cifrado por campo según el tiempo disponible.
- **No hay uso clínico real** con pacientes reales: es un prototipo, no un producto certificado.
