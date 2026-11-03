# Nutrilius — Instructivo

SaaS multi-consultorio para nutricionistas (TFG). **Django + DRF + PostgreSQL** (backend),
**React + Vite** (frontend), desplegado en **Google Cloud** (Cloud Run, Cloud SQL, Cloud
Storage, Secret Manager) con **Terraform** y **GitHub Actions**. Núcleo: generación de
planes alimentarios con **IA supervisada** (motor de reglas → IA → validación → aprobación
profesional).

> **Datos:** solo ficticios. No se cargan datos de pacientes reales en ningún entorno.

## Demo desplegada
- **URL:** https://nutrilius.com.ar
- **Usuario:** `demo@nutrilius.com.ar`
- **Contraseña:** `NutriliusDemo2026`

(Reservas públicas de turno: el enlace está en *Configuración → Enlace público de reservas*.)

## Requisitos
- **Docker** + Docker Compose (backend y base en local).
- **Node 20+** y npm (frontend).
- Para desplegar: **gcloud CLI**, **Terraform 1.13+**, y permisos en el proyecto GCP.

## Correr en local

### Backend + base (Docker)
```bash
cd backend
cp .env.example .env          # completar variables (ver abajo)
docker compose up -d          # Postgres + API en http://localhost:8000
docker compose run --rm backend python manage.py migrate
docker compose run --rm backend python manage.py seed_demo   # datos de demo
```

### Frontend
```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```
El dev server proxya `/api` al backend. Si tu backend corre en otro puerto, ajustá
`server.proxy['/api'].target` en `frontend/vite.config.ts` (por defecto `localhost:8000`
con `VITE_API_URL`).

### Tests
```bash
cd backend
docker compose run --rm backend sh -c "pip install -r requirements-dev.txt && pytest"
```

## Variables de entorno (backend)
No se commitean (van en `.env` local / Secret Manager en prod):
- `DJANGO_SECRET_KEY`, `POSTGRES_*`
- `AI_PROVIDER` (`openai`), `AI_MODEL` (`gpt-4o-mini`), `AI_API_KEY` (key de OpenAI)
- `FIELD_ENCRYPTION_KEYS` (clave Fernet para cifrado en reposo; generar con
  `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)
- `GOOGLE_OAUTH_CLIENT_ID`, `SMTP_*`

Sin `AI_API_KEY`, el sistema usa un proveedor **fake** (determinista) — útil para tests y demo.

## Desplegar

### Infraestructura (Terraform)
```bash
cd infra/terraform
terraform init
terraform apply
```
Crea/actualiza Cloud Run, Cloud SQL (con backups + PITR), buckets (frontend, media,
backups cross-region), Secret Manager, Load Balancer + CDN, Cloud Tasks, WIF y el job
semanal de export. Los **valores** de los secretos se cargan aparte:
```bash
printf '%s' "$VALOR" | gcloud secrets versions add <secret-id> --data-file=-
```

### Backend (CI/CD)
Hacer push a `main`: el pipeline (`.github/workflows/ci-cd.yml`) corre los tests, construye
la imagen, aplica migraciones (job de Cloud Run) y despliega a Cloud Run **solo si pasan**.

### Frontend
```bash
cd frontend && npm run build
gcloud storage rsync dist gs://<project>-<app>-frontend --recursive --delete-unmatched-destination-objects
gcloud compute url-maps invalidate-cdn-cache <app>-urlmap --path="/*"
```

### Datos de demo en producción
Ejecutar el comando `seed_demo` con la imagen desplegada (idempotente), por ejemplo
reusando el job de migraciones con los args de `seed_demo`.

## Estructura
- `backend/apps/*` — un módulo por bounded context (identity, tenants, clinical,
  scheduling, plans, dashboard, audit, common).
- `frontend/src/*` — páginas, servicios y componentes.
- `infra/terraform/*` — infraestructura como código.
- Documentos: `REQUERIMIENTOS.md`, `MODULOS.md`, `MODELO_DATOS.md`,
  `DECISIONES_TECNICAS_Y_SEGURIDAD.md`, `ARQUITECTURA.md`, `DICCIONARIO_DATOS.md`.
