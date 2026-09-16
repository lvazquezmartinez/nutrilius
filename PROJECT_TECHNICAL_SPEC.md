# Documentacion tecnica funcional de Nutrilius

## 1. Objetivo del documento

Este documento describe el producto actual desde una mirada funcional y de arquitectura de negocio, no de implementacion de codigo. La idea es que sirva como base para reconstruir Nutrilius en otro stack, con una arquitectura mejor preparada para multi-tenant, escalabilidad, auditoria e integraciones.

## 2. Resumen del producto

Nutrilius es un SaaS multi-tenant para nutricionistas y equipos de nutricion. Cada negocio opera como un tenant aislado, con sus propios usuarios, pacientes, configuraciones, turnos, planes alimenticios, pagos y formularios.

El sistema combina:

- gestion operativa del consultorio
- registro clinico del paciente
- seguimiento nutricional
- turnos y agenda
- gestion de cobros
- generacion de planes alimenticios
- onboarding self-service con registro y confirmacion por email
- portal publico para reservar turnos
- consola de super administracion para gestionar tenants

## 3. Actores del sistema

### 3.1 SUPER_ADMIN

Responsabilidades:

- administrar todos los tenants del sistema
- cambiar plan comercial del tenant
- activar o desactivar tenants
- consultar metricas globales
- resetear password del admin principal de un tenant
- monitorear operacion general

Restricciones:

- no pertenece funcionalmente a un tenant operativo
- accede a una consola transversal

### 3.2 ADMIN

Responsabilidades:

- configurar el tenant
- administrar usuarios internos del tenant
- gestionar pacientes
- registrar anamnesis, evoluciones, metricas, turnos y pagos
- generar y compartir planes alimenticios
- administrar plantillas
- revisar agenda y reservas

Restricciones:

- solo puede operar dentro de su tenant
- no puede acceder a datos de otros tenants

### 3.3 USER

Responsabilidades:

- operar sobre pacientes del tenant
- cargar anamnesis, evoluciones, metricas, visitas y pagos
- consultar configuraciones necesarias para operar
- generar y editar planes si el tenant lo permite

Restricciones:

- no administra tenant ni usuarios
- no puede modificar configuraciones sensibles

### 3.4 Paciente final

Interacciones:

- recibe mail de confirmacion si fue dado de alta como usuario, no como paciente
- recibe planes compartidos por link o PDF
- puede reservar turno desde el link publico del consultorio

### 3.5 Visitante publico

Interacciones:

- accede a la landing
- puede registrarse como nuevo tenant
- puede ingresar a login
- puede reservar turno desde un link publico del tenant

## 4. Modelo de negocio y planes

El sistema maneja un esquema de planes comerciales por tenant.

Planes actuales:

- `BASIC`
- `PRO`
- `PREMIUM`

Uso funcional actual:

- el modulo de plan alimenticio se habilita para tenants `PRO` y `PREMIUM`
- `BASIC` opera sin ese modulo o con funcionalidad restringida

Recomendacion para la reescritura:

- mover las restricciones de plan a una capa explicita de `feature flags por tenant`
- no acoplar la logica del producto a un enum fijo de plan
- permitir override manual por tenant para activaciones comerciales especiales

## 5. Modelo multi-tenant actual

### 5.1 Unidad de aislamiento

La unidad de aislamiento es el `tenant`.

Cada tenant tiene:

- identidad propia
- estado activo o inactivo
- fecha de alta
- fecha de baja logica
- configuracion propia
- usuarios propios
- pacientes propios
- datos clinicos propios
- agenda propia
- pagos propios
- templates propias

### 5.2 Datos dependientes de tenant

Dominios aislados por tenant:

- usuarios operativos
- pacientes
- anamnesis
- evoluciones
- metricas
- visitas
- pagos
- obras sociales
- configuracion
- plantillas de anamnesis
- planes alimenticios
- templates de planes
- booking publico

### 5.3 Riesgos del modelo actual

A nivel de producto, el sistema ya piensa en tenants. Para una nueva implementacion conviene endurecer el aislamiento con estas reglas:

- toda entidad de negocio debe incluir `tenant_id`
- todo query debe filtrar por tenant de forma obligatoria y centralizada
- toda accion administrativa debe auditar `quien`, `cuando`, `tenant`, `recurso`, `resultado`
- la desactivacion de tenant debe bloquear login, API y reservas publicas
- las tareas de background deben ejecutar por contexto de tenant

## 6. Modulos funcionales actuales

### 6.1 Landing publica

Objetivo:

- presentar el producto
- comunicar propuesta de valor
- derivar a login o registro

Funciones:

- acceso a landing institucional
- boton de `Login`
- boton de `Registrate`
- narrativa comercial de funcionalidades del sistema

### 6.2 Registro de tenant

Objetivo:

- permitir alta self-service de nuevos consultorios

Flujo:

1. el visitante completa nombre, negocio, email y password
2. el sistema crea un tenant nuevo
3. crea un usuario admin asociado a ese tenant
4. genera token de confirmacion de email
5. envia mail con link de validacion
6. hasta confirmar el email no puede iniciar sesion
7. al confirmar, se redirige al frontend con resultado de exito o fallo

Reglas:

- el mail debe ser unico
- la password tiene validacion minima
- el token de confirmacion vence
- si el token expira debe informarse como invalido o vencido

### 6.3 Autenticacion y acceso

Funciones:

- login con email y password
- persistencia de sesion via JWT
- logout desde frontend
- bloqueo de acceso si el usuario no confirmo email
- recuperacion de password por mail
- reseteo de password con token

Reglas:

- usuarios inactivos no deben poder autenticarse
- tenants inactivos no deben poder autenticarse
- cuando el entorno no esta en debug, el backend valida origen permitido

### 6.4 Confirmacion de email

Objetivo:

- validar propiedad del correo antes de habilitar el uso

Funciones:

- envio de mail de confirmacion al registrar cuenta
- link con token temporal
- validacion del token desde endpoint publico
- redireccion al login con estado de resultado
- mensaje visual en login indicando:
  - exito en verde
  - fallo o token vencido en rojo

### 6.5 Recuperacion de password

Funciones:

- solicitar reset por mail desde pantalla publica
- generar token temporal
- enviar link de recuperacion
- definir nueva password
- desde administracion interna tambien puede dispararse el envio de reset

Casos de uso:

- usuario final olvido su password
- admin necesita forzar recuperacion de un colaborador
- super admin necesita resetear admin de un tenant

### 6.6 Dashboard operativo

Objetivo:

- dar visibilidad rapida del estado del consultorio

Indicadores actuales:

- cantidad de pacientes
- cantidad de visitas
- total cobrado
- total pendiente
- total vencido
- proximas visitas

Observacion:

- el dashboard actual mezcla metricas financieras y operativas
- en una reescritura conviene separarlo en widgets configurables por rol

### 6.7 Gestion de pacientes

Objetivo:

- centralizar la ficha del paciente y su seguimiento

Funciones actuales:

- alta de paciente
- listado de pacientes
- busqueda
- visualizacion de detalle
- edicion
- baja logica
- reactivacion
- marca de paciente nuevo

Campos funcionales relevantes:

- nombre completo
- DNI y datos identificatorios
- sexo
- contacto
- datos clinicos base
- bandera `nuevo`
- bandera `activo`
- fecha de baja logica

Reglas:

- la baja es logica, no fisica
- el paciente deja de verse en la vista principal si esta inactivo
- sus pagos e historial deben seguir existiendo
- debe poder verse si un paciente esta dado de baja

### 6.8 Template de alta de paciente y anamnesis

Objetivo:

- permitir estandarizar la captura inicial de informacion

Funciones:

- template configurable de anamnesis por tenant
- consulta del template actual
- actualizacion del template
- reset a template por defecto
- carga de anamnesis por paciente
- consulta historica de anamnesis
- edicion de anamnesis existente

Uso real:

- el tenant puede adaptar el formulario a su metodologia clinica
- sirve como base para el primer contacto y para alimentar el plan nutricional

### 6.9 Evoluciones

Objetivo:

- registrar seguimiento clinico narrativo

Funciones:

- alta de evolucion
- listado de evoluciones por paciente

Uso:

- notas de seguimiento
- cambios de conducta
- respuesta al tratamiento
- observaciones cualitativas

### 6.10 Metricas antropometricas

Objetivo:

- registrar la evolucion fisica cuantitativa del paciente

Funciones:

- alta de metricas por paciente
- listado historico de metricas
- visualizacion para seguimiento temporal

Ejemplos funcionales:

- peso
- pliegues
- perimetros
- IMC u otras metricas derivadas

### 6.11 Visitas y agenda

Objetivo:

- organizar atencion, controles y turnos

Funciones actuales:

- registrar visita para paciente
- listar visitas por paciente
- gestionar `scheduled_at`
- manejar estado del turno
- ver calendario mensual
- crear reservas manuales desde calendario

Estados actuales de visita:

- `SCHEDULED`
- `CONFIRMED`
- `COMPLETED`
- `CANCELED`

Reglas y comportamiento:

- la visita puede existir vinculada a paciente conocido
- desde agenda se pueden ver los dias del mes y reservas cargadas
- el modelo ya contempla recordatorio enviado, aunque no necesariamente toda la automatizacion esta terminada

Gap actual:

- la integracion con Google Calendar todavia no es completa a nivel OAuth y sincronizacion real bidireccional

### 6.12 Reserva publica de turnos

Objetivo:

- que cada nutricionista pueda compartir un link para que pacientes se anoten solos

Funciones actuales:

- cada tenant define un `slug` publico
- existe una pagina publica de reservas por slug
- el paciente se identifica con DNI
- si el DNI ya existe en el tenant, la reserva se asigna al paciente existente
- si el DNI no existe, se crea un paciente nuevo con flag `nuevo`

Impacto operativo:

- reduce trabajo administrativo
- prepara una cola de pacientes potenciales aun no atendidos

### 6.13 Obras sociales

Objetivo:

- administrar financiadores o convenios de cobro

Funciones:

- alta de obra social
- listado
- edicion
- activacion/desactivacion

Uso:

- asociar pagos o practicas a un financiador
- segmentar cobros por cobertura

### 6.14 Pagos

Objetivo:

- registrar y monitorear el estado financiero de cada paciente

Funciones actuales:

- alta de pago por paciente
- listado historico de pagos por paciente
- asociacion opcional a visita
- asociacion opcional a obra social
- manejo de estado de pago
- manejo de fecha de vencimiento

Estados actuales:

- `PAID`
- `PENDING`
- `OVERDUE`

Reglas:

- un pago no debe perderse si el paciente se da de baja
- la baja del paciente no afecta la contabilidad historica

### 6.15 Plan alimenticio por paciente

Objetivo:

- generar, editar, exportar y compartir un plan semanal

Disponibilidad comercial:

- habilitado para `PRO` y `PREMIUM`

Modelo funcional actual:

- plan semanal estructurado
- 7 dias
- 5 momentos de comida por dia:
  - desayuno
  - almuerzo
  - merienda
  - cena
  - colacion por hambre o snack adicional

Funciones actuales:

- obtener plan del paciente
- editar plan manualmente
- generar plan con IA
- exportar a PDF
- compartir por link publico

Reglas de experiencia:

- la IA propone el contenido inicial
- el nutricionista lo revisa y lo modifica antes de exportar
- el PDF debe usar nombre de archivo con nombre del paciente y fecha
- el lenguaje del plan debe estar localizado a Argentina
  - ejemplo: `palta` en vez de `guacamole`
  - evitar alimentos poco realistas para el mercado objetivo, como `pavo` si no corresponde

### 6.16 Plantillas de planes

Objetivo:

- reutilizar estructuras alimentarias frecuentes

Funciones:

- listar templates de planes
- crear template
- editar template
- borrar template

Uso:

- acelerar la creacion de planes recurrentes
- combinar templates internas con generacion por IA

### 6.17 Generacion de planes con IA

Objetivo:

- reducir tiempo de armado del plan inicial

Inputs funcionales esperables:

- anamnesis
- objetivos del paciente
- restricciones
- alergias
- habitos
- contexto local alimentario

Output actual:

- una semana estructurada con las comidas del dia

Requisitos funcionales recomendados para la reescritura:

- guardar prompt, modelo, version y timestamp de generacion
- permitir regenerar solo un dia o una comida
- permitir comparar version IA vs version editada
- permitir estimar costo por generacion
- permitir trazabilidad por usuario

### 6.18 PDF y comparticion publica del plan

Objetivo:

- entregar el plan al paciente en formato presentable

Funciones actuales:

- generacion de PDF desde el plan del paciente
- link publico con token para descarga o visualizacion del PDF

Reglas:

- el token de comparticion debe poder invalidarse
- el PDF debe tomar branding del tenant
- el formato debe ser legible en celda semanal

### 6.19 Configuracion del tenant

Objetivo:

- administrar identidad y parametros del consultorio

Funciones actuales:

- ver configuracion
- editar configuracion general
- subir logo
- definir nombre del nutricionista
- definir nombre comercial
- definir matricula
- definir slug publico para reservas
- definir plan comercial

Evolucion ya planteada por negocio:

- configuracion separada en tabs
- tab `General`
- tab `Usuarios`

### 6.20 Administracion de usuarios internos

Objetivo:

- que el admin del tenant gestione su equipo

Funciones actuales:

- listar usuarios del tenant
- crear usuario
- activar o desactivar usuario
- resetear password directamente
- enviar mail de reset password

Reglas:

- no se puede crear `SUPER_ADMIN` desde tenant
- el usuario admin principal no deberia poder desactivarse
- el sistema debe distinguir entre reset tecnico y envio por mail

### 6.21 Consola de super administracion

Objetivo:

- operar la plataforma como SaaS

Funciones actuales:

- listado de tenants
- metricas globales
- cambio de plan del tenant
- desactivar o reactivar tenant
- resetear password del admin del tenant

Reglas de negocio ya definidas:

- la baja de tenant debe pedir confirmacion por modal
- debe guardarse fecha de alta y fecha de baja
- `deactivated_at = null` implica tenant activo

Recomendaciones para la reescritura:

- separar `tenant_status` de `billing_status`
- soportar suspension comercial sin baja funcional definitiva
- agregar auditoria completa de acciones del super admin

## 7. Integraciones externas actuales

### 7.1 Email SMTP

Usos:

- confirmacion de cuenta
- recuperacion de password
- envio de reset por admin

Necesidades operativas:

- configuracion por variables de entorno
- manejo de errores de autenticacion SMTP
- reintentos y cola de envio en segundo plano

### 7.2 IA para planes

Proveedor actual:

- OpenAI u OpenRouter segun configuracion

Uso:

- generacion de plan alimenticio semanal

Necesidades faltantes:

- medicion de costo por tenant
- medicion de costo por usuario
- tablero de consumo
- fallback de proveedor o modelo

### 7.3 Calendario externo

Situacion actual:

- la idea de negocio contempla integracion real con Google Calendar
- hoy el sistema no esta resuelto como sincronizacion completa multiusuario

Requisito para nueva version:

- OAuth por tenant o por usuario
- seleccion de calendarios
- sincronizacion de altas, cambios y cancelaciones
- estrategia de conflictos
- webhooks o polling incremental

## 8. Seguridad y control de acceso

### 8.1 Autorizacion por rol

Control actual:

- endpoints protegidos por rol
- `SUPER_ADMIN`, `ADMIN`, `USER`

### 8.2 Seguridad de origen

Comportamiento actual:

- cuando debug esta apagado, el backend valida que las peticiones vengan del frontend autorizado

Esto protege:

- login
- registro
- operacion autenticada desde front oficial

Excepcion actual:

- endpoints publicos necesarios como confirmacion de email y booking deben seguir siendo accesibles

### 8.3 Recomendaciones para reescritura

- usar RBAC formal con permisos por modulo y accion
- agregar auditoria de sesiones y eventos sensibles
- incorporar rate limiting en auth, booking y links publicos
- firmar todos los tokens de accion con expiracion corta
- registrar intentos fallidos de login, reset y confirmacion

## 9. Modelo de datos funcional

Este no es un modelo fisico completo, sino el mapa de entidades necesarias.

### 9.1 Core SaaS

- Tenant
- TenantSettings
- User
- Role
- AuditEvent
- FeatureFlag
- PlanSubscription

### 9.2 Clinico

- Patient
- Anamnesis
- AnamnesisTemplate
- Evolution
- PatientMetric
- Visit
- WeeklyPlan
- WeeklyPlanDay
- PlanTemplate
- PublicPlanShare

### 9.3 Comercial y financiero

- Insurance
- Payment
- PaymentStatus
- BillingEvent

### 9.4 Acceso y mensajeria

- EmailVerificationToken
- PasswordResetToken
- OutboundEmail

### 9.5 Publico y agenda

- PublicBookingLink
- BookingRequest
- CalendarConnection
- CalendarEventSync

## 10. Flujos principales de negocio

### 10.1 Alta de consultorio

1. usuario se registra
2. se crea tenant
3. se crea admin del tenant
4. se envia mail de confirmacion
5. usuario confirma
6. usuario hace login
7. completa configuracion general

### 10.2 Alta de paciente interno

1. usuario interno crea paciente
2. carga anamnesis inicial
3. agrega metricas
4. registra visita
5. genera plan
6. exporta PDF o comparte link
7. registra pago si corresponde

### 10.3 Reserva publica

1. paciente accede al link del consultorio
2. ingresa DNI y datos
3. el sistema busca coincidencia en el tenant
4. si existe, asocia turno al paciente
5. si no existe, crea paciente nuevo con flag `nuevo`
6. agenda la reserva
7. el consultorio la gestiona desde calendario

### 10.4 Recuperacion de password

1. usuario solicita recuperacion
2. sistema genera token temporal
3. envia mail
4. usuario abre link
5. define nueva password
6. vuelve a login

### 10.5 Desactivacion de paciente

1. admin confirma baja
2. paciente pasa a inactivo
3. deja de aparecer en listados por defecto
4. historial clinico y financiero se conserva
5. puede reactivarse luego

### 10.6 Desactivacion de tenant

1. super admin confirma accion
2. tenant se marca con fecha de baja
3. login y operacion quedan bloqueados
4. datos se conservan
5. puede reactivarse por decision administrativa

## 11. Limitaciones actuales detectadas

### 11.1 Arquitectura multi-tenant

- el modelo ya es multi-tenant, pero el aislamiento debe reforzarse a nivel de arquitectura y observabilidad
- falta una estrategia formal de feature flags y planes
- falta auditoria transversal

### 11.2 Integraciones

- Google Calendar real aun no esta completo
- el envio de mails depende de SMTP directo, sin cola ni dashboard operativo
- el consumo de IA por tenant/usuario no esta trazado como producto

### 11.3 Operacion SaaS

- faltan herramientas de soporte: auditoria, impersonacion segura, logs por tenant, estado de integraciones
- no hay facturacion o suscripcion desacoplada del estado funcional

### 11.4 Dominio clinico

- falta versionado fuerte de templates y planes
- falta estado formal del paciente dentro del funnel de atencion
- falta automatizacion de recordatorios y comunicaciones al paciente

## 12. Recomendacion de arquitectura para la reescritura

## 12.1 Stack recomendado

Recomendacion pragmatica:

- Backend: `Python 3.12 + Django 5 + Django REST Framework`
- Base de datos: `PostgreSQL`
- Frontend: puede mantenerse en `React`, o migrar a `Next.js` si se busca SSR para marketing y panel en un solo proyecto
- Jobs y colas: `Celery` con `Redis` o `RabbitMQ` como broker
- Cache: `Redis` (`django-redis`)
- Auth: `djangorestframework-simplejwt` (JWT + refresh)
- Storage: S3 compatible (`django-storages` + `boto3`) para logos, PDFs y adjuntos
- IA: SDK de `OpenAI` / `OpenRouter` desde Python, con capa de reglas y validacion propia

Motivos de esta recomendacion:

- el diferencial del producto es la asistencia de IA para planes; el ecosistema Python es el estandar para orquestacion de LLMs, motor de reglas nutricionales y validacion de la salida
- Django trae de fabrica ORM maduro, migraciones versionadas, admin, auth y permisos, lo que acelera el prototipado
- Django REST Framework cubre la API de forma directa (serializers, permisos, paginado)
- multi-tenant resoluble con `tenant_id` obligatorio + middleware de contexto, o `django-tenants` (schema por tenant) si se escala
- Celery cubre mail, generacion de PDF y tareas de IA en segundo plano
- PostgreSQL da mejor base que MySQL para seguridad, JSON, indices, RLS y crecimiento del modelo

Nota de migracion:

- este proyecto se reconstruye desde un backend previo en `.NET 8` hacia `Django`
- la logica de dominio y los contratos funcionales se conservan; cambia la implementacion
- prioridad: reconstruir la gestion ya relevada y llegar con solidez al modulo de IA supervisada

### 12.2 Estrategia de aislamiento recomendada

Opcion recomendada para etapa inicial y media:

- base unica
- tablas compartidas
- `tenant_id` obligatorio en todas las entidades de negocio
- capa de acceso a datos central que inyecte tenant context
- politicas y tests automáticos para evitar fugas entre tenants

Opcion para etapa enterprise:

- PostgreSQL con `schema por tenant` para tenants premium o sensibles
- o `database por tenant` para clientes grandes

Recomendacion:

- empezar con `shared database + shared schema + tenant_id`
- diseñar desde el inicio una capa de tenancy que permita evolucionar a `schema per tenant`

### 12.3 Bounded contexts sugeridos

Separacion recomendada:

- `Identity & Access`
- `Tenant Management`
- `Clinical Records`
- `Scheduling`
- `Billing`
- `Nutrition Plans`
- `Messaging`
- `AI Orchestration`
- `Super Admin & Analytics`

### 12.4 Servicios transversales necesarios

- auditoria
- feature flags por tenant
- motor de permisos
- outbox para eventos
- job scheduler
- notificaciones y mail
- almacenamiento de archivos
- observabilidad por tenant
- control de consumo de IA

## 13. Requisitos no funcionales para la nueva version

### 13.1 Observabilidad

Debe existir:

- logs estructurados
- trazas por request
- correlacion por tenant
- dashboard de errores por modulo
- metricas de uso por tenant

### 13.2 Auditoria

Auditar al menos:

- login
- reset password
- confirmacion email
- alta, baja y reactivacion de pacientes
- alta, baja y reactivacion de tenants
- generacion de planes IA
- exportacion y comparticion de PDF
- cambios de configuracion

### 13.3 Escalabilidad

- separar tareas de mail y PDF a jobs asincronos
- usar storage externo para binarios
- preparar cache de lecturas frecuentes
- soportar crecimiento por tenant sin mezclar cargas

### 13.4 Seguridad

- JWT o sesiones seguras con refresh token
- expiracion y rotacion de tokens sensibles
- CSP y CORS estrictos en produccion
- rate limit por IP y por tenant
- cifrado de secretos fuera del repo

### 13.5 Despliegue e infraestructura

Requisito no funcional explicitamente deseado:

- el sistema debe desplegarse en contenedores
- debe poder operarse en un servidor propio o VPS economico
- debe poder exponerse detras de `Cloudflare Proxy` para reducir costo de infraestructura publica
- no debe requerir servicios cloud administrados obligatorios para funcionar

Lineamientos tecnicos recomendados:

- `Docker` como formato de empaquetado obligatorio para frontend, backend y servicios auxiliares
- `Docker Compose` o equivalente como modo oficial de despliegue simple
- `Nginx` o proxy equivalente como entrypoint HTTP interno
- `Cloudflare Proxy` delante del dominio publico para ocultar IP origen, absorber trafico basico y simplificar TLS
- soporte para despliegue en una sola VM inicialmente, con posibilidad de separar servicios despues
- configuracion por variables de entorno, sin dependencias manuales fuera de contenedores
- base de datos persistida en volumen o disco administrado fuera del ciclo de vida del contenedor
- estrategia clara de backup y restore de base de datos y archivos

Alcance y limites de esta decision:

- `Cloudflare Proxy` no reemplaza la necesidad de un servidor origen; solo permite operar con una infraestructura mas barata y protegida
- el diseño debe asumir que el origen puede ser una VPS unica, no un cluster cloud complejo
- las integraciones salientes como SMTP, OpenRouter o Google Calendar siguen dependiendo de terceros externos

## 14. Roadmap funcional recomendado para reconstruccion

### Fase 1

- identidad y tenants
- registro, login, confirmacion email, reset password
- pacientes
- anamnesis template + anamnesis
- visitas y calendario interno
- pagos
- configuracion general

### Fase 2

- booking publico por slug
- usuarios internos
- baja logica de pacientes
- super admin
- dashboards
- mail transaccional robusto

### Fase 3

- plan semanal estructurado
- templates de plan
- IA con versionado y costo
- PDF y links compartidos
- consumo por tenant y por usuario

### Fase 4

- Google Calendar real
- automatizacion de recordatorios
- analytics avanzadas
- billing SaaS y suscripciones
- auditoria y soporte enterprise

## 15. Inventario funcional resumido

| Modulo | Estado funcional actual | Observacion |
|---|---|---|
| Landing | Implementado | comunica valor y deriva a auth |
| Registro tenant | Implementado | con confirmacion por email |
| Login | Implementado | bloquea email no validado |
| Reset password | Implementado | publico e interno |
| Dashboard | Implementado | operativo y financiero |
| Pacientes | Implementado | con baja logica |
| Anamnesis | Implementado | editable por tenant |
| Evoluciones | Implementado | seguimiento clinico |
| Metricas | Implementado | historial por paciente |
| Visitas | Implementado | base clinica y agenda |
| Calendario | Implementado parcial | vista mensual y alta manual |
| Booking publico | Implementado | alta por DNI y flag nuevo |
| Obras sociales | Implementado | CRUD basico |
| Pagos | Implementado | con estados y vencimiento |
| Plan alimenticio | Implementado | semanal editable |
| IA para planes | Implementado parcial | falta costo y trazabilidad |
| PDF de plan | Implementado | exportable y compartible |
| Templates de plan | Implementado | reutilizacion interna |
| Configuracion tenant | Implementado | branding y datos generales |
| Usuarios internos | Implementado | gestion por admin |
| Super admin | Implementado | tenants, plan, reset, toggle |
| Google Calendar real | Pendiente | integrar OAuth y sincronizacion |
| Consumo IA por tenant/usuario | Pendiente | necesario para operacion SaaS |

## 16. Conclusion

Nutrilius ya tiene un alcance funcional claro y bastante amplio para un MVP evolucionado: onboarding, seguridad, multi-tenant, operacion clinica, agenda, pagos, planes alimenticios e IA.

Para reconstruirlo mejor, el foco no deberia estar solo en cambiar de lenguaje, sino en profesionalizar cuatro ejes:

- aislamiento multi-tenant
- auditoria y observabilidad
- integraciones asincronas
- control de features y consumo por tenant

Si se rehace con esa base, el producto queda mucho mas preparado para crecer como SaaS real.
