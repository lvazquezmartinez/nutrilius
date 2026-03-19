ALTER TABLE tenant_settings ADD COLUMN plan_type VARCHAR(50) NULL;
UPDATE tenant_settings SET plan_type = CASE WHEN plan_enabled = 1 THEN 'PRO' ELSE 'BASIC' END WHERE plan_type IS NULL;
