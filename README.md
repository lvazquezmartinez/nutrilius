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

Única dependencia: **Docker** + Docker Compose. El `docker-compose.yml` (en la raíz)
levanta todo: PostgreSQL, Redis, RabbitMQ, MinIO, el backend (que corre las migraciones
solo), el worker, el frontend y nginx. No hace falta instalar Python ni Node.

```bash
# 1) Variables de entorno (los valores de ejemplo sirven para local)
cp .env.example .env
cp backend/.env.example backend/.env

# 2) Levantar todo
docker compose up -d --build

# 3) Cargar la cuenta de demostración con datos ficticios
docker compose run --rm backend python manage.py seed_demo
```

| Servicio       | URL                   |
|----------------|-----------------------|
| Frontend (app) | http://localhost:3000 |
| API (backend)  | http://localhost:8000 |

Entrá con `demo@nutrilius.com.ar` / `NutriliusDemo2026`.

### Variables de entorno

Los valores de `.env.example` sirven tal cual para local: todos los servicios base
(PostgreSQL, Redis, RabbitMQ, MinIO) corren **dentro de Docker**, no necesitás ninguna
cuenta externa. Los únicos servicios **externos son opcionales**:

| Variable(s) | Para qué | ¿Obligatorio en local? |
|---|---|---|
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` | Generación con IA real (OpenAI / OpenRouter) | **No** — sin clave real se usa el proveedor *fake* determinista |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envío de emails (verificación, recordatorios) | **No** — sin SMTP la app anda; solo no envía emails |
| `DJANGO_SECRET_KEY` | Clave de firma de Django | Cualquier cadena larga sirve en local |

- **Con IA real** (opcional): en `backend/.env` → `AI_PROVIDER=openai`, `AI_API_KEY=sk-...`, `AI_MODEL=gpt-4o-mini`.
- **Sin IA real** (más rápido para probar): dejá `AI_API_KEY` vacío o poné `AI_PROVIDER=FAKE`.
  El proveedor *fake* recorre todo el flujo (generar → validar → aprobar) sin ninguna clave.

### Tests

```bash
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
