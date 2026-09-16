# Nutrilius — Backend (Django)

Reconstrucción desde cero en `Python 3.12 + Django 5 + DRF`. Un módulo = una Django
app bajo `apps/` (ver `../MODULOS.md`). Decisiones en `../DECISIONES_TECNICAS_Y_SEGURIDAD.md`.

## Estructura

```
backend/
  config/            # proyecto Django (settings split, urls, wsgi/asgi, celery)
    settings/        # base.py · dev.py · prod.py
  apps/
    common/          # base de tenancy (TenantOwnedModel), health checks
    # tenants, identity, clinical, ... (se agregan por fase)
  requirements.txt
  manage.py
  Dockerfile
```

## Desarrollo local (sin Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ajustar valores; POSTGRES_HOST=localhost si Postgres es local
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Health check: `GET http://localhost:8000/health/live`

## Con Docker Compose (desde la raíz del repo)

```bash
docker compose up --build backend
```

## Tests

Los tests (`pytest` + `pytest-django`) viven en `apps/<modulo>/tests/` y son parte
de cada fase. Settings de test: `config.settings.test` (hasher rápido, email en
memoria, cache local). Correr con Postgres arriba:

```bash
docker compose run --rm backend sh -c "pip install -r requirements-dev.txt && pytest"
```

## Fases

El plan por fases está en `../V1_PLAN.md`. Fase 0: scaffold (proyecto, settings, DB,
cache, Celery, storage, health checks). Fase 1: identidad + multi-tenant (hecha, con
tests). Cada módulo detalla su cobertura de tests en `../MODULOS.md`.
