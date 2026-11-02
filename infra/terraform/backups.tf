# HU-25 / RNF-17 — Exportación semanal de Cloud SQL a un bucket en otra región.
# Cloud Scheduler invoca la API de export de Cloud SQL todos los domingos a las 04:00.
# El versionado del bucket (storage.tf) conserva el historial; lifecycle borra a los 90 días.

# SA que ejecuta el export (necesita administrar exports de Cloud SQL).
resource "google_service_account" "sql_export" {
  account_id   = "${var.app_name}-sql-export"
  display_name = "Nutrilius Cloud SQL export (backups)"
}

resource "google_project_iam_member" "sql_export_admin" {
  project = var.project_id
  role    = "roles/cloudsql.editor"
  member  = "serviceAccount:${google_service_account.sql_export.email}"
}

resource "google_cloud_scheduler_job" "weekly_sql_export" {
  name        = "${var.app_name}-weekly-sql-export"
  region      = var.region
  description = "Exportación semanal de la base a otra región (HU-25)"
  schedule    = "0 4 * * 0" # domingos 04:00
  time_zone   = "America/Argentina/Buenos_Aires"

  http_target {
    http_method = "POST"
    uri         = "https://sqladmin.googleapis.com/v1/projects/${var.project_id}/instances/${google_sql_database_instance.main.name}/export"
    headers     = { "Content-Type" = "application/json" }
    body = base64encode(jsonencode({
      exportContext = {
        kind      = "sql#exportContext"
        fileType  = "SQL"
        uri       = "gs://${google_storage_bucket.backups.name}/weekly/${var.db_name}.sql.gz"
        databases = [var.db_name]
      }
    }))
    oauth_token {
      service_account_email = google_service_account.sql_export.email
    }
  }

  depends_on = [google_project_service.enabled]
}
