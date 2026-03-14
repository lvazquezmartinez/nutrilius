CREATE TABLE evolutions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evolutions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_evolutions_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_evolutions_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);
