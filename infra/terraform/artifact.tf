resource "google_artifact_registry_repository" "backend" {
  location      = var.region
  repository_id = "${var.app_name}-backend"
  format        = "DOCKER"
  description   = "Imágenes del backend Django de Nutrilius"

  depends_on = [google_project_service.enabled]
}
