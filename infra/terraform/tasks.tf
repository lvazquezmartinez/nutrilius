# Cola de Cloud Tasks para trabajo diferido (mails, PDFs, generación IA).
resource "google_cloud_tasks_queue" "default" {
  name     = "${var.app_name}-tasks"
  location = var.region

  retry_config {
    max_attempts = 5
  }

  depends_on = [google_project_service.enabled]
}

# Service account que Cloud Tasks usa para invocar el endpoint interno de la API
# con un token OIDC (la API valida ese token en el endpoint de tareas).
resource "google_service_account" "tasks" {
  account_id   = "${var.app_name}-tasks"
  display_name = "Nutrilius Cloud Tasks invoker"
}

resource "google_cloud_run_v2_service_iam_member" "tasks_invoker" {
  name     = google_cloud_run_v2_service.api.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.tasks.email}"
}
