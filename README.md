# Nutrilius MVP

Sistema multi-tenant para nutricionistas con React + Spring Boot + MySQL.

## Roles
- SUPER_ADMIN: ve todos los negocios (tenants) y uso.
- ADMIN: dashboard + gestiona obras sociales, pacientes y datos.
- USER: puede crear pacientes y cargar anamnesis/visitas/pagos.

## Levantar con Docker
```bash
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:8080

## Usuarios seed (por defecto)
- Super admin: `super@nutrilius.local` / `super123`
- Admin demo: `admin@demo.local` / `admin123`
- User demo: `user@demo.local` / `user123`

## Endpoints base
- `POST /auth/login`
- `GET /dashboard` (ADMIN)
- `GET /super/tenants` (SUPER_ADMIN)
- `POST /patients` (ADMIN/USER)
- `POST /patients/{id}/anamneses`
- `POST /patients/{id}/visits`
- `POST /patients/{id}/payments`
- `GET /insurances` (ADMIN/USER)
- `POST /insurances` (ADMIN)
