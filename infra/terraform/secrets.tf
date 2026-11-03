# Contenedores de secretos en Secret Manager (DS-07). Los VALORES se cargan aparte
# (CLI/consola), nunca en Terraform ni en el state — salvo la password de DB, que se
# genera acá y se guarda en Secret Manager (queda en el state, que vive en el bucket
# privado del backend de Terraform).

locals {
  # Secretos cuyos valores carga el operador manualmente después del apply.
  manual_secret_ids = [
    "django-secret-key",
    "ai-api-key",
    "smtp-user",
    "smtp-password",
    "google-oauth-client-id",
    "field-encryption-keys", # HU-22: clave(s) Fernet de cifrado en reposo
  ]
}

resource "google_secret_manager_secret" "manual" {
  for_each  = toset(local.manual_secret_ids)
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

# Password de la base de datos: generada y almacenada en Secret Manager.
resource "random_password" "db" {
  length  = 32
  special = false
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db.result
}
