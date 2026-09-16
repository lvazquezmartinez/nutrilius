# Requerimientos — Nutrilius

Especificación de requerimientos funcionales (RF) y no funcionales (RNF).
Consolidada a partir del relevamiento de la versión previa (Spring Boot + MySQL +
React) alojada en el repositorio `lvazquezmartinez/nutrilius`, y reencuadrada para
la reconstrucción **desde cero en `Python + Django + DRF`** (ver
`PROJECT_TECHNICAL_SPEC.md` §12.1 e `INFRAESTRUCTURA.md`).

Convención de origen:
- **(H)** heredado: ya existía y funcionaba en la versión previa.
- **(N)** nuevo/reforzado: mejora incorporada en la reconstrucción (varias responden
  a la devolución sobre IA supervisada, validación y datos sensibles).

---

## 1. Alcance

Sistema SaaS **multi-tenant** para profesionales de nutrición: gestión de pacientes,
registro clínico (anamnesis, evoluciones, métricas), agenda y turnos, pagos y obras
sociales, comunicación, y **asistencia de IA supervisada** para planes alimentarios.
Cada tenant (consultorio) opera aislado.

Roles: `SUPER_ADMIN`, `ADMIN` (nutricionista titular), `USER` (profesional/staff),
más paciente y visitante público como actores externos.

---

## 2. Requerimientos funcionales

### 2.1 Identidad y acceso
| ID | Requerimiento | Origen |
|---|---|---|
| RF-01 | Registro de tenant + usuario admin (`/auth/register`). | H |
| RF-02 | Login con email/contraseña y emisión de JWT + refresh. | H |
| RF-03 | Confirmación de email con token y expiración; sin confirmar no hay login. | H |
| RF-04 | Recuperación de contraseña (solicitud + token temporal + reset). | H |
| RF-05 | Gestión de usuarios internos del tenant: crear, listar, activar/desactivar, resetear/enviar reset de contraseña. | H |
| RF-06 | Autorización por rol `SUPER_ADMIN` / `ADMIN` / `USER`. | H |

### 2.2 Pacientes
| ID | Requerimiento | Origen |
|---|---|---|
| RF-07 | CRUD de pacientes con: nombre y apellido, DNI, fecha de nacimiento, sexo, teléfono, email, dirección, notas. | H |
| RF-08 | Listado con búsqueda y paginado; baja/reactivación lógica. | H |
| RF-09 | Marca de paciente “nuevo” (`is_new`) para pacientes creados desde el booking público. | H |

### 2.3 Registro clínico
| ID | Requerimiento | Origen |
|---|---|---|
| RF-10 | Anamnesis por paciente con campos estructurados: edad, sexo, peso, talla, peso habitual, % de pérdida de peso, tabaquismo, nivel de actividad, comidas por día, **patologías, restricciones, alergias, hábitos y objetivo**. | H |
| RF-11 | Plantilla de anamnesis configurable por tenant (JSON); la anamnesis guarda además `data_json` según la plantilla. | H |
| RF-12 | Reset de la plantilla de anamnesis a la de por defecto. | H |
| RF-13 | Métricas antropométricas por paciente en el tiempo: peso, talla, IMC, cintura, cuello, fecha de medición. | H |
| RF-14 | Evoluciones clínicas (notas fechadas) por paciente. | H |

### 2.4 Agenda y turnos
| ID | Requerimiento | Origen |
|---|---|---|
| RF-15 | Turnos con fecha/hora, duración (default 45 min), estado (`SCHEDULED`/`COMPLETED`/…) y notas. | H |
| RF-16 | Vista de agenda/calendario del tenant. | H |
| RF-17 | Marca de recordatorio enviado (`reminder_sent`) para envío de recordatorios. | H |

### 2.5 Pagos y obras sociales
| ID | Requerimiento | Origen |
|---|---|---|
| RF-18 | Registrar pagos por paciente: método, monto, fecha de pago, vencimiento, estado (`PAID`/`PENDING`), turno e insurance asociados. | H |
| RF-19 | Catálogo de obras sociales (insurances) por tenant: crear, listar, editar, activar/desactivar. | H |

### 2.6 Planes nutricionales
| ID | Requerimiento | Origen |
|---|---|---|
| RF-20 | Plan alimentario por paciente: obtener, editar manualmente, guardar. | H |
| RF-21 | Generación asistida por IA del contenido inicial (ver §3). | H → reforzado en N |
| RF-22 | Plantillas de plan reutilizables por tenant: crear, listar, editar, borrar. | H |
| RF-23 | Exportación del plan a PDF con branding del tenant (logo, nombre, matrícula). | H |
| RF-24 | Compartir el plan por **link público con token**, revocable (habilitar/deshabilitar). | H |
| RF-25 | Acceso público al PDF del plan por token (`/public/plan/{token}/pdf`), sin login. | H |

### 2.7 Portal público y self-scheduling
| ID | Requerimiento | Origen |
|---|---|---|
| RF-26 | Página pública de reserva por `slug` del consultorio: ver info y disponibilidad. | H |
| RF-27 | Reservar turno desde el portal público sin login; si el contacto no existe, se crea paciente marcado como nuevo. | H |

### 2.8 Configuración del tenant
| ID | Requerimiento | Origen |
|---|---|---|
| RF-28 | Configurar datos del consultorio: nombre del nutricionista, nombre comercial, matrícula, logo. | H |
| RF-29 | Definir `slug` público único para reservas. | H |
| RF-30 | Definir plan comercial (`plan_type`: `BASIC`/`PRO`/`PREMIUM`) que habilita módulos. | H |

### 2.9 Super Admin
| ID | Requerimiento | Origen |
|---|---|---|
| RF-31 | Listar tenants y ver analíticas de uso. | H |
| RF-32 | Activar/desactivar tenant (con baja lógica y fecha). | H |
| RF-33 | Cambiar plan comercial de un tenant y resetear contraseña de su admin. | H |

---

## 3. Requerimientos del módulo de IA (supervisada)

> La versión previa enviaba a la IA el perfil del paciente (incluido su **nombre
> real**) y devolvía texto libre, sin cálculo nutricional, sin validación y sin
> aprobación como estado. Estos requerimientos cierran esos huecos.

| ID | Requerimiento | Origen |
|---|---|---|
| RF-IA-01 | **Motor de reglas (previo a la IA):** calcular requerimiento energético (p. ej. Mifflin-St Jeor) y distribución de macros según objetivo, a partir de anamnesis y métricas. | N |
| RF-IA-02 | **Restricciones duras:** derivar de patologías, alergias e intolerancias los límites que el plan no puede violar. | N |
| RF-IA-03 | **IA acotada:** el LLM propone alimentos y variedad **dentro** de los parámetros de RF-IA-01/02, localizado a Argentina. | N |
| RF-IA-04 | **Validación (posterior a la IA):** recalcular calorías/macros del plan generado y verificar cumplimiento; si no cumple, regenerar o marcar para revisión. | N |
| RF-IA-05 | **Seudonimización:** nunca enviar al proveedor de IA datos identificatorios (nombre, DNI, contacto); solo edad/sexo/patologías/objetivos/parámetros. | N |
| RF-IA-06 | **Aprobación profesional obligatoria:** máquina de estados `BORRADOR_IA → EN_REVISION → APROBADO → COMPARTIDO`; el paciente solo accede a `APROBADO`/`COMPARTIDO`. Regla forzada en backend. | N |
| RF-IA-07 | **Trazabilidad:** guardar prompt, proveedor, modelo, versión, timestamp, usuario y costo estimado por generación. | N |
| RF-IA-08 | Regenerar solo un día o comida; comparar versión IA vs versión editada. | N |
| RF-IA-09 | **Configurable:** proveedor/modelo de IA por configuración (OpenAI/OpenRouter), con fallback; sin modelos hardcodeados. | N |
| RF-IA-10 | Requerir consentimiento del paciente para el uso de IA antes de generar. | N |

Detalle del caso de uso y flujos en `CASOS_DE_USO_Y_FLUJOS.md` (CU-12 y §5.3).

---

## 4. Requerimientos no funcionales

### 4.1 Seguridad y privacidad de datos de salud
| ID | Requerimiento | Origen |
|---|---|---|
| RNF-01 | Aislamiento multi-tenant: `tenant_id` obligatorio en toda entidad de negocio, filtrado centralizado; tests que eviten fugas entre tenants. | H → reforzado N |
| RNF-02 | Anamnesis e historia clínica tratadas como **datos sensibles de salud** (Ley 25.326); cifrado en reposo de campos sensibles. | N |
| RNF-03 | **Auditoría de acceso** (lectura y escritura) a datos clínicos: quién consultó/modificó qué paciente y cuándo. | N |
| RNF-04 | Auditar eventos sensibles: login, reset, confirmación, altas/bajas, generación de planes IA, exportación/compartición de PDF, cambios de config. | N |
| RNF-05 | Tokens de acción firmados y con expiración corta; token de compartición de plan revocable. | H → reforzado N |
| RNF-06 | Rate limiting en auth, booking y links públicos. | N |
| RNF-07 | Secretos fuera del repo y del estado de infraestructura (`.env`/Secret Manager). | N |
| RNF-08 | CORS/CSP estrictos en producción; validación de origen del frontend. | H |
| RNF-09 | Derecho del paciente al borrado de sus datos (ARCO). | N |

### 4.2 Calidad y operación
| ID | Requerimiento | Origen |
|---|---|---|
| RNF-10 | Tareas pesadas (mail, PDF, generación IA) en segundo plano (Celery). | N |
| RNF-11 | Storage de binarios (logos, PDFs) en almacenamiento externo S3-compatible, no en base como BLOB. | N (la v1 guardaba el logo como `LONGBLOB`) |
| RNF-12 | Migraciones versionadas (migraciones de Django) en lugar de `init.sql`. | N |
| RNF-13 | Observabilidad: logs estructurados, correlación por tenant, métricas de uso. | N |
| RNF-14 | Despliegue en contenedores sobre GCP Compute Engine + Terraform (ver `INFRAESTRUCTURA.md`). | N |
| RNF-15 | Feature flags por tenant en lugar de acoplar la lógica a un enum de plan fijo. | N |
| RNF-16 | Localización a Argentina en contenido de planes y formatos. | H |
| RNF-17 | Estrategia de backup y restore de base de datos y archivos. | N |

---

## 5. Anexo — Modelo de datos relevado (versión previa)

Entidades principales identificadas: `tenants`, `users`, `patients`, `anamneses`
(+ `anamnesis_templates`), `patient_metrics`, `evolutions`, `visits`, `insurances`,
`payments`, `tenant_settings`, `patient_plans` (+ `plan_templates`).

Sirve como base para el modelo en Django; se conservan los contratos funcionales y
se ajustan tipos/normalización según el nuevo diseño (p. ej. logo a storage externo,
estados de plan como máquina de estados, seudonimización en la capa de IA).
