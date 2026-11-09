# Nutrilius

Prototipo de **sistema de gestión clínico-nutricional multi-consultorio** con **asistencia
de IA supervisada** para planes alimentarios. Trabajo Final de Grado — Ingeniería en
Software, Universidad Siglo 21 (modalidad Prototipado Tecnológico).

- **Demo en vivo:** https://nutrilius.com.ar
  - Usuario: `demo@nutrilius.com.ar` · Contraseña: `NutriliusDemo2026`
  - Datos **ficticios** (cuenta de demostración). No hay datos de pacientes reales.
- **Repositorio:** https://github.com/lvazquezmartinez/nutrilius

## Qué hace

Gestión de pacientes, anamnesis, métricas y evoluciones (con gráfico de tendencia),
agenda de turnos, y el diferencial: **generación de planes alimentarios con IA
supervisada** — un motor de reglas calcula requerimiento energético y macros, la IA
propone el menú **dentro** de esos límites (localizado a Argentina y a las Guías
Alimentarias), un validador controla el resultado, y **ningún plan llega al paciente sin
la aprobación del profesional**. Incluye PDF del plan, compartición por enlace, reserva de
turnos pública, auditoría de accesos, cifrado en reposo de datos clínicos y backups.

## Stack

- **Backend:** Python 3.12 · Django 5 · Django REST Framework · PostgreSQL
- **Frontend:** React + TypeScript + Vite
- **Infra:** Google Cloud (Cloud Run, Cloud SQL, Cloud Storage, Secret Manager, Load
  Balancer + CDN) con **Terraform** y **GitHub Actions** (CI/CD)
- **IA:** OpenAI (configurable), con proveedor *fake* determinista para tests/demo

## Correr en local

Requisitos: **Docker** + Docker Compose y **Node 20+**.

```bash
# 1) Backend + base de datos
cd backend
cp .env.example .env          # completar variables (ver backend/.env.example)
docker compose up -d          # API en http://localhost:8000
docker compose run --rm backend python manage.py migrate
docker compose run --rm backend python manage.py seed_demo   # datos de demo ficticios
```

```bash
# 2) Frontend (en otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

Entrá con `demo@nutrilius.com.ar` / `NutriliusDemo2026`.

> Sin `AI_API_KEY`, el sistema usa un proveedor de IA **fake** (determinista) — permite
> probar todo el flujo sin una clave de OpenAI.

### Tests

```bash
cd backend
docker compose run --rm backend sh -c "pip install -r requirements-dev.txt && pytest"
```

## Desplegar

Infraestructura como código en **`infra/terraform/`** (GCP: Cloud Run, Cloud SQL, Cloud
Storage + CDN, Secret Manager) y pipeline de **CI/CD** en `.github/workflows/ci-cd.yml`
(build + deploy de backend y frontend). Ver **[infra/terraform/README.md](infra/terraform/README.md)**.

## Estructura

```
backend/apps/*     Un módulo por bounded context (identity, tenants, clinical,
                   scheduling, plans, dashboard, audit, common)
frontend/src/*     Páginas, servicios y componentes (React)
infra/terraform/*  Infraestructura como código (GCP)
```

> La documentación de diseño (requerimientos, módulos, modelo de datos, DER, diccionario
> de datos, casos de uso y decisiones técnicas) forma parte de la **tesis** y no se
> versiona en el repositorio.

## Licencia

Proyecto académico (TFG). Uso educativo.
