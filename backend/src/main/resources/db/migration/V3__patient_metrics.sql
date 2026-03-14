CREATE TABLE patient_metrics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  measured_at DATETIME NOT NULL,
  weight_kg DECIMAL(6,2),
  height_m DECIMAL(4,2),
  bmi DECIMAL(6,2),
  waist_cm DECIMAL(6,2),
  neck_cm DECIMAL(6,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_metrics_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_metrics_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);
