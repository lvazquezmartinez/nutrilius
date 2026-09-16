# HTTPS Load Balancer global: "/" → bucket del frontend (con Cloud CDN),
# "/api/*" → Cloud Run (API). Certificado SSL administrado por Google.

resource "google_compute_global_address" "lb" {
  name = "${var.app_name}-lb-ip"
}

# Serverless NEG hacia Cloud Run
resource "google_compute_region_network_endpoint_group" "api" {
  name                  = "${var.app_name}-api-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.api.name
  }
}

resource "google_compute_backend_service" "api" {
  name                  = "${var.app_name}-api-backend"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.api.id
  }
}

# Backend bucket del frontend con Cloud CDN
resource "google_compute_backend_bucket" "frontend" {
  name        = "${var.app_name}-frontend-backend"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = true
}

resource "google_compute_url_map" "main" {
  name            = "${var.app_name}-urlmap"
  default_service = google_compute_backend_bucket.frontend.id

  host_rule {
    hosts        = [var.domain]
    path_matcher = "main"
  }

  path_matcher {
    name            = "main"
    default_service = google_compute_backend_bucket.frontend.id

    path_rule {
      paths   = ["/api", "/api/*"]
      service = google_compute_backend_service.api.id
    }
  }
}

resource "google_compute_managed_ssl_certificate" "main" {
  name = "${var.app_name}-cert"

  managed {
    domains = [var.domain]
  }
}

resource "google_compute_target_https_proxy" "main" {
  name             = "${var.app_name}-https-proxy"
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main.id]
}

resource "google_compute_global_forwarding_rule" "https" {
  name                  = "${var.app_name}-https-fr"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_https_proxy.main.id
  ip_address            = google_compute_global_address.lb.address
  port_range            = "443"
}

# Redirección HTTP → HTTPS
resource "google_compute_url_map" "http_redirect" {
  name = "${var.app_name}-http-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "main" {
  name    = "${var.app_name}-http-proxy"
  url_map = google_compute_url_map.http_redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  name                  = "${var.app_name}-http-fr"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_http_proxy.main.id
  ip_address            = google_compute_global_address.lb.address
  port_range            = "80"
}
