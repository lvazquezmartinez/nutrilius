# Infra — Terraform (GCP serverless)

Aprovisiona la arquitectura de `INFRAESTRUCTURA.md`: Cloud Run (API), Cloud SQL,
GCS + HTTPS LB + Cloud CDN (front), Cloud Tasks, Secret Manager, Cloud DNS y el
CI/CD sin llaves (Workload Identity Federation).

## Requisitos previos (una vez)

```bash
gcloud auth application-default login
gcloud config set project <PROJECT_ID>
# Bucket para el state de Terraform (privado):
gcloud storage buckets create gs://<PROJECT_ID>-tfstate --location=southamerica-east1
```

## Aplicar

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # completar valores
terraform init -backend-config="bucket=<PROJECT_ID>-tfstate"
terraform apply
```

## Después del apply

1. **Cargar los valores de los secretos** (no van en Terraform):

```bash
printf '%s' "<valor>" | gcloud secrets versions add django-secret-key --data-file=-
printf '%s' "<valor>" | gcloud secrets versions add ai-api-key --data-file=-
printf '%s' "<valor>" | gcloud secrets versions add smtp-user --data-file=-
printf '%s' "<valor>" | gcloud secrets versions add smtp-password --data-file=-
```

2. **DNS**: cambiar en DonWeb los nameservers del dominio por los de la salida
   `dns_name_servers` (delegación a Cloud DNS). El registro A ya apunta al LB.
   > Cloud Domains no soporta `.com.ar`; por eso el registro sigue en DonWeb y solo
   > se delega el DNS a Cloud DNS.

3. **GitHub → Settings → Secrets and variables → Actions → Variables** (no son
   secretas): cargar con las salidas de Terraform:

   | Variable | Valor (output) |
   |---|---|
   | `GCP_PROJECT_ID` | project_id |
   | `GCP_REGION` | region |
   | `AR_REPO` | `nutrilius-backend` |
   | `RUN_SERVICE` | `nutrilius-api` |
   | `MIGRATE_JOB` | `migrate_job_name` |
   | `WIF_PROVIDER` | `wif_provider` |
   | `CICD_SERVICE_ACCOUNT` | `cicd_service_account` |

A partir de ahí, cada push a `main` corre tests → build → push a Artifact Registry →
migraciones → deploy a Cloud Run.

## Notas

- El certificado SSL administrado queda *pending* hasta que el DNS resuelva al LB.
- `terraform apply` crea la infra; la **imagen** real la publica el pipeline (hasta
  entonces Cloud Run corre un placeholder).
- El state (con la password de DB generada) vive en el bucket privado de GCS: no se
  versiona en git.
