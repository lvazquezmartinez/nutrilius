locals {
  gcp_services = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudtasks.googleapis.com",
    "secretmanager.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "cloudscheduler.googleapis.com", # HU-25: exportación semanal programada
  ]
}

resource "google_project_service" "enabled" {
  for_each           = toset(local.gcp_services)
  service            = each.value
  disable_on_destroy = false
}
