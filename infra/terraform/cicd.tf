# CI/CD sin llaves: GitHub Actions se autentica por Workload Identity Federation
# (OIDC), sin service-account keys. Solo el repo autorizado puede impersonar la SA.

data "google_project" "current" {}

resource "google_service_account" "cicd" {
  account_id   = "${var.app_name}-cicd"
  display_name = "Nutrilius CI/CD (GitHub Actions)"
}

resource "google_project_iam_member" "cicd_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

resource "google_project_iam_member" "cicd_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# Para desplegar/ejecutar en Cloud Run debe poder "actuar como" la SA de runtime.
resource "google_service_account_iam_member" "cicd_act_as_run" {
  service_account_id = google_service_account.run.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cicd.email}"
}

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "${var.app_name}-gh-pool"
  display_name              = "GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
  }

  # Solo tokens del repo autorizado.
  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# El repo puede impersonar la SA de CI/CD.
resource "google_service_account_iam_member" "cicd_wif" {
  service_account_id = google_service_account.cicd.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}
