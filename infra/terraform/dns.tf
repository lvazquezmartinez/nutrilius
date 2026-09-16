# Cloud DNS: zona administrada del dominio. El dominio sigue REGISTRADO en DonWeb,
# pero el DNS se sirve desde Cloud DNS. En DonWeb hay que cambiar los nameservers
# (los awsdns viejos, ya muertos) por los de esta zona (output `dns_name_servers`).

resource "google_project_service" "dns" {
  service            = "dns.googleapis.com"
  disable_on_destroy = false
}

resource "google_dns_managed_zone" "main" {
  name        = "${var.app_name}-zone"
  dns_name    = "${var.domain}."
  description = "Zona DNS de Nutrilius (${var.domain})"

  depends_on = [google_project_service.dns]
}

# Registro A del dominio raíz → IP del Load Balancer.
resource "google_dns_record_set" "root" {
  name         = google_dns_managed_zone.main.dns_name
  managed_zone = google_dns_managed_zone.main.name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.lb.address]
}
