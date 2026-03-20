CREATE TABLE plan_templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  content_text TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plan_templates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

ALTER TABLE patient_plans
  ADD COLUMN share_token VARCHAR(255) NULL,
  ADD COLUMN share_enabled TINYINT(1) NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX ux_patient_plans_share_token ON patient_plans(share_token);

ALTER TABLE users
  ADD COLUMN reset_token VARCHAR(255) NULL,
  ADD COLUMN reset_expires DATETIME NULL;
