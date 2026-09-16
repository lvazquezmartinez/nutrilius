-- Extensiones recomendadas para Nutrilius
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- búsquedas por texto en pacientes

-- ─── Esquema Identity & Access (ver infra/postgres/migrations/001_init_identity.sql) ───
-- Solo se ejecuta en un volumen de Postgres nuevo (docker-entrypoint-initdb.d corre una vez).
-- Cuando reemplaces esto por migraciones reales de EF Core, borrá este bloque.

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE IF NOT EXISTS identity.tenants (
    id              uuid PRIMARY KEY,
    name            varchar(200) NOT NULL,
    slug            varchar(100) NOT NULL,
    phone           varchar(30)  NULL,
    address         varchar(300) NULL,
    status          varchar(20)  NOT NULL DEFAULT 'Active',
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NULL,
    CONSTRAINT uq_tenants_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS identity.users (
    id                  uuid PRIMARY KEY,
    tenant_id           uuid NOT NULL REFERENCES identity.tenants(id),
    email               varchar(256) NOT NULL,
    password_hash       varchar(512) NOT NULL,
    name                varchar(200) NOT NULL,
    role                varchar(20)  NOT NULL,
    status              varchar(30)  NOT NULL DEFAULT 'PendingConfirmation',
    email_confirmed_at  timestamptz  NULL,
    created_at          timestamptz  NOT NULL DEFAULT now(),
    updated_at          timestamptz  NULL,
    created_by          uuid NULL,
    updated_by          uuid NULL,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS ix_users_tenant_id ON identity.users(tenant_id);

CREATE TABLE IF NOT EXISTS identity.refresh_tokens (
    id                      uuid PRIMARY KEY,
    tenant_id               uuid NOT NULL REFERENCES identity.tenants(id),
    user_id                 uuid NOT NULL REFERENCES identity.users(id),
    token_hash              varchar(256) NOT NULL,
    expires_at              timestamptz NOT NULL,
    revoked_at              timestamptz NULL,
    replaced_by_token_hash  varchar(256) NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NULL,
    created_by              uuid NULL,
    updated_by              uuid NULL,
    CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON identity.refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS identity.email_confirmation_tokens (
    id              uuid PRIMARY KEY,
    tenant_id       uuid NOT NULL REFERENCES identity.tenants(id),
    user_id         uuid NOT NULL REFERENCES identity.users(id),
    token_hash      varchar(256) NOT NULL,
    expires_at      timestamptz NOT NULL,
    consumed_at     timestamptz NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NULL,
    created_by      uuid NULL,
    updated_by      uuid NULL,
    CONSTRAINT uq_email_confirmation_tokens_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS ix_email_confirmation_tokens_user_id ON identity.email_confirmation_tokens(user_id);

CREATE TABLE IF NOT EXISTS identity.password_reset_tokens (
    id              uuid PRIMARY KEY,
    tenant_id       uuid NOT NULL REFERENCES identity.tenants(id),
    user_id         uuid NOT NULL REFERENCES identity.users(id),
    token_hash      varchar(256) NOT NULL,
    expires_at      timestamptz NOT NULL,
    consumed_at     timestamptz NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NULL,
    created_by      uuid NULL,
    updated_by      uuid NULL,
    CONSTRAINT uq_password_reset_tokens_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON identity.password_reset_tokens(user_id);

-- ─── Esquema Clinical (pacientes) ───

CREATE SCHEMA IF NOT EXISTS clinical;

CREATE TABLE IF NOT EXISTS clinical.patients (
    id              uuid         PRIMARY KEY,
    tenant_id       uuid         NOT NULL REFERENCES identity.tenants(id),
    full_name       varchar(200) NOT NULL,
    dni             varchar(20)  NULL,
    sex             varchar(10)  NULL,
    phone           varchar(30)  NULL,
    email           varchar(256) NULL,
    date_of_birth   date         NULL,
    is_new          boolean      NOT NULL DEFAULT true,
    status          varchar(20)  NOT NULL DEFAULT 'Active',
    deactivated_at  timestamptz  NULL,
    notes           varchar(2000) NULL,
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NULL,
    created_by      uuid         NULL,
    updated_by      uuid         NULL,
    CONSTRAINT uq_patients_tenant_dni UNIQUE NULLS NOT DISTINCT (tenant_id, dni)
);

CREATE INDEX IF NOT EXISTS ix_patients_tenant_id ON clinical.patients(tenant_id);
CREATE INDEX IF NOT EXISTS ix_patients_full_name_trgm ON clinical.patients USING gin(full_name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS clinical.anamneses (
    id                          uuid PRIMARY KEY,
    tenant_id                   uuid NOT NULL REFERENCES identity.tenants(id),
    patient_id                  uuid NOT NULL REFERENCES clinical.patients(id) ON DELETE CASCADE,
    reason_for_consultation     varchar(2000) NULL,
    patient_objectives          varchar(2000) NULL,
    medical_history             varchar(5000) NULL,
    family_history              varchar(2000) NULL,
    surgeries                   varchar(2000) NULL,
    medications                 varchar(2000) NULL,
    supplements                 varchar(2000) NULL,
    allergies_and_intolerances  varchar(2000) NULL,
    dietary_habits              varchar(2000) NULL,
    food_preferences            varchar(2000) NULL,
    food_aversions              varchar(2000) NULL,
    physical_activity           varchar(2000) NULL,
    sleep_hours                 numeric(4,1)  NULL,
    water_intake_liters         numeric(4,1)  NULL,
    alcohol_consumption         varchar(500)  NULL,
    smoking_status              varchar(500)  NULL,
    digestive_symptoms          varchar(2000) NULL,
    additional_notes            varchar(5000) NULL,
    created_at                  timestamptz   NOT NULL DEFAULT now(),
    updated_at                  timestamptz   NULL,
    created_by                  uuid          NULL,
    updated_by                  uuid          NULL,
    CONSTRAINT uq_anamneses_patient UNIQUE (tenant_id, patient_id)
);

CREATE TABLE IF NOT EXISTS clinical.clinical_evolutions (
    id                       uuid PRIMARY KEY,
    tenant_id                uuid NOT NULL REFERENCES identity.tenants(id),
    patient_id               uuid NOT NULL REFERENCES clinical.patients(id) ON DELETE CASCADE,
    date                     date NOT NULL,
    weight_kg                numeric(5,2)  NULL,
    height_cm                numeric(5,1)  NULL,
    bmi                      numeric(5,1)  NULL,
    waist_cm                 numeric(5,1)  NULL,
    hip_cm                   numeric(5,1)  NULL,
    arm_cm                   numeric(5,1)  NULL,
    body_fat_percentage      numeric(5,2)  NULL,
    muscle_mass_percentage   numeric(5,2)  NULL,
    blood_pressure_systolic  int           NULL,
    blood_pressure_diastolic int           NULL,
    clinical_notes           varchar(5000) NULL,
    dietary_assessment       varchar(5000) NULL,
    next_visit_objectives    varchar(2000) NULL,
    created_at               timestamptz   NOT NULL DEFAULT now(),
    updated_at               timestamptz   NULL,
    created_by               uuid          NULL,
    updated_by               uuid          NULL
);

CREATE INDEX IF NOT EXISTS ix_anamneses_patient_id ON clinical.anamneses(patient_id);
CREATE INDEX IF NOT EXISTS ix_clinical_evolutions_patient_date ON clinical.clinical_evolutions(patient_id, date DESC);

CREATE TABLE IF NOT EXISTS clinical.visits (
    id               uuid          PRIMARY KEY,
    tenant_id        uuid          NOT NULL REFERENCES identity.tenants(id),
    patient_id       uuid          NOT NULL REFERENCES clinical.patients(id) ON DELETE CASCADE,
    scheduled_at     timestamptz   NOT NULL,
    duration_minutes int           NULL,
    status           varchar(20)   NOT NULL DEFAULT 'Scheduled',
    reason           varchar(500)  NULL,
    notes            varchar(2000) NULL,
    cancelled_at     timestamptz   NULL,
    created_at       timestamptz   NOT NULL DEFAULT now(),
    updated_at       timestamptz   NULL,
    created_by       uuid          NULL,
    updated_by       uuid          NULL
);

CREATE INDEX IF NOT EXISTS ix_visits_tenant_patient ON clinical.visits(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS ix_visits_scheduled_at ON clinical.visits(tenant_id, scheduled_at DESC);
