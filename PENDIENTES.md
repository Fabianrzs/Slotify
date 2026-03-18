# Slotify — Plan de Trabajo por Sprints

> Stack: .NET Core · Next.js · SQL Server · Monorepo (Turborepo)
> Multi-tenancy: TenantId por tabla + EF Core Global Query Filters
> Última actualización: 2026-03-17

---

## Leyenda de estados

- `[ ]` Pendiente
- `[~]` En progreso
- `[x]` Completado
- `[!]` Bloqueado

---

## SPRINT 0 — Fundación y Modelo de Datos
> Objetivo: Tener el modelo de datos completo, el monorepo configurado y el proyecto .NET inicializado. Nada de lógica de negocio aún.

### Monorepo
- [ ] Inicializar monorepo con Turborepo
- [ ] Crear estructura de carpetas: `/apps/api`, `/apps/landing`, `/apps/tenant`, `/apps/consumer`, `/apps/admin`
- [ ] Configurar `turbo.json` con pipelines: `build`, `dev`, `lint`, `test`
- [ ] Configurar `.gitignore` global y por app
- [ ] Configurar `pnpm-workspace.yaml`
- [ ] Crear `packages/ui` (componentes compartidos entre Next.js apps)
- [ ] Crear `packages/types` (tipos TypeScript compartidos)
- [ ] Crear `packages/config` (ESLint, Tailwind base config)

### Modelo de Datos — SQL Server
- [ ] Diseñar y documentar ERD completo (todas las entidades)
- [ ] **Entidades core:**
  - [ ] `Tenants` (id, slug, name, plan, isActive, createdAt)
  - [ ] `TenantSettings` (tenantId, logoUrl, primaryColor, timezone, currency, minAdvanceHours, maxAdvanceDays)
  - [ ] `Users` (id, email, passwordHash, fullName, phone, avatarUrl, isActive, createdAt)
  - [ ] `TenantUsers` (tenantId, userId, role: Owner/Admin/Staff, isActive) — tabla de relación
  - [ ] `Clients` (id, tenantId, userId, notes, createdAt) — cliente dentro de un tenant
- [ ] **Entidades de negocio:**
  - [ ] `Branches` (id, tenantId, name, address, lat, lng, phone, timezone, isActive)
  - [ ] `BranchSchedules` (id, branchId, dayOfWeek, openTime, closeTime, isOpen)
  - [ ] `BranchScheduleExceptions` (id, branchId, date, isOpen, openTime, closeTime, reason)
  - [ ] `Categories` (id, tenantId, name, description, sortOrder)
  - [ ] `Services` (id, tenantId, categoryId, name, description, durationMinutes, price, currency, maxCapacity, isActive)
  - [ ] `ServiceImages` (id, serviceId, url, sortOrder)
- [ ] **Entidades de reserva:**
  - [ ] `Bookings` (id, tenantId, branchId, serviceId, clientId, staffId nullable, startAt, endAt, status: Pending/Confirmed/Cancelled/Completed/NoShow, notes, totalPrice, createdAt)
  - [ ] `BookingStatusHistory` (id, bookingId, status, changedAt, changedByUserId, reason)
  - [ ] `BlockedSlots` (id, tenantId, branchId, staffId nullable, startAt, endAt, reason)
- [ ] **Entidades de pagos:**
  - [ ] `Payments` (id, tenantId, bookingId, amount, currency, status: Pending/Paid/Refunded/Failed, provider: MercadoPago/Stripe, providerPaymentId, paidAt, createdAt)
- [ ] **Entidades de notificaciones:**
  - [ ] `NotificationTemplates` (id, tenantId nullable, type: BookingConfirmed/Reminder24h/Reminder1h/BookingCancelled, channel: Email, subject, body, isDefault)
  - [ ] `NotificationLogs` (id, tenantId, bookingId, type, channel, recipient, status: Sent/Failed, sentAt, error)
- [ ] **Entidades de plataforma (Admin):**
  - [ ] `Plans` (id, name, maxBranches, maxServices, maxBookingsPerMonth, price, isActive)
  - [ ] `TenantSubscriptions` (id, tenantId, planId, status, startAt, endAt, cancelledAt)
  - [ ] `PlatformAdmins` (id, email, passwordHash, fullName, role: SuperAdmin)
  - [ ] `AuditLogs` (id, tenantId nullable, userId, action, entity, entityId, oldValues, newValues, createdAt)

### Proyecto .NET Core
- [ ] Crear solución `.NET 8` en `/apps/api`
- [ ] Definir estructura de proyectos (Clean Architecture):
  - [ ] `Slotify.Domain` — entidades, value objects, enums
  - [ ] `Slotify.Application` — use cases, interfaces, DTOs, validators
  - [ ] `Slotify.Infrastructure` — EF Core, repositorios, servicios externos
  - [ ] `Slotify.Api` — controllers, middlewares, configuración
- [ ] Instalar dependencias base: EF Core, FluentValidation, MediatR, AutoMapper, Serilog
- [ ] Configurar DbContext con multi-tenancy (ITenantContext + Global Query Filters)
- [ ] Crear migrations iniciales con todas las entidades
- [ ] Configurar Seed data: planes, plantillas de notificación por defecto
- [ ] Configurar `appsettings.json` con conexión a SQL Server

---

## SPRINT 1 — Autenticación y Multi-tenancy
> Objetivo: Un usuario puede registrarse, iniciar sesión, y el sistema sabe a qué tenant pertenece en cada request.

### Backend — Auth
- [ ] `POST /api/auth/register` — registro de usuario final (cliente)
- [ ] `POST /api/auth/login` — login con email/password, retorna JWT + refresh token
- [ ] `POST /api/auth/refresh` — renovar access token
- [ ] `POST /api/auth/logout` — invalidar refresh token
- [ ] `POST /api/auth/google` — login/registro con Google OAuth2
- [ ] `POST /api/auth/forgot-password` — solicitar reset de contraseña
- [ ] `POST /api/auth/reset-password` — confirmar reset con token
- [ ] Middleware de resolución de tenant por subdomain (`tenant.slotify.com`) o header `X-Tenant-Slug`
- [ ] Global Query Filter en EF Core para filtrar por `TenantId` automáticamente
- [ ] Configurar JWT con claims: `userId`, `tenantId`, `role`
- [ ] Refresh tokens almacenados en DB con expiración
- [ ] Rate limiting en endpoints de auth

### Backend — Tenant Onboarding
- [ ] `POST /api/onboarding/register-tenant` — registrar nuevo negocio (crea tenant + owner)
- [ ] `GET /api/onboarding/check-slug` — verificar disponibilidad de slug
- [ ] Asignación automática de plan Free al registrar tenant
- [ ] Envío de email de bienvenida al registrar tenant

### Frontend — Landing (`/apps/landing`)
- [ ] Inicializar proyecto Next.js 14 (App Router)
- [ ] Configurar Tailwind CSS + sistema de diseño base
- [ ] Configurar fuentes y variables de color de Slotify
- [ ] Página principal (hero, features, pricing, CTA)
- [ ] Página de registro de tenant (`/register`)
  - [ ] Formulario: nombre del negocio, slug, email, contraseña
  - [ ] Validación en tiempo real de slug disponible
  - [ ] Paso 2: tipo de negocio, teléfono
- [ ] Página de login de tenant (`/login`)

### Frontend — Consumer App (`/apps/consumer`)
- [ ] Inicializar proyecto Next.js 14
- [ ] Configurar Tailwind CSS
- [ ] Página de login de cliente (`/login`)
- [ ] Página de registro de cliente (`/register`)
- [ ] Flujo de Google OAuth2 en cliente

---

## SPRINT 2 — Configuración del Negocio (Tenant App)
> Objetivo: Un tenant puede configurar completamente su negocio: sedes, servicios, horarios y staff.

### Backend — Tenant Config
- [ ] `GET/PUT /api/tenant/settings` — configuración general del tenant
- [ ] `POST/GET/PUT/DELETE /api/branches` — CRUD de sedes
- [ ] `GET/PUT /api/branches/{id}/schedules` — configurar horario semanal de sede
- [ ] `POST/GET/PUT/DELETE /api/branches/{id}/exceptions` — excepciones de horario (feriados, cierres especiales)
- [ ] `POST/GET/PUT/DELETE /api/categories` — CRUD de categorías de servicios
- [ ] `POST/GET/PUT/DELETE /api/services` — CRUD de servicios
  - [ ] Validar que duración + precio sean correctos
  - [ ] Subida de imágenes del servicio (S3 o local en dev)
- [ ] `POST/GET/PUT/DELETE /api/staff` — CRUD básico de staff (solo info, sin scheduling en MVP)
- [ ] `POST/PUT /api/tenant/branding` — logo, colores

### Frontend — Tenant App (`/apps/tenant`)
- [x] Inicializar proyecto Next.js 14
- [x] Layout base con sidebar de navegación
- [x] Dashboard con KPIs (reservas hoy: total/confirmadas/pendientes/canceladas) + próximas reservas
- [x] **Sección: Configuración** (`/settings`)
  - [x] Formulario de timezone y moneda
  - [x] Reglas de reserva (anticipación mín/máx, ventana de cancelación)
  - [x] Branding (logo URL, color principal)
- [x] **Sección: Sedes** (`/branches`)
  - [x] Lista de sedes como cards
  - [x] Crear/editar sede (modal con nombre, dirección, teléfono, timezone)
  - [x] Configurar horario semanal (modal con toggle por día + hora apertura/cierre)
- [x] **Sección: Servicios** (`/services`)
  - [x] Lista de servicios en tabla (nombre, duración, precio, capacidad, estado)
  - [x] Crear/editar servicio (modal con todos los campos)
  - [x] Toggle activar/desactivar servicio inline
- [x] **Sección: Staff** (`/staff`)
  - [x] Lista de staff en tabla (nombre, contacto, rol, estado)
  - [x] Invitar miembro (modal con email, nombre, teléfono, rol)
  - [x] Cambiar rol inline (Admin/Staff) con select

---

## SPRINT 3 — Motor de Disponibilidad
> Objetivo: El sistema calcula correctamente los slots disponibles dado un servicio, sede y fecha. Este es el algoritmo más crítico.

### Backend — Disponibilidad
- [x] Algoritmo de generación de slots:
  - [x] Calcular slots posibles según horario de sede
  - [x] Excluir excepciones de horario (feriados, cierres)
  - [x] Excluir slots bloqueados (`BlockedSlots`)
  - [x] Contar reservas existentes y comparar contra `maxCapacity` del servicio
  - [x] Retornar slots con estado: disponible / lleno
- [x] `GET /api/availability` — query: `branchId`, `serviceId`, `date` → retorna slots del día
- [x] `GET /api/availability/month` — query: `branchId`, `serviceId`, `month` → retorna días con/sin disponibilidad (para calendario)
- [x] Cache de disponibilidad (in-memory, 60s) con invalidación al crear/cancelar reserva
- [x] Tests unitarios exhaustivos del algoritmo de disponibilidad (10/10 passing):
  - [x] Slot exactamente en límite de cierre
  - [x] Día cerrado (domingo)
  - [x] Capacidad llena
  - [x] Reservas canceladas no cuentan para capacidad
  - [x] Excepción de horario (cierre especial)
  - [x] Excepción de horario (horario especial)
  - [x] Slot bloqueado
  - [x] Rama inactiva retorna vacío
  - [x] Vista mensual retorna fechas con disponibilidad

### Frontend — Tenant App
- [x] Módulo `availability` (types, repository, handlers)
- [x] Página de reservas (`/bookings`) — lista con filtros, acciones de estado, paginación

### Backend — Public API
- [x] `GET /api/public/profile` — perfil público del negocio: nombre, branding, sedes activas, servicios activos

### Frontend — Consumer App (setup)
- [x] Setup: package.json, layout, globals.css, providers (QueryClient)
- [x] Auth pages: login (`/login`), registro (`/register`)
- [x] Módulo `establishments` (types, repository, handlers)
- [x] Módulo `availability` (types, repository, handlers, slug-aware)
- [x] Módulo `bookings` (types, repository, handlers, slug-aware)

### Frontend — Consumer App (experiencia de reserva)
- [x] Componente `DatePicker` — calendario mensual (lunes a domingo)
  - [x] Días con disponibilidad en índigo (datos de GET /month)
  - [x] Días sin disponibilidad / pasados en gris (no seleccionables)
  - [x] Navegación mes anterior/siguiente con refetch automático
- [x] Componente `SlotPicker` — grid de horarios
  - [x] Slots disponibles seleccionables
  - [x] Slots llenos visibles pero deshabilitados
  - [x] Indicador de cupos restantes (≤3)
- [x] Página de perfil de negocio (`/[slug]`)
  - [x] Hero con branding (color, logo, nombre)
  - [x] Lista de sedes con dirección y teléfono
  - [x] Lista de servicios con precio, duración y CTA "Reservar"
  - [x] Info de reglas de reserva (anticipación, cancelación)
- [x] Flujo de reserva — wizard 4 pasos (`/[slug]/book`)
  - [x] Paso 1: Seleccionar servicio + sede
  - [x] Paso 2: Seleccionar fecha (DatePicker)
  - [x] Paso 3: Seleccionar horario (SlotPicker)
  - [x] Paso 4: Confirmar y crear reserva (POST /api/bookings)
- [x] Página de confirmación (`/[slug]/book/[bookingId]/confirmation`)
- [x] Mis reservas (`/mis-reservas`) — lista con opción de cancelar

### Geolocalización
> **Decisión de producto:** Sedes y servicios deben priorizarse según la ubicación del usuario.
- [x] Backend: añadir `lat` / `lng` a la entidad `Branch` y al `PublicBranchDto`
- [x] Backend: `GET /api/public/profile?lat=&lng=` — ordenar sedes por distancia Haversine al usuario
- [x] Backend: `CreateBranchCommand` y `UpdateBranchCommand` aceptan `latitude`/`longitude`
- [x] Frontend Consumer: `useGeolocation()` hook — solicita permiso de ubicación al usuario
- [x] Frontend Consumer: si permiso concedido, pasar coordenadas a la query del perfil
- [x] Frontend Consumer: mostrar distancia en cada sede ("~1.2 km" / "450 m")
- [x] Frontend Consumer: preseleccionar la sede más cercana en el wizard de reserva
- [x] Frontend Consumer: banner amigable cuando el usuario deniega el permiso
- [ ] Frontend Tenant: campos lat/lng en modal de crear/editar sede (+ integración Google Maps opcional)

---

## SPRINT 4 — Flujo de Reserva (End-to-End)
> Objetivo: Un cliente puede completar una reserva de principio a fin y tanto el cliente como el negocio reciben confirmación.

### Backend — Bookings
- [x] `POST /api/bookings` — crear reserva
- [x] `GET /api/bookings` — listar reservas del cliente autenticado
- [x] `PATCH /api/bookings/{id}/cancel` — cancelar reserva
- [ ] Validar disponibilidad en tiempo real con lock optimista (concurrencia)
- [ ] `GET /api/bookings/{id}` — detalle de reserva
- [ ] `GET /api/tenant/bookings` — listar reservas del tenant (con filtros)
- [ ] `PATCH /api/tenant/bookings/{id}/status` — cambiar status manualmente
- [ ] `POST /api/tenant/bookings` — crear reserva manual desde el backoffice
- [ ] `POST /api/tenant/blocked-slots` — bloquear franja horaria

### Backend — Notificaciones
- [ ] Servicio de email con SendGrid o SMTP
- [ ] Template: Confirmación de reserva (para cliente)
- [ ] Template: Nueva reserva recibida (para negocio)
- [ ] Template: Reserva cancelada (para cliente y negocio)
- [ ] Job de recordatorios (Hangfire o similar):
  - [ ] Recordatorio 24h antes → email al cliente
  - [ ] Recordatorio 1h antes → email al cliente
- [ ] Registro de notificaciones enviadas en `NotificationLogs`

### Frontend — Consumer App
- [x] Flujo de reserva E2E completo (wizard + confirmación)
- [x] Cancelar reserva desde "Mis reservas"
- [x] Geolocalización — preselección de sede más cercana (ver sección Geolocalización arriba)
- [ ] Google Calendar link en página de confirmación
- [ ] Detalle expandido de reserva individual

---

## SPRINT 5 — Dashboard y Gestión de Reservas (Tenant)
> Objetivo: El negocio tiene visibilidad total de su operación y puede gestionar reservas desde el backoffice.

### Frontend — Tenant App
- [ ] **Dashboard**
  - [ ] Métricas del día: reservas totales, confirmadas, canceladas, pendientes
  - [ ] Próximas reservas (lista)
  - [ ] Ocupación de hoy por servicio (%)
- [ ] **Calendario de reservas**
  - [ ] Vista día / semana / mes
  - [ ] Eventos clickeables con detalle de reserva
  - [ ] Drag & drop para mover reservas (post-MVP, preparar estructura)
  - [ ] Indicador de capacidad por franja
  - [ ] Filtros por sede y servicio
- [ ] **Lista de reservas**
  - [ ] Tabla con filtros: fecha, sede, servicio, status
  - [ ] Búsqueda por nombre de cliente
  - [ ] Exportar a CSV
  - [ ] Acciones: confirmar, cancelar, marcar como completada, marcar no-show
- [ ] **Crear reserva manual**
  - [ ] Buscar cliente existente o crear nuevo
  - [ ] Seleccionar servicio, sede, fecha y slot
  - [ ] Notas internas
- [ ] **Detalle de reserva**
  - [ ] Info completa de la reserva
  - [ ] Historial de cambios de status
  - [ ] Info del cliente con link a su perfil
- [ ] **Perfil de cliente**
  - [ ] Historial de reservas del cliente
  - [ ] Notas internas del cliente

---

## SPRINT 6 — Pagos con MercadoPago
> Objetivo: Un cliente puede pagar su reserva al momento de crearla. El negocio ve el estado del pago.

### Backend — Pagos
- [ ] Integrar SDK de MercadoPago
- [ ] `POST /api/payments/preference` — crear preferencia de pago de MercadoPago
- [ ] `POST /api/payments/webhook` — recibir notificaciones IPN de MercadoPago
  - [ ] Validar firma del webhook
  - [ ] Actualizar estado del pago en DB
  - [ ] Confirmar reserva automáticamente al recibir pago exitoso
- [ ] `GET /api/payments/{bookingId}` — estado de pago de una reserva
- [ ] Manejo de pagos fallidos (reserva vuelve a Pending o se cancela)
- [ ] Configurar credenciales MercadoPago por tenant (cada negocio conecta su propia cuenta)
- [ ] `POST /api/tenant/mercadopago/connect` — guardar access token del tenant

### Frontend — Consumer App
- [ ] Integrar Checkout de MercadoPago en paso 3 del wizard de reserva
- [ ] Página de pago exitoso (`/bookings/[id]/payment-success`)
- [ ] Página de pago fallido (`/bookings/[id]/payment-failed`)
- [ ] Mostrar estado de pago en detalle de reserva

### Frontend — Tenant App
- [ ] Sección de configuración de MercadoPago (conectar cuenta)
- [ ] Columna de estado de pago en lista de reservas
- [ ] Filtro por estado de pago

---

## SPRINT 7 — Reportes y Analytics (Tenant)
> Objetivo: El negocio puede medir su operación con datos reales.

### Backend — Reportes
- [ ] `GET /api/reports/bookings` — reservas por período con agrupación configurable (día/semana/mes)
- [ ] `GET /api/reports/revenue` — ingresos por período
- [ ] `GET /api/reports/occupancy` — tasa de ocupación por sede/servicio
- [ ] `GET /api/reports/clients` — nuevos clientes por período, clientes recurrentes
- [ ] `GET /api/reports/cancellations` — tasa y razones de cancelación
- [ ] `GET /api/reports/top-services` — servicios más reservados
- [ ] Exportación a CSV/Excel

### Frontend — Tenant App
- [ ] **Sección: Reportes**
  - [ ] Gráfico de reservas por día/semana/mes (line chart)
  - [ ] Gráfico de ingresos (bar chart)
  - [ ] Tabla de servicios más populares
  - [ ] Métricas de retención de clientes
  - [ ] Selector de rango de fechas
  - [ ] Filtro por sede
  - [ ] Botón de exportar CSV

---

## SPRINT 8 — Admin Platform
> Objetivo: El equipo de Slotify puede gestionar todos los tenants, planes y la salud de la plataforma.

### Backend — Platform Admin
- [ ] Auth independiente para Platform Admins (JWT separado, sin TenantId)
- [ ] `GET /api/admin/tenants` — listar todos los tenants con métricas básicas
- [ ] `GET /api/admin/tenants/{id}` — detalle de tenant
- [ ] `PATCH /api/admin/tenants/{id}` — activar/desactivar tenant, cambiar plan
- [ ] `GET /api/admin/metrics` — métricas globales: total tenants, reservas hoy, ingresos de la plataforma
- [ ] `GET /api/admin/plans` — listar planes
- [ ] `POST/PUT /api/admin/plans` — CRUD de planes
- [ ] `GET /api/admin/audit-logs` — logs de auditoría

### Frontend — Admin App (`/apps/admin`)
- [ ] Inicializar proyecto Next.js 14
- [ ] Login independiente de Admin Platform
- [ ] **Dashboard global**
  - [ ] Tenants activos / nuevos esta semana
  - [ ] Total de reservas en la plataforma hoy
  - [ ] Gráfico de crecimiento de tenants
- [ ] **Gestión de tenants**
  - [ ] Tabla de todos los tenants con búsqueda y filtros
  - [ ] Detalle de tenant: info, plan, métricas de uso
  - [ ] Acciones: activar, desactivar, cambiar plan
- [ ] **Gestión de planes**
  - [ ] CRUD de planes y sus límites

---

## SPRINT 9 — Hardening, Performance y Deploy
> Objetivo: La aplicación está lista para producción real.

### Seguridad
- [ ] Audit completo de autorización: ningún endpoint filtra datos entre tenants
- [ ] Configurar CORS correctamente por ambiente
- [ ] Sanitización de inputs en todos los endpoints
- [ ] Configurar Content Security Policy en Next.js apps
- [ ] Configurar HTTPS forzado
- [ ] Secrets en AWS Secrets Manager (no en variables de entorno hardcodeadas)
- [ ] Logging de seguridad: intentos fallidos de auth, accesos denegados

### Performance
- [ ] Revisar queries con N+1 y agregar `.Include()` necesarios
- [ ] Agregar índices a columnas frecuentemente filtradas: `TenantId`, `startAt`, `status`, `branchId`
- [ ] Configurar paginación en todos los endpoints de lista
- [ ] Implementar cache de disponibilidad (Redis o in-memory)
- [ ] Configurar CDN para assets estáticos

### Testing
- [ ] Tests unitarios del motor de disponibilidad (cobertura > 90%)
- [ ] Tests de integración en endpoints críticos: auth, crear reserva, pagos webhook
- [ ] Tests E2E del flujo de reserva completo (Playwright)
- [ ] Test de carga básico (k6): 500 usuarios creando reservas simultáneamente

### Docker Compose (local)
- [x] `Dockerfile` para la API .NET (multi-stage build)
- [x] `Dockerfile` para la app Tenant (Next.js standalone)
- [x] `Dockerfile` para la app Consumer (Next.js standalone)
- [x] `next.config.ts` con `output: 'standalone'` en tenant y consumer
- [x] `docker-compose.yml` — levanta SQL Server + API + Tenant + Consumer con un solo comando
- [x] `.env.example` con variables requeridas (SQL SA password + Cognito credentials)
- [ ] Script de init DB (`docker-compose up` + `dotnet ef database update` automático)
- [ ] GitHub Actions: build de imágenes Docker en CI

### Infraestructura AWS
- [ ] Configurar RDS (SQL Server) con Multi-AZ
- [ ] Configurar ECS (Fargate) para la API .NET
- [ ] Configurar S3 + CloudFront para assets
- [ ] Configurar Route 53 con wildcard DNS (`*.slotify.com`)
- [ ] Configurar ALB (Application Load Balancer)
- [ ] Variables de entorno en AWS Secrets Manager
- [ ] Configurar CI/CD con GitHub Actions:
  - [ ] Pipeline de tests en PR
  - [ ] Deploy automático a staging en merge a `develop`
  - [ ] Deploy manual a producción desde `main`
- [ ] Configurar monitoreo: CloudWatch + alertas

### Documentación
- [ ] README por cada app en el monorepo
- [ ] Documentación de API con Swagger/OpenAPI
- [ ] Guía de onboarding para nuevos tenants

---

---

## SPRINT 0-B — Planes, Límites y Overage (incorporado a S0)
> Entidades y servicios para parametrización completa de planes con soporte de recargo por consumo.

### Backend — Domain
- [x] Entidad `Plan` con `PlanLimits` (value object): maxBranches, maxServices, maxBookingsPerMonth, maxStaffMembers, maxClients
- [x] Entidad `TenantSubscription` con flag `OverageBillingEnabled`
- [x] Entidad `OverageCharge` (registro de unidades consumidas en exceso)
- [x] `TenantUsage` record con gates de disponibilidad (canAddBranch, canAddService, etc.)
- [x] Definir límites por defecto en `PlanLimits`: Free, Starter, Pro, Enterprise

### Backend — Application
- [x] Interface `IPlanLimitService` con métodos `EnsureCanAdd*` y `EnsureFeatureAsync`
- [x] `PlanLimitBehavior<TRequest,TResponse>` — pipeline behavior automático vía `IRequiresPlanLimit`
- [x] Marcar `CreateBookingCommand` con `IRequiresPlanLimit` (PlanLimitCheck.Booking)
- [ ] Marcar `CreateBranchCommand` con `IRequiresPlanLimit` (PlanLimitCheck.Branch)
- [ ] Marcar `CreateServiceCommand` con `IRequiresPlanLimit` (PlanLimitCheck.Service)
- [ ] Marcar `InviteStaffCommand` con `IRequiresPlanLimit` (PlanLimitCheck.Staff)
- [x] `PlanLimitExceededException` → HTTP 402 en ExceptionHandlingMiddleware

### Backend — Infrastructure
- [x] `OveragePlanLimitService` — implementación que lee header `X-Allow-Overage: true`
  - [x] Si header presente + plan permite overage + tenant optó por overage → registrar `OverageCharge` y permitir
  - [x] Si cualquier condición falla → lanzar `PlanLimitExceededException`
- [x] Registrar `OveragePlanLimitService` como implementación de `IPlanLimitService` en DI (reemplaza `PlanLimitService`)
- [x] Configuraciones EF Core para `Plan`, `TenantSubscription`, `OverageCharge`
- [x] Seed de planes: Free, Starter, Pro, Enterprise con precios y límites reales
- [ ] Job mensual para facturar `OverageCharge` acumulados (Hangfire)

### Backend — API
- [x] `GET /api/tenant/plan/usage` — retorna uso actual + límites + gates para el frontend
- [ ] `POST /api/tenant/subscription/enable-overage` — activar recargo por consumo
- [ ] `POST /api/tenant/subscription/disable-overage` — desactivar recargo
- [ ] `GET /api/tenant/overage-charges` — listar cargos de overage pendientes de facturar

### Frontend — Tenant App
- [x] Hook `usePlanUsage()` — consulta usage y gates
- [ ] Componente `PlanUsageBar` — barra de progreso por recurso (sedes, servicios, reservas/mes)
- [ ] Componente `PlanGate` — wrapper que deshabilita botones/acciones cuando el gate está cerrado
- [ ] Componente `UpgradeModal` — modal que aparece cuando se excede un límite
- [ ] Toggle en Settings para activar/desactivar overage billing con confirmación
- [ ] Mostrar cargos de overage pendientes en sección de Facturación

---

## Backlog Post-MVP (no en sprints activos)

- [ ] Recordatorios por WhatsApp (Twilio / Meta API)
- [ ] Notificaciones push (PWA)
- [ ] Integración con Google Calendar
- [ ] Reservas recurrentes
- [ ] Lista de espera
- [ ] Scheduling por staff (no solo por sede)
- [ ] Multi-idioma (i18n)
- [ ] Integración con Stripe
- [ ] API pública para integraciones externas
- [ ] App móvil nativa (React Native)
- [ ] Reviews y calificaciones de servicios
- [ ] Programa de fidelidad / puntos
- [ ] Depósitos y políticas de penalización por cancelación

---

## Progreso por Sprint

| Sprint | Nombre | Estado | Completado |
|--------|--------|--------|------------|
| S0 | Fundación y Modelo de Datos | Completado | 100% |
| S1 | Autenticación y Multi-tenancy (Cognito) | Completado | 100% |
| S2 | Configuración del Negocio | Completado | 100% |
| S3 | Motor de Disponibilidad | Completado | 100% |
| S4 | Flujo de Reserva E2E | En progreso | 55% |
| S5 | Dashboard y Gestión (Tenant) | Pendiente | 0% |
| S6 | Pagos MercadoPago | Pendiente | 0% |
| S7 | Reportes y Analytics | Pendiente | 0% |
| S8 | Admin Platform | Pendiente | 0% |
| S9 | Hardening y Deploy | Pendiente | 0% |
