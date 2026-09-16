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

### DT-03 Estrategia multi-tenant
- **Decisión:** **base y esquema compartidos con `tenant_id` obligatorio** en toda entidad de negocio, resuelto por una capa de tenancy central (middleware + managers que filtran por tenant).
- **Alternativas:** `schema por tenant` (`django-tenants`), `base por tenant`.
- **Por qué:** simplicidad operativa y de backups para la etapa inicial; el diseño deja lugar para evolucionar a schema-per-tenant en clientes premium. Requiere tests automáticos anti-fuga (ver DS-01).

### DT-04 Autenticación de API
- **Decisión:** **JWT + refresh** con `djangorestframework-simplejwt`.
- **Alternativas:** sesiones de Django, tokens opacos server-side.
- **Por qué:** API stateless consumida por un SPA React; JWT es el encaje natural. El refresh permite sesiones largas sin exponer el access token.

### DT-05 Tareas asíncronas
- **Decisión:** **Celery** con Redis o RabbitMQ como broker.
- **Alternativas:** cron + management commands; Django-Q.
- **Por qué:** mail, generación de PDF y llamadas a la IA no deben bloquear el request. Celery es el estándar del ecosistema y soporta reintentos.

### DT-06 Base de datos
- **Decisión:** **PostgreSQL**.
- **Alternativas:** MySQL (versión previa).
- **Por qué:** mejor soporte de JSON, índices, RLS y crecimiento del modelo; base sólida para datos clínicos.

### DT-07 Cache
- **Decisión:** **Redis** (`django-redis`).
- **Por qué:** cache de lecturas frecuentes y backend de sesiones/locks; reutilizable como broker de Celery.

### DT-08 Almacenamiento de archivos
- **Decisión:** **S3-compatible** (MinIO en dev, Google Cloud Storage en prod) vía `django-storages` + `boto3`.
- **Alternativas:** guardar binarios en base (la versión previa guardaba el logo como `LONGBLOB`).
- **Por qué:** los binarios (logos, PDFs) no deben vivir en la base; storage externo escala y abarata backups.

### DT-09 Integración de IA
- **Decisión:** capa propia de orquestación con **proveedor/modelo configurable** (OpenAI/OpenRouter), en 3 etapas: motor de reglas → LLM acotado → validación. Sin modelos hardcodeados.
- **Alternativas:** llamar directo al LLM desde el endpoint (anti-patrón de la versión previa).
- **Por qué:** garantiza validez clínica, permite fallback y medir costo/trazabilidad. Detalle en `MODULOS.md` §7 y reglas de seguridad DS-03.

### DT-10 Gestión de dependencias y entorno
- **Decisión:** `requirements.txt` (o `pyproject`/`uv` si se prefiere), Python 3.12, configuración por variables de entorno con `django-environ`, settings divididos (`base` / `dev` / `prod`).
- **Por qué:** reproducibilidad y separación de configuración por entorno; simple de entender para la defensa.

### DT-11 Infraestructura y despliegue
- **Decisión:** **GCP Compute Engine (1 VM) + Docker Compose**, aprovisionado con **Terraform**, Cloudflare al frente.
- **Alternativas:** Cloud Run + servicios administrados (Cloud SQL, Memorystore); Kubernetes.
- **Por qué:** costo bajo y predecible para un prototipo, reuso del Docker Compose, Terraform simple pero real. Detalle y comparación en `INFRAESTRUCTURA.md`.

---

## Parte B — Decisiones de seguridad

### DS-01 Aislamiento entre tenants
- **Decisión:** `tenant_id` obligatorio en toda entidad de negocio; filtrado centralizado por el tenant del usuario autenticado (manager/queryset base + middleware de contexto). **Tests automáticos anti-fuga** que verifiquen que ningún endpoint devuelve datos de otro tenant.
- **Riesgo que mitiga:** fuga de datos entre consultorios — el riesgo más grave de un SaaS multi-tenant.
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

### DS-06 Autorización por rol
- **Decisión:** RBAC con `SUPER_ADMIN` / `ADMIN` / `USER` mediante permisos de DRF; `SUPER_ADMIN` es el único que opera fuera de un tenant.
- **Riesgo que mitiga:** escalada de privilegios y operaciones fuera del alcance del rol.
- **Requerimiento:** RF-06.

### DS-07 Gestión de secretos
- **Decisión:** secretos (JWT, DB, API de IA, SMTP) **fuera del repositorio y del state de Terraform**: en `.env` de la VM o en Secret Manager. `.env` real nunca versionado.
- **Riesgo que mitiga:** filtración de credenciales por el repo o el state.
- **Requerimiento:** RNF-07.

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
