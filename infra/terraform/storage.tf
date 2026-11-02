# Bucket del frontend (SPA estático). Público de solo lectura para servirlo por CDN.
resource "google_storage_bucket" "frontend" {
  name                        = "${var.project_id}-${var.app_name}-frontend"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html" # SPA: rutas client-side caen a index.html
  }
}

resource "google_storage_bucket_iam_member" "frontend_public" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Bucket de media (logos, PDFs). Privado: se sirve con URLs firmadas (RNF-05 / DS-02).
# Versionado para conservar versiones de logos y PDFs (HU-25).
resource "google_storage_bucket" "media" {
  name                        = "${var.project_id}-${var.app_name}-media"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }
}

# Bucket de backups en OTRA región (HU-25 / RNF-17): destino de la exportación
# semanal de Cloud SQL, con versionado y retención de 90 días.
resource "google_storage_bucket" "backups" {
  name                        = "${var.project_id}-${var.app_name}-backups"
  location                    = var.backup_region
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90 # 90 días de retención
    }
    action {
      type = "Delete"
    }
  }
}

# La cuenta de servicio de Cloud SQL puede escribir en el bucket de backups
# (para la exportación programada a otra región).
resource "google_storage_bucket_iam_member" "sql_backup_writer" {
  bucket = google_storage_bucket.backups.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_sql_database_instance.main.service_account_email_address}"
}
