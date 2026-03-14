CREATE TABLE tenants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(30) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE patients (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_patients_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE anamneses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  age INT,
  sex VARCHAR(30),
  weight_kg DECIMAL(6,2),
  height_cm DECIMAL(6,2),
  usual_weight_kg DECIMAL(6,2),
  weight_loss_pct DECIMAL(6,2),
  smoker BOOLEAN,
  activity_level VARCHAR(30),
  meals_per_day INT,
  pathologies TEXT,
  restrictions TEXT,
  allergies TEXT,
  habits TEXT,
  goal TEXT,
  CONSTRAINT fk_anamneses_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_anamneses_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_anamneses_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE visits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  created_by BIGINT NOT NULL,
  visit_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_visits_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_visits_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_visits_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE insurances (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_insurances_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  patient_id BIGINT NOT NULL,
  visit_id BIGINT NULL,
  method VARCHAR(30) NOT NULL,
  insurance_id BIGINT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_payments_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
  CONSTRAINT fk_payments_visit FOREIGN KEY (visit_id) REFERENCES visits(id),
  CONSTRAINT fk_payments_insurance FOREIGN KEY (insurance_id) REFERENCES insurances(id)
);
