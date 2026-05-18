ALTER TABLE patients
  ADD COLUMN is_new TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE tenant_settings
  ADD COLUMN public_booking_slug VARCHAR(120) NULL;

UPDATE patients p
SET p.is_new = 0
WHERE p.is_new IS NOT NULL;

UPDATE tenant_settings ts
SET ts.public_booking_slug = CONCAT('turnos-', ts.tenant_id)
WHERE ts.public_booking_slug IS NULL OR ts.public_booking_slug = '';

ALTER TABLE tenant_settings
  ADD CONSTRAINT uk_tenant_settings_public_booking_slug UNIQUE (public_booking_slug);
