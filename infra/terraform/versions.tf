terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # State remoto en GCS. El bucket se pasa en el init:
  #   terraform init -backend-config="bucket=<TU_BUCKET_DE_STATE>"
  backend "gcs" {
    prefix = "nutrilius/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
