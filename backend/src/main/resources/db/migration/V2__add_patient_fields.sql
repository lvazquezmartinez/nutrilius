ALTER TABLE patients
  ADD COLUMN first_name VARCHAR(120) NULL,
  ADD COLUMN last_name VARCHAR(120) NULL,
  ADD COLUMN dni VARCHAR(50) NULL,
  ADD COLUMN birth_date DATE NULL,
  ADD COLUMN phone VARCHAR(50) NULL,
  ADD COLUMN email VARCHAR(200) NULL,
  ADD COLUMN address VARCHAR(255) NULL,
  ADD COLUMN sex VARCHAR(30) NULL,
  ADD COLUMN notes TEXT NULL;

UPDATE patients SET first_name = full_name, last_name = '' WHERE first_name IS NULL AND last_name IS NULL;
