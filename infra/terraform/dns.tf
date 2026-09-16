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

# ─── Correo (envialosimple): SPF, DKIM, Return-Path, DMARC, verificación ──

# SPF (TXT en el apex; convive con el registro A).
resource "google_dns_record_set" "spf" {
  name         = "${var.domain}."
  managed_zone = google_dns_managed_zone.main.name
  type         = "TXT"
  ttl          = 3600
  rrdatas      = ["\"v=spf1 include:envialotrs.hostmar.com -all\""]
}

# DKIM (CNAME).
resource "google_dns_record_set" "dkim" {
  name         = "estr._domainkey.${var.domain}."
  managed_zone = google_dns_managed_zone.main.name
  type         = "CNAME"
  ttl          = 3600
  rrdatas      = ["dkim.envialosimple.email."]
}

# Return-Path / MTA (CNAME).
resource "google_dns_record_set" "return_path" {
  name         = "mta.${var.domain}."
  managed_zone = google_dns_managed_zone.main.name
  type         = "CNAME"
  ttl          = 3600
  rrdatas      = ["mta.envialosimple.email."]
}

# DMARC (TXT).
resource "google_dns_record_set" "dmarc" {
  name         = "_dmarc.${var.domain}."
  managed_zone = google_dns_managed_zone.main.name
  type         = "TXT"
  ttl          = 3600
  rrdatas      = ["\"v=DMARC1; p=none\""]
}

# Verificación del dominio en envialosimple (TXT challenge).
# OJO: confirmar que el valor esté completo (el screenshot puede recortarlo).
resource "google_dns_record_set" "email_challenge" {
  name         = "_estr-challenge.${var.domain}."
  managed_zone = google_dns_managed_zone.main.name
  type         = "TXT"
  ttl          = 3600
  rrdatas      = ["\"${var.email_dns_challenge}\""]
}
