resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-pg"
  database_version = "POSTGRES_16"
  region           = var.region

  # Prototipo: sin protección de borrado para poder recrear. Subir a true en real.
  deletion_protection = false

  settings {
    tier              = var.sql_tier
    availability_type = "ZONAL"
    disk_autoresize   = true

    backup_configuration {
      enabled = true
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
