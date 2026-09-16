output "load_balancer_ip" {
  value       = google_compute_global_address.lb.address
  description = "IP del Load Balancer. Crear un registro A en DonWeb (dominio -> esta IP). NO cambiar nameservers."
}

output "api_service_url" {
  value       = google_cloud_run_v2_service.api.uri
  description = "URL directa del servicio Cloud Run (para pruebas; el tráfico real va por el LB)."
}

output "sql_connection_name" {
  value       = google_sql_database_instance.main.connection_name
  description = "Connection name de Cloud SQL (project:region:instance)."
}

output "artifact_registry_repo" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.backend.repository_id}"
  description = "Ruta base del Artifact Registry para las imágenes."
}

output "frontend_bucket" {
  value       = google_storage_bucket.frontend.name
  description = "Bucket del frontend (subir el build del SPA acá)."
}

# ─── Valores para configurar el pipeline (GitHub → Settings → Variables) ──
output "cicd_service_account" {
  value       = google_service_account.cicd.email
  description = "vars.CICD_SERVICE_ACCOUNT"
}

output "wif_provider" {
  value       = google_iam_workload_identity_pool_provider.github.name
  description = "vars.WIF_PROVIDER (nombre completo del provider de WIF)"
}

output "migrate_job_name" {
  value       = google_cloud_run_v2_job.migrate.name
  description = "Job de migraciones a ejecutar en cada release."
}
