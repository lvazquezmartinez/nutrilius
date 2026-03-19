ALTER TABLE users
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN verification_token VARCHAR(255) NULL,
  ADD COLUMN verification_expires DATETIME NULL;

UPDATE users SET email_verified = 1;
