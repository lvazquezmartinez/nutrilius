CREATE TABLE tenant_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL UNIQUE,
  nutritionist_name VARCHAR(200) NULL,
  business_name VARCHAR(200) NULL,
  license_number VARCHAR(100) NULL,
  plan_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  logo_mime VARCHAR(100) NULL,
  logo_blob LONGBLOB NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE patient_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  content_text TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plans_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_plans_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_plans_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);
