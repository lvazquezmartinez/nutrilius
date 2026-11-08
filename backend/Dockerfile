# ─── Nutrilius backend (Django) ──────────────────────────
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias del sistema (psycopg 3 binario no requiere build, pero dejamos lo mínimo)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Producción: gunicorn. En dev, docker-compose sobreescribe con runserver.
# --timeout 180: la generación con IA (una llamada al LLM por el plan semanal) produce
# miles de tokens y puede tardar ~1-2 min; sin esto el worker se mata y devuelve 500.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", \
     "--workers", "3", "--timeout", "180"]
