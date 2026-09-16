# Cloud DNS: zona administrada para el dominio. El registro sigue en DonWeb; solo se
# delega el DNS a Google cambiando los nameservers en DonWeb por los de esta zona
# (ver output `dns_name_servers`). Cloud Domains NO soporta .com.ar, por eso se usa
# Cloud DNS + registrar externo.

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

# Registro A del dominio raíz apuntando a la IP del Load Balancer.
resource "google_dns_record_set" "root" {
  name         = google_dns_managed_zone.main.dns_name
  managed_zone = google_dns_managed_zone.main.name
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.lb.address]
}
