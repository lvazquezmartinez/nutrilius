resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-pg"
  database_version = "POSTGRES_16"
  region           = var.region

  # Prototipo: sin protección de borrado para poder recrear. Subir a true en real.
  deletion_protection = false

  settings {
    tier              = var.sql_tier
    edition           = "ENTERPRISE" # los tiers shared-core (db-f1-micro) son de esta edición
    availability_type = "ZONAL"
    disk_autoresize   = true

    # Backups y recuperación a un momento determinado (HU-25 / RNF-17).
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00" # 03:00 (hora de la región)
      point_in_time_recovery_enabled = true    # PITR
      transaction_log_retention_days = 7        # recuperación puntual de los últimos 7 días
      backup_retention_settings {
        retained_backups = 30 # 30 copias
        retention_unit   = "COUNT"
      }
    }

    ip_configuration {
      # IP pública; Cloud Run se conecta por el conector de Cloud SQL (socket).
      ipv4_enabled = true
    }
  }

  depends_on = [google_project_service.enabled]
}

resource "google_sql_database" "app" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = random_password.db.result
}
