-- Esquema inicial del bounded context Identity & Access.
-- Generado a mano porque el entorno de desarrollo no tiene el SDK de .NET disponible.
-- Una vez que corras esto en un entorno con `dotnet ef`, regenerá la migración real con:
--   dotnet ef migrations add InitialIdentity -p src/Nutrilius.Infrastructure -s src/Nutrilius.Api
-- y reemplazá este script por la migración oficial (o usalo como referencia para validarla).

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE IF NOT EXISTS identity.tenants (
    id              uuid PRIMARY KEY,
    name            varchar(200) NOT NULL,
    slug            varchar(100) NOT NULL,
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
