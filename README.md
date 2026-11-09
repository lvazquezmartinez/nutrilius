# Nutrilius

**Sistema de gestión clínico-nutricional multi-consultorio con asistencia de IA
supervisada para planes alimentarios.**
Trabajo Final de Grado — Ingeniería en Software, Universidad Siglo 21
(modalidad Prototipado Tecnológico).

- **Repositorio:** https://github.com/lvazquezmartinez/nutrilius

---

## Qué hace

Gestión de pacientes, anamnesis, métricas y evoluciones (con gráfico de tendencia),
agenda de turnos y reserva pública por enlace, y el **diferencial** del trabajo:
**generación de planes alimentarios con IA supervisada**.

El plan nunca lo decide la IA sola. El flujo es:

1. **Motor de reglas** — calcula el requerimiento energético y los macronutrientes del
   paciente (fórmula de Mifflin-St Jeor + objetivos + restricciones duras por
   patologías/alergias).
2. **IA acotada** — propone el menú **dentro** de esos límites, localizado a Argentina y
   a las Guías Alimentarias para la Población Argentina (GAPA).
3. **Validador** — recalcula calorías/macros y controla los mínimos de las guías; marca si
   el plan requiere revisión.
4. **Aprobación profesional obligatoria** — el plan recorre los estados
   `Borrador IA → En revisión → Aprobado → Compartido`, y **ningún plan llega al paciente
   sin la aprobación del nutricionista**.

Incluye además: PDF del plan con marca del consultorio, compartición por enlace revocable,
auditoría de accesos a datos clínicos, cifrado en reposo de datos sensibles y
seudonimización de los datos antes de enviarlos a la IA.

---

## Stack

- **Backend:** Python 3.12 · Django 5 · Django REST Framework · PostgreSQL
- **Frontend:** React + TypeScript + Vite
- **Infraestructura:** Google Cloud (Cloud Run, Cloud SQL, Cloud Storage, Secret Manager,
  Load Balancer + Cloud CDN) con **Terraform** y **GitHub Actions** (CI/CD)
- **IA:** OpenAI (proveedor y modelo configurables), con un proveedor *fake* determinista
  para tests y demo sin consumir la API real

---

## Cómo levantarlo en local

**Única dependencia: Docker + Docker Compose.** No hace falta instalar Python ni Node:
el compose levanta la base de datos, el backend (que corre las migraciones solo),
el worker, el frontend y un nginx.

```bash
# 1) Clonar el repositorio
git clone https://github.com/lvazquezmartinez/nutrilius.git
cd nutrilius

# 2) Variables de entorno (copiar los ejemplos; valores por defecto sirven para local)
cp .env.example .env
cp backend/.env.example backend/.env

# 3) Levantar todo
docker compose up -d --build

# 4) Cargar la cuenta de demostración con datos ficticios
docker compose run --rm backend python manage.py seed_demo
```

Una vez arriba:

| Servicio        | URL                      |
|-----------------|--------------------------|
| Frontend (app)  | http://localhost:3000    |
| API (backend)   | http://localhost:8000    |

Ingresá con **`demo@nutrilius.com.ar`** / **`NutriliusDemo2026`** (usuario de demostración
que crea el `seed_demo`, con datos ficticios).

### Variables de entorno

Hay dos archivos (copiados de sus `.example` en el paso 2):

- **`.env`** (raíz) — credenciales de los servicios que levanta Docker (PostgreSQL, Redis,
  RabbitMQ, MinIO). Son **internos**; los valores de ejemplo sirven tal cual para local.
- **`backend/.env`** — configuración de la aplicación Django.

**No hace falta ninguna cuenta ni servicio externo para correrlo en local:** la base de
datos, la cache, la cola y el almacenamiento de archivos corren todos dentro de Docker.
Los únicos servicios **externos** son **opcionales**:

| Variable(s) | Para qué | ¿Externo? | ¿Obligatorio en local? |
|---|---|---|---|
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` | Generación de planes con IA real (OpenAI u OpenRouter) | Sí | **No** — sin clave real se usa un proveedor *fake* determinista |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Envío de emails (verificación de cuenta, recordatorios de turno) | Sí | **No** — sin SMTP la app funciona igual; solo no se envían los emails |
| `DJANGO_SECRET_KEY` | Clave de firma de Django | No | Cualquier cadena larga sirve en local |
| `POSTGRES_*`, `REDIS_*`, `RABBITMQ_*`, `MINIO_*` / `S3_*` | Servicios base (Docker) | No | Los valores de ejemplo sirven |

**Para probar con IA real** (opcional): en `backend/.env` configurá el proveedor, tu clave
y el modelo, por ejemplo:

```
AI_PROVIDER=openai
AI_API_KEY=sk-...tu_clave_de_openai...
AI_MODEL=gpt-4o-mini
```

**Para correr sin IA real** (lo más rápido para probar): dejá `AI_API_KEY` vacío o poné
`AI_PROVIDER=FAKE`. El sistema usa un proveedor de IA **fake** determinista que permite
recorrer todo el flujo (generar → validar → aprobar) sin ninguna clave.

### Correr los tests

```bash
docker compose run --rm backend sh -c "pip install -r requirements-dev.txt && pytest"
```

### Apagar

```bash
docker compose down          # detener (conserva los datos)
docker compose down -v       # detener y borrar también la base de datos local
```

---

## Estructura del repositorio

```
backend/apps/*     Un módulo por bounded context (identity, tenants, clinical,
                   scheduling, plans, dashboard, audit, common)
frontend/src/*     Páginas, servicios y componentes (React)
infra/terraform/*  Infraestructura como código (GCP)
```

La documentación de diseño (requerimientos, módulos, modelo de datos, DER, diccionario de
datos, casos de uso y decisiones técnicas) forma parte de la **tesis** y no se versiona en
el repositorio.
