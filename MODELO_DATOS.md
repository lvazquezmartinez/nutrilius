# Nutrilius — Estructura de datos (DER del prototipo)

> Modelo de datos del prototipo para la Entrega 2. Derivado del código real
> (`backend/apps/*/models.py`). Incluye las entidades **implementadas** y las de la
> **Épica 6 (Planes + IA supervisada)**, cuyo modelo ya está diseñado (app `apps.plans`)
> aunque su lógica se implementa en el Sprint 4.
>
> Convenciones: toda entidad de negocio hereda de `TenantOwnedModel` → lleva `tenant_id`
> y se filtra por tenant (aislamiento multi-tenant, RNF-01). `created_at`/`updated_at`
> son transversales (omitidos en el diagrama por claridad).

## Justificación del diagrama elegido

Se presenta un **Diagrama de Entidad-Relación (DER)** porque el prototipo usa una **base
de datos relacional (PostgreSQL)**. El DER es el diagrama adecuado para modelar datos
relacionales: representa entidades, atributos y las relaciones entre ellas mediante
claves primarias (PK) y foráneas (FK), de forma normalizada. No se usan diagramas de
clases (propios de un modelo orientado a objetos puro) ni de base NoSQL, ya que el
almacenamiento es relacional. El **diccionario de datos** que acompaña al DER está en
`DICCIONARIO_DATOS.md` (obligatorio porque los nombres técnicos están en inglés).

## Diagrama entidad-relación

```mermaid
erDiagram
    TENANT ||--|| TENANT_SETTINGS : "configura"
    TENANT ||--o{ USER : "tiene"
    TENANT ||--o{ PATIENT : "posee"
    TENANT ||--o{ ANAMNESIS_TEMPLATE : "define"
    TENANT ||--o{ PLAN_TEMPLATE : "define"

    USER ||--o{ EMAIL_VERIFICATION_TOKEN : "genera"
    USER ||--o{ PASSWORD_RESET_TOKEN : "genera"

    PATIENT ||--|| ANAMNESIS : "tiene"
    PATIENT ||--o{ PATIENT_METRIC : "mide"
    PATIENT ||--o{ EVOLUTION : "evoluciona"
    PATIENT ||--o{ VISIT : "agenda"
    PATIENT ||--o{ NUTRITION_PLAN : "recibe"
    PATIENT ||--o{ PATIENT_CONSENT : "consiente"

    NUTRITION_PLAN ||--o{ PLAN_GENERATION : "se genera con IA"
    USER ||--o{ NUTRITION_PLAN : "crea/aprueba"

    TENANT {
        int id PK
        string name
        bool active
        datetime deactivated_at
    }
    TENANT_SETTINGS {
        int id PK
        int tenant_id FK "1-1"
        string nutritionist_name
        string business_name
        string license_number "matrícula"
        string logo_url "storage externo"
        string slug "portal público, único"
        string plan_type "BASIC/PRO/PREMIUM"
        json feature_flags
    }
    USER {
        int id PK
        int tenant_id FK
        string email UK
        string first_name
        string last_name
        string role "SUPER_ADMIN/ADMIN/USER"
        bool is_active
    }
    PATIENT {
        int id PK
        int tenant_id FK
        string first_name
        string last_name
        string dni
        date birth_date
        string sex "F/M/X"
        string phone
        string email
        string address
        bool is_new
        bool is_active "baja lógica"
        int created_by_id FK
    }
    ANAMNESIS {
        int id PK
        int tenant_id FK
        int patient_id FK "1-1"
        string occupation
        text reason_for_consultation
        text medications
        text food_allergies
        text medical_cultural_restrictions
        json recall_24h "desayuno..cena, agua"
        decimal weight_kg
        decimal height_cm
        json data_json
    }
    ANAMNESIS_TEMPLATE {
        int id PK
        int tenant_id FK
        json schema
    }
    PATIENT_METRIC {
        int id PK
        int tenant_id FK
        int patient_id FK
        date measured_at
        decimal weight_kg
        decimal height_cm
        decimal bmi "calculado"
        decimal waist_cm
    }
    EVOLUTION {
        int id PK
        int tenant_id FK
        int patient_id FK
        date date
        decimal weight_kg
        decimal bmi "calculado"
        decimal body_fat_pct
        decimal muscle_mass_pct
        int blood_pressure_systolic
        text clinical_notes
        text next_visit_objectives
    }
    VISIT {
        int id PK
        int tenant_id FK
        int patient_id FK
        datetime scheduled_at
        int duration_minutes
        string status "SCHEDULED/COMPLETED/CANCELLED/NO_SHOW"
        string reason
        bool reminder_sent
        datetime cancelled_at
        int created_by_id FK
    }
    NUTRITION_PLAN {
        int id PK
        int tenant_id FK
        int patient_id FK
        string title
        string status "BORRADOR_IA->EN_REVISION->APROBADO->COMPARTIDO"
        string goal
        int target_kcal "motor de reglas"
        decimal target_protein_g
        decimal target_carbs_g
        decimal target_fat_g
        json hard_constraints "restricciones duras"
        json content "días/comidas"
        int approved_by_id FK "aprobación profesional"
        datetime approved_at
        int approved_version
        string share_token "revocable"
        bool share_enabled
        int created_by_id FK
    }
    PLAN_TEMPLATE {
        int id PK
        int tenant_id FK
        string name
        text description
        json content
    }
    PLAN_GENERATION {
        int id PK
        int tenant_id FK
        int plan_id FK
        string provider "OPENAI/OPENROUTER"
        string model
        string prompt_version
        text prompt
        json request_payload "seudonimizado"
        json response_raw
        int input_tokens
        int output_tokens
        decimal estimated_cost_usd
        bool validation_passed "validación post-IA"
        json validation_report
    }
    PATIENT_CONSENT {
        int id PK
        int tenant_id FK
        int patient_id FK
        bool granted
        datetime granted_at
        datetime revoked_at
        string method
        int recorded_by_id FK
    }
    EMAIL_VERIFICATION_TOKEN {
        int id PK
        int user_id FK
        string token UK
        datetime expires_at
    }
    PASSWORD_RESET_TOKEN {
        int id PK
        int user_id FK
        string token UK
        datetime expires_at
        bool used
    }
```

## Notas de diseño relevantes para la tesis

1. **Aislamiento (RNF-01):** `tenant_id` en toda entidad de negocio; el `TenantManager`
   filtra por el tenant del request. Es la restricción de seguridad transversal.
2. **Datos de salud (RNF-02/03):** `Anamnesis`, `PatientMetric`, `Evolution` son datos
   sensibles (Ley 25.326) → cifrado en reposo y auditoría de acceso (Sprint 6).
3. **Máquina de estados del plan (RF-IA-06):** `NutritionPlan.status` gobierna la
   visibilidad; el paciente solo ve `APROBADO`/`COMPARTIDO`. La aprobación queda firmada
   (`approved_by`, `approved_at`, `approved_version`).
4. **Trazabilidad y seudonimización de IA (RF-IA-05/07):** `PlanGeneration.request_payload`
   guarda lo que se envió a la IA, **sin datos identificatorios**; se registra proveedor,
   modelo, versión, tokens y costo.
5. **Consentimiento (RF-IA-10):** `PatientConsent` exige consentimiento activo del paciente
   antes de generar con IA.
6. **Fuera del alcance:** `Payment` e `Insurance` (billing) no forman parte del prototipo
   de la tesis y no se modelan.

## Entidades por estado de implementación

| Entidad | Estado | App |
|---|---|---|
| Tenant, User, Patient, Anamnesis(+Template), PatientMetric, Evolution, Visit, AuditEvent, tokens | ✅ Implementadas | tenants, identity, clinical, scheduling, audit |
| **TenantSettings** | 🟡 Modelo diseñado (Sprint 4) | tenants |
| **NutritionPlan, PlanTemplate, PlanGeneration, PatientConsent** | 🟡 Modelo diseñado (Sprint 4) | plans |
