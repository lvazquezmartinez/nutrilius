# Anexo — Estructura de la anamnesis clínica

> Insumo para el **anexo de la tesis**. Documenta la ficha de anamnesis tal como está
> implementada en el prototipo (`backend/apps/clinical/models.py` → `Anamnesis`,
> requerimiento **RF-10**). Es **una anamnesis por paciente**, editable (patrón *upsert*).
> Los campos marcados con ⭐ alimentan el **motor de reglas del módulo de IA** (Fase 4),
> junto con la edad y el sexo del paciente.

## Características generales

| Aspecto | Detalle |
|---|---|
| Cardinalidad | 1 anamnesis por paciente (relación uno-a-uno) |
| Edición | *Upsert*: se crea una vez y se actualiza (no versiona) |
| Aislamiento | Pertenece a un `tenant` (consultorio); solo visible dentro de él |
| Trazabilidad | Registra usuario creador y fechas de alta/modificación |
| Extensibilidad | Campo `data_json` para datos adicionales según la plantilla del tenant |
| Datos sensibles | Tratados como datos de salud (Ley 25.326) — ver `DECISIONES_TECNICAS_Y_SEGURIDAD.md` DS-02 |

## Secciones y campos

### 1 · Datos generales
| Campo | Nombre técnico | Tipo |
|---|---|---|
| Ocupación | `occupation` | Texto corto |
| Motivo de consulta | `reason_for_consultation` | Texto largo |

### 2 · Antecedentes y hábitos tóxicos
| Campo | Nombre técnico | Tipo |
|---|---|---|
| Medicación | `medications` | Texto largo |
| Consumo de alcohol | `alcohol_consumption` | Texto corto |
| Tabaquismo | `smoking_status` | Texto corto |
| Síntomas digestivos | `digestive_symptoms` | Texto largo |

### 3 · Alimentación y hábitos
| Campo | Nombre técnico | Tipo |
|---|---|---|
| Comidas por día | `meals_per_day` | Número entero |
| Quién cocina | `who_cooks` | Texto corto |
| Frecuencia de comer afuera | `eating_out_frequency` | Texto corto |
| Suplementos | `supplements` | Texto largo |
| Alergias alimentarias ⭐ | `food_allergies` | Texto largo |
| Restricciones médico-culturales ⭐ | `medical_cultural_restrictions` | Texto largo |
| Aversiones alimentarias ⭐ | `food_aversions` | Texto largo |
| Comentarios de hábitos | `habits_comments` | Texto largo |

### 4 · Recordatorio de 24 horas
| Campo | Nombre técnico | Tipo |
|---|---|---|
| Desayuno | `recall_24h_breakfast` | Texto largo |
| Colación (media mañana) | `recall_24h_morning_snack` | Texto largo |
| Almuerzo | `recall_24h_lunch` | Texto largo |
| Merienda | `recall_24h_afternoon_snack` | Texto largo |
| Cena | `recall_24h_dinner` | Texto largo |
| Agua | `recall_24h_water` | Texto largo |
| Dulces | `recall_24h_sweets` | Texto largo |
| Métodos de cocción | `recall_24h_cooking_methods` | Texto largo |

### 5 · Actividad física
| Campo | Nombre técnico | Tipo |
|---|---|---|
| Actividad física ⭐ | `physical_activity` | Texto largo |

### 6 · Antropometría
| Campo | Nombre técnico | Tipo | Unidad |
|---|---|---|---|
| Peso ⭐ | `weight_kg` | Decimal | kg |
| Talla ⭐ | `height_cm` | Decimal | cm |
| Cintura | `waist_cm` | Decimal | cm |
| Cuello | `neck_cm` | Decimal | cm |
| Cadera | `hip_cm` | Decimal | cm |
| Brazo | `arm_cm` | Decimal | cm |

### 7 · Cierre
| Campo | Nombre técnico | Tipo |
|---|---|---|
| Comentarios finales | `final_comments` | Texto largo |
| Datos adicionales (según plantilla) | `data_json` | JSON |

> **Total: 33 campos clínicos** + `data_json` extensible. Todos son opcionales
> (la ficha se completa progresivamente a lo largo del seguimiento).

## Plantilla configurable por tenant (RF-11 / RF-12)

Además de los campos fijos, cada consultorio tiene una **plantilla de anamnesis** en
formato JSON (`AnamnesisTemplate`) que puede **adaptar** y **restablecer** a la de por
defecto. La plantilla por defecto define estas secciones:

| Sección | Campos |
|---|---|
| Datos generales | Edad, Sexo, Nivel de actividad |
| Antropometría | Peso (kg), Talla (cm), Peso habitual (kg) |
| Clínica y hábitos | Patologías, Restricciones, Alergias, Hábitos, Objetivo |

## Endpoints de la API

| Acción | Método y ruta |
|---|---|
| Obtener anamnesis de un paciente | `GET /api/anamneses?patient={id}` |
| Crear / actualizar (upsert) | `POST` / `PUT /api/anamneses` |
| Obtener plantilla del tenant | `GET /api/anamnesis-template` |
| Editar plantilla | `PUT /api/anamnesis-template` |
| Restablecer plantilla por defecto | `POST /api/anamnesis-template` |

## Cobertura de pruebas

- `test_anamnesis_solo_acepta_paciente_del_tenant` — valida el aislamiento multi-tenant
  (una anamnesis no puede asociarse a un paciente de otro consultorio).
- `test_anamnesis_template_get_put_reset` — valida obtener, editar y restablecer la plantilla.
