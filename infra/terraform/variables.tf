variable "project_id" {
  type        = string
  description = "ID del proyecto de GCP"
}

variable "region" {
  type        = string
  default     = "southamerica-east1"
  description = "Región (São Paulo por cercanía a Argentina)"
}

variable "app_name" {
  type    = string
  default = "nutrilius"
}

variable "backup_region" {
  type        = string
  default     = "southamerica-west1"
  description = "Región distinta para los backups cross-region (HU-25)"
}

variable "domain" {
  type        = string
  description = "Dominio del Load Balancer (certificado SSL administrado). Ej: nutrilius.com.ar"
}

variable "image" {
  type        = string
  default     = ""
  description = "Imagen del backend. Vacío = placeholder; el pipeline la actualiza en cada deploy."
}

variable "sql_tier" {
  type        = string
  default     = "db-f1-micro"
  description = "Tamaño de la instancia de Cloud SQL"
}

variable "db_name" {
  type    = string
  default = "nutrilius"
}

variable "db_user" {
  type    = string
  default = "nutrilius_user"
}

variable "run_min_instances" {
  type    = number
  default = 0
}

variable "run_max_instances" {
  type    = number
  default = 4
}

variable "github_repo" {
  type        = string
  default     = "lvazquezmartinez/nutrilius"
  description = "owner/repo autorizado para desplegar vía Workload Identity Federation"
}

variable "email_dns_challenge" {
  type        = string
  description = "Valor del TXT _estr-challenge (verificación de dominio en envialosimple)"
}
