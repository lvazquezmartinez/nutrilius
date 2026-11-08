# Diccionario de datos — Nutrilius (Entrega 2)

> Complementa el DER (`MODELO_DATOS.md`). La consigna exige diccionario de datos cuando
> los nombres de entidad/atributo **no están en español**; los modelos usan nombres
> técnicos en inglés, por lo que se documenta cada campo: **Campo · Longitud · Tipo ·
> Descripción**. Longitud en caracteres (texto) o `dígitos,decimales` (numérico decimal);
> `—` = no aplica. Derivado de `backend/apps/*/models.py`.

## Campos transversales (en toda entidad de negocio)
Para no repetirlos en cada tabla, todas las entidades incluyen:

| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| id | — | Entero (PK) | Identificador único autoincremental |
| tenant_id | — | Entero (FK) | Consultorio dueño del registro (aislamiento multi-tenant) |
| created_at | — | Fecha y hora | Fecha de alta del registro |
| updated_at | — | Fecha y hora | Fecha de última modificación |
| created_by_id | — | Entero (FK → User) | Usuario que creó el registro (cuando aplica) |

> Excepciones: `Tenant` y `User` no tienen `tenant_id`; `AuditEvent` guarda `tenant_id`
> como entero opcional (eventos previos al tenant o de super admin).

---

## Tenant (consultorio)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| name | 200 | Texto | Nombre del consultorio |
| active | — | Booleano | Consultorio activo/baja lógica |
| deactivated_at | — | Fecha y hora | Fecha de desactivación |

## TenantSettings (configuración del consultorio)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| tenant_id | — | Entero (FK, 1-1) | Consultorio al que pertenece |
| nutritionist_name | 200 | Texto | Nombre del profesional titular |
| business_name | 200 | Texto | Nombre comercial |
| license_number | 100 | Texto | Matrícula profesional |
| logo_url | 200 | URL | Logo (almacenamiento externo) |

## User (usuario del sistema)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| email | 254 | Email | Correo, único; es el identificador de login |
| first_name | 120 | Texto | Nombre |
| last_name | 120 | Texto | Apellido |
| tenant_id | — | Entero (FK) | Consultorio al que pertenece |
| email_verified | — | Booleano | Email confirmado (requisito para login) |
| is_active | — | Booleano | Usuario activo |
| is_staff | — | Booleano | Acceso al admin de Django |
| password | 128 | Texto (hash) | Contraseña cifrada (PBKDF2/Argon2) |

## EmailVerificationToken / PasswordResetToken (tokens de acción)
Tokens de un solo uso para confirmar el email y restablecer la contraseña (RF-03/04).

| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| user_id | — | Entero (FK → User) | Usuario dueño del token |
| token | 64 | Texto | Token único |
| expires_at | — | Fecha y hora | Vencimiento (48 h email / 2 h reset) |
| used / used_at | — | Booleano / Fecha y hora | Marca de un solo uso |

## Patient (paciente)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| first_name | 120 | Texto | Nombre |
| last_name | 120 | Texto | Apellido |
| dni | 50 | Texto | Documento de identidad |
| birth_date | — | Fecha | Fecha de nacimiento |
| sex | 1 | Texto (enum) | Sexo: F/M/X |
| phone | 50 | Texto | Teléfono |
| email | 254 | Email | Correo del paciente |
| address | 255 | Texto | Domicilio |
| notes | — | Texto largo | Observaciones |
| is_new | — | Booleano | Alta desde el portal público de reservas |
| is_active | — | Booleano | Paciente activo/baja lógica |

## Anamnesis (historia clínica inicial — 1 por paciente)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| patient_id | — | Entero (FK, 1-1) | Paciente |
| occupation | 200 | Texto | Ocupación |
| reason_for_consultation | — | Texto largo 🔒 | Motivo de consulta (cifrado en reposo, HU-22) |
| medications | — | Texto largo 🔒 | Medicación actual (cifrado en reposo, HU-22) |
| alcohol_consumption | 120 | Texto | Consumo de alcohol |
| smoking_status | 120 | Texto | Tabaquismo |
| digestive_symptoms | — | Texto largo | Síntomas digestivos |
| meals_per_day | — | Entero | Comidas por día |
| who_cooks | 120 | Texto | Quién cocina |
| eating_out_frequency | 120 | Texto | Frecuencia de comer afuera |
| supplements | — | Texto largo | Suplementos |
| food_allergies | — | Texto largo | Alergias alimentarias |
| medical_cultural_restrictions | — | Texto largo | Restricciones médico-culturales |
| food_aversions | — | Texto largo | Aversiones alimentarias |
| habits_comments | — | Texto largo | Comentarios de hábitos |
| recall_24h_breakfast | — | Texto largo | Recordatorio 24 h: desayuno |
| recall_24h_morning_snack | — | Texto largo | Recordatorio 24 h: colación |
| recall_24h_lunch | — | Texto largo | Recordatorio 24 h: almuerzo |
| recall_24h_afternoon_snack | — | Texto largo | Recordatorio 24 h: merienda |
| recall_24h_dinner | — | Texto largo | Recordatorio 24 h: cena |
| recall_24h_water | — | Texto largo | Recordatorio 24 h: agua |
| recall_24h_sweets | — | Texto largo | Recordatorio 24 h: dulces |
| recall_24h_cooking_methods | — | Texto largo | Recordatorio 24 h: métodos de cocción |
| physical_activity | — | Texto largo | Actividad física |
| weight_kg | 6,2 | Decimal | Peso (kg) |
| height_cm | 6,2 | Decimal | Talla (cm) |
| waist_cm | 6,2 | Decimal | Cintura (cm) |
| neck_cm | 6,2 | Decimal | Cuello (cm) |
| hip_cm | 6,2 | Decimal | Cadera (cm) |
| arm_cm | 6,2 | Decimal | Brazo (cm) |
| final_comments | — | Texto largo 🔒 | Comentarios finales (cifrado en reposo, HU-22) |
| data_json | — | JSON | Datos adicionales según plantilla del consultorio |

## AnamnesisTemplate (plantilla de anamnesis por consultorio)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| template_json | — | JSON | Definición de secciones y campos de la plantilla |

## PatientMetric (métrica antropométrica en el tiempo)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| patient_id | — | Entero (FK) | Paciente |
| measured_at | — | Fecha y hora | Fecha de medición |
| weight_kg | 6,2 | Decimal | Peso (kg) |
| height_m | 4,2 | Decimal | Talla (m) |
| bmi | 6,2 | Decimal | Índice de masa corporal (calculado) |
| waist_cm | 6,2 | Decimal | Cintura (cm) |
| neck_cm | 6,2 | Decimal | Cuello (cm) |

## Evolution (evolución clínica / control)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| patient_id | — | Entero (FK) | Paciente |
| date | — | Fecha | Fecha del control |
| weight_kg | 6,2 | Decimal | Peso (kg) |
| height_cm | 6,2 | Decimal | Talla (cm) |
| bmi | 6,2 | Decimal | IMC (calculado) |
| waist_cm | 6,2 | Decimal | Cintura (cm) |
| hip_cm | 6,2 | Decimal | Cadera (cm) |
| arm_cm | 6,2 | Decimal | Brazo (cm) |
| body_fat_pct | 5,2 | Decimal | % de grasa corporal |
| muscle_mass_pct | 5,2 | Decimal | % de masa muscular |
| blood_pressure_systolic | — | Entero | Presión arterial sistólica (mmHg) |
| blood_pressure_diastolic | — | Entero | Presión arterial diastólica (mmHg) |
| clinical_notes | — | Texto largo 🔒 | Notas clínicas (cifrado en reposo, HU-22) |
| dietary_assessment | — | Texto largo | Evaluación dietética |
| next_visit_objectives | — | Texto largo | Objetivos para la próxima consulta |

## Visit (turno / agenda)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| patient_id | — | Entero (FK) | Paciente |
| scheduled_at | — | Fecha y hora | Fecha y hora del turno |
| duration_minutes | — | Entero | Duración (por defecto 45) |
| status | 20 | Texto (enum) | SCHEDULED/COMPLETED/CANCELLED/NO_SHOW |
| reason | 255 | Texto | Motivo del turno |
| notes | — | Texto largo | Notas |
| reminder_sent | — | Booleano | Recordatorio enviado |
| cancelled_at | — | Fecha y hora | Fecha de cancelación |

## AuditEvent (auditoría de eventos)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| tenant_id | — | Entero (opcional) | Consultorio del evento (puede ser nulo) |
| actor_id | — | Entero (FK → User) | Usuario que ejecutó la acción |
| action | 40 | Texto (enum) | Tipo de evento (LOGIN, CLINICAL_READ, …) |
| entity | 80 | Texto | Entidad afectada |
| entity_id | 64 | Texto | Identificador de la entidad afectada |
| metadata | — | JSON | Datos del evento |
| ip_address | 45 | IP | Dirección IP de origen |
| created_at | — | Fecha y hora | Momento del evento |

---

## Entidades del módulo de IA (diseñadas — Fase 4)

### NutritionPlan (plan alimentario)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| patient_id | — | Entero (FK) | Paciente |
| title | 200 | Texto | Título del plan |
| status | 20 | Texto (enum) | BORRADOR_IA/EN_REVISION/APROBADO/COMPARTIDO |
| goal | 20 | Texto (enum) | Objetivo: mantenimiento/descenso/aumento/otro |
| target_kcal | — | Entero | Requerimiento energético (motor de reglas) |
| target_protein_g | 6,1 | Decimal | Objetivo de proteínas (g) |
| target_carbs_g | 6,1 | Decimal | Objetivo de carbohidratos (g) |
| target_fat_g | 6,1 | Decimal | Objetivo de grasas (g) |
| hard_constraints | — | JSON | Restricciones duras (patologías/alergias) |
| content | — | JSON | Contenido del plan (días/comidas) |
| professional_notes | — | Texto largo | Notas del profesional |
| approved_by_id | — | Entero (FK → User) | Profesional que aprobó |
| approved_at | — | Fecha y hora | Fecha de aprobación |
| share_token | 64 | Texto | Token de compartición pública |
| share_enabled | — | Booleano | Compartición habilitada |

### PlanGeneration (traza de generación con IA)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| plan_id | — | Entero (FK) | Plan generado |
| provider | 20 | Texto (enum) | Proveedor de IA (OpenAI/OpenRouter) |
| model | 120 | Texto | Modelo utilizado |
| prompt_version | 40 | Texto | Versión del prompt |
| prompt | — | Texto largo | Prompt enviado |
| request_payload | — | JSON | Payload seudonimizado enviado a la IA |
| response_raw | — | JSON | Respuesta cruda de la IA |
| input_tokens | — | Entero | Tokens de entrada |
| output_tokens | — | Entero | Tokens de salida |
| estimated_cost_usd | 8,4 | Decimal | Costo estimado (USD) |
| validation_passed | — | Booleano | Resultado de la validación post-IA |
| validation_report | — | JSON | Detalle de la validación |

### PatientConsent (consentimiento de IA)
| Campo | Longitud | Tipo | Descripción |
|---|---|---|---|
| patient_id | — | Entero (FK) | Paciente |
| granted | — | Booleano | Consentimiento otorgado |
| granted_at | — | Fecha y hora | Fecha de otorgamiento |
| revoked_at | — | Fecha y hora | Fecha de revocación |
| method | 50 | Texto | Modo de registro (verbal/firma/formulario) |
| notes | — | Texto largo | Observaciones |
| recorded_by_id | — | Entero (FK → User) | Usuario que registró el consentimiento |
