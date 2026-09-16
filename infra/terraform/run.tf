locals {
  image = var.image != "" ? var.image : "us-docker.pkg.dev/cloudrun/container/hello"

  # Config no sensible que recibe el contenedor.
  run_env = {
    DJANGO_SETTINGS_MODULE = "config.settings.prod"
    ALLOWED_HOSTS          = var.domain
    CORS_ALLOWED_ORIGINS   = "https://${var.domain}"
    APP_FRONTEND_URL       = "https://${var.domain}"
    APP_BACKEND_URL        = "https://${var.domain}"
    GS_BUCKET_NAME         = google_storage_bucket.media.name
    POSTGRES_HOST          = "/cloudsql/${google_sql_database_instance.main.connection_name}"
    POSTGRES_DB            = var.db_name
    POSTGRES_USER          = var.db_user
    GCP_PROJECT_ID         = var.project_id
    GCP_REGION             = var.region
    GCP_TASKS_QUEUE        = google_cloud_tasks_queue.default.name
  }

  # Secretos: nombre de la env var => secret_id en Secret Manager.
  run_secret_env = {
    POSTGRES_PASSWORD = google_secret_manager_secret.db_password.secret_id
    DJANGO_SECRET_KEY = "django-secret-key"
    AI_API_KEY        = "ai-api-key"
    SMTP_USER         = "smtp-user"
    SMTP_PASSWORD     = "smtp-password"
  }

  all_secret_ids = concat(local.manual_secret_ids, ["db-password"])
}

# ─── Service account de runtime ──────────────────────────
resource "google_service_account" "run" {
  account_id   = "${var.app_name}-run"
  display_name = "Nutrilius Cloud Run runtime"
}

resource "google_secret_manager_secret_iam_member" "run_secret_access" {
  for_each  = toset(local.all_secret_ids)
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"

  depends_on = [
    google_secret_manager_secret.manual,
    google_secret_manager_secret.db_password,
  ]
}

resource "google_project_iam_member" "run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.run.email}"
}

resource "google_project_iam_member" "run_tasks_enqueuer" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.run.email}"
}

resource "google_storage_bucket_iam_member" "run_media" {
  bucket = google_storage_bucket.media.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.run.email}"
}

# ─── Servicio API (Cloud Run) ────────────────────────────
resource "google_cloud_run_v2_service" "api" {
  name                = "${var.app_name}-api"
  location            = var.region
  deletion_protection = false

  template {
    service_account = google_service_account.run.email

    scaling {
      min_instance_count = var.run_min_instances
      max_instance_count = var.run_max_instances
    }

    containers {
      image = local.image
      ports {
        container_port = 8000
      }

      dynamic "env" {
        for_each = local.run_env
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = local.run_secret_env
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.main.connection_name]
      }
    }
  }

  depends_on = [google_project_service.enabled]
}

# La API se publica detrás del Load Balancer; el invoker es público y la auth la
# hace la app (JWT). El endpoint interno de Cloud Tasks valida OIDC a nivel app.
resource "google_cloud_run_v2_service_iam_member" "api_public" {
  name     = google_cloud_run_v2_service.api.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─── Job de migraciones (release step) ───────────────────
resource "google_cloud_run_v2_job" "migrate" {
  name                = "${var.app_name}-migrate"
  location            = var.region
  deletion_protection = false

  template {
    template {
      service_account = google_service_account.run.email
      max_retries     = 1

      containers {
        image   = local.image
        command = ["python", "manage.py", "migrate", "--noinput"]

        dynamic "env" {
          for_each = local.run_env
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = local.run_secret_env
          content {
            name = env.key
            value_source {
              secret_key_ref {
                secret  = env.value
                version = "latest"
              }
            }
          }
        }

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      volumes {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [google_sql_database_instance.main.connection_name]
        }
      }
    }
  }

  depends_on = [google_project_service.enabled]
}
