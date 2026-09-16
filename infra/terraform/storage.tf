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
resource "google_storage_bucket" "media" {
  name                        = "${var.project_id}-${var.app_name}-media"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = false
}
