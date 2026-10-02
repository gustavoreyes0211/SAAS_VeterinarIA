# 08. PLAN MAESTRO DE IMPLEMENTACIÓN Y GUÍA DE INICIO (KICKOFF)

Este documento establece el plan operativo y técnico paso a paso para la inicialización y desarrollo integral de la plataforma **SaaS Hospital Veterinario & UCI**, abarcando la infraestructura inicial, el stack tecnológico definitivo, la estructura de directorios, la hoja de ruta en 10 etapas y los primeros pasos ejecutables.

---

## 1. STACK TECNOLÓGICO DEFINITIVO

| Capa | Tecnología Seleccionada | Justificación Técnica |
| :--- | :--- | :--- |
| **Framework Core** | **Next.js 15+ (App Router)** | Server Components para máxima velocidad de carga de expedientes clínicos, Server Actions para mutaciones transaccionales seguras y Middleware para resolución multi-inquilino. |
| **Lenguaje** | **TypeScript 5.x (Strict Mode)** | Tipado estricto de dosis farmacológicas, esquemas DTE de Hacienda, parámetros fisiológicos y constantes vitales sin errores en tiempo de ejecución. |
| **Diseño y Estilos** | **Tailwind CSS + Lucide Icons** | Diseño modular de alto rendimiento, soporte nativo de modo oscuro (Dark Mode clínico para quirófano/guardia nocturna) y paleta accesible de semáforos de emergencia. |
| **Base de Datos Principal** | **PostgreSQL 16** | Modelo relacional robusto en 3NF/BCNF con soporte para `UUID`, `JSONB` en monitoreo anestésico, índices B-Tree/GIN y **Row-Level Security (RLS)** para aislamiento multi-tenant. |
| **Capa ORM / Acceso a Datos** | **Prisma ORM** + Cliente SQL Nativo | Esquemas fuertemente tipados, migraciones automáticas reproducibles y ejecución de consultas de alto rendimiento con inyección segura de sesión RLS. |
| **Colas y Cache en Memoria** | **Redis 7 + BullMQ** | Modo Contingencia offline de facturación DTE (reintentos exponenciales hasta 72h), caché de stock de farmacia y colas de notificaciones WhatsApp. |
| **Comunicación en Tiempo Real** | **Server-Sent Events (SSE) / WebSockets** | Streaming en vivo de la Pizarra UCI (Flowboard), alarma sonora de Código Rojo, monitor multiparamétrico de quirófano y pantalla Smart TV de turnos. |
| **Visor Médico Radiológico** | **Cornerstone.js (WADO-RS / DICOM)** | Renderizado nativo en navegador web de placas de Rayos X y Ecografía con ajuste de brillo/contraste (Window/Level) y mediciones VHS/TPLO. |
| **Firma Criptográfica DTE** | **Node.js `crypto` / `node-jose`** | Algoritmo JWS con cifrado asimétrico `RS512` y certificados digitales X.509 homologados por el Ministerio de Hacienda de El Salvador. |
| **Entorno de Contenedores** | **Docker & Docker Compose** | Entorno de desarrollo local unificado con PostgreSQL 16, Redis 7 y almacenamiento local S3 (MinIO). |

---

## 2. ESTRUCTURA DEL PROYECTO (DOMINIO HOSPITALARIO)

La arquitectura sigue el patrón modular por dominio (*Domain-Driven Design*) integrado con la convención de carpetas de Next.js App Router:

```
veterinaria-next/
├── docker-compose.yml              # PostgreSQL 16, Redis 7, MinIO S3
├── .env.example                    # Plantilla de variables de entorno seguras
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma               # Definición relacional completa
│   ├── seed.ts                     # Datos semilla: razas, especies, roles y permisos
│   └── migrations/                 # Historial de migraciones SQL
├── public/
│   ├── audio/                      # Chime polifónico de turnos TV
│   └── icons/                      # Iconos PWA y favicons
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Login, Recuperación de contraseña, MFA
│   │   │   └── login/
│   │   ├── (dashboard)/            # Consola principal clínica y administrativa
│   │   │   ├── [branch]/           # Enrutamiento dinámico por sucursal activa
│   │   │   │   ├── dashboard/      # Resumen ejecutivo y KPIs de sede
│   │   │   │   ├── clientes/       # Padrón de tutores, DUI/NIT/NRC, créditos
│   │   │   │   ├── pacientes/      # Expediente maestro, microchips, razas
│   │   │   │   ├── consultorios/   # Gestión de salas, estados y asignación médica
│   │   │   │   ├── consultas/      # Consulta médica SOAP AAHA y recetas con QR
│   │   │   │   ├── emergencias/    # Semáforo VECCS 5 niveles, Carrito Rojo
│   │   │   │   ├── quirofano/      # Programación Qx, hoja anestésica, ASA
│   │   │   │   ├── uci/            # Pizarra Flowboard 24/7, fluidos y CRI
│   │   │   │   ├── imagenologia/   # Visor Web DICOM PACS y reportes de Rx
│   │   │   │   ├── laboratorio/    # Carga de análisis y tendencias
│   │   │   │   ├── inventario/     # Lotes PEPS/FIFO, farmacia, compras
│   │   │   │   ├── facturacion/    # Emisión DTE-01/03/05 MH El Salvador
│   │   │   │   ├── peluqueria/     # Tablero Kanban de Grooming
│   │   │   │   └── configuracion/  # Roles, usuarios, médicos JVPM
│   │   ├── (tv)/                   # Pantalla de sala de espera para Smart TVs
│   │   │   └── turnos/[branch]/    # Kiosco público con Web Audio API y anti-burn-in
│   │   ├── (tutor-portal)/         # Portal del Tutor PWA (Mobile-First y PC)
│   │   │   └── mi-mascota/         # Carnet de vacunas offline, recetas y seguimiento
│   │   └── api/                    # Endpoints REST y Route Handlers (SSE, Webhooks)
│   ├── components/
│   │   ├── ui/                     # Botones, modales, switches, badges, tooltip
│   │   ├── layout/                 # CollapsibleSidebar, SidebarItem, SidebarTooltip, Header, BranchSwitcher
│   │   ├── auth/                   # LoginForm, TwoFactorModal, BrandingHero
│   │   ├── clinical/               # SafetyBanner, VitalSignsBox, SoapForm
│   │   ├── emergency/              # TriageTrafficLight, CrashCartCalculator
│   │   ├── inventory/              # ExpiryBadge, OpenVialCard, StockAlert
│   │   └── dicom/                  # DicomViewer, MeasurementTool
│   ├── lib/
│   │   ├── prisma.ts               # Instancia de conexión a base de datos
│   │   ├── redis.ts                # Conexión Redis y colas BullMQ
│   │   ├── auth/                   # JWT, validación de sesiones, cookies
│   │   ├── rbac/                   # Guards de permisos `can('PERMISSION_CODE')`
│   │   ├── dte/                    # Generador JWS, emisor MH y validador QR
│   │   └── sse/                    # Transmisor de eventos en tiempo real
│   ├── hooks/                      # useBranch, useEmergencySound, useDicom
│   └── types/                      # Interfaces TypeScript del dominio
└── docs/                           # Documentación técnica maestra (Módulos 01 a 10)
```

---

## 3. ESPECIFICACIÓN DE UI/UX: LOGIN PROFESIONAL Y SIDEBAR COLAPSABLE CON TOOLTIPS

### 3.1. Pantalla de Login Profesional (Enterprise Healthcare Design)

La interfaz de autenticación está diseñada para proyectar la máxima confiabilidad clínica, adaptándose automáticamente al tenant/hospital correspondiente:

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│        PANEL DE MARCA / BRANDING     │     TARJETA DE ACCESO PROFESIONAL    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 🏥 Hospital Veterinario San Salvador │ Iniciar Sesión                       │
│    Red Hospitalaria 24/7             │ Ingrese sus credenciales clínicas    │
│                                      │                                      │
│ [Ilustración Médica / Quirófano 3D] │ [ Correo o Usuario                ]  │
│                                      │                                      │
│ "Gestión clínica de alta precisión,  │ [ Contraseña                   👁️ ]  │
│  quirófano, UCI y facturación DTE." │                                      │
│                                      │ [✓] Recordar sesión  ¿Olvidó clave?  │
│ 🛡️ Certificado SSL 256-bit           │                                      │
│ 🇸🇻 Homologado Ministerio de Hacienda │ [   INGRESAR AL SISTEMA CLÍNICO  ➔ ] │
│                                      │                                      │
│                                      │ ¿Problemas de acceso? Contactar IT   │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

#### Características Clave del Login Profesional:
1. **Layout Adaptativo Split-Screen (50/50 Desktop):**
   * Panel izquierdo con hero visual, credenciales de seguridad (cifrado 256-bit, homologación DTE El Salvador) y logotipo corporativo inyectado según el subdominio (`hospital.veterinaria.com`).
   * Panel derecho con formulario centrado sobre tarjeta elevada glassmórfica (`backdrop-blur-md bg-white/80 dark:bg-slate-900/80`).
2. **Validación Reactiva de Formulario:**
   * Esquema fuertemente tipado con **Zod** y **React Hook Form**.
   * Campo de contraseña con botón de alternancia mostrar/ocultar (*eye icon*) y medidor visual de fortaleza.
   * Botón de ingreso con estado de carga interactivo (*loading spinner* y protección contra dobles clics).
3. **Flujo de Autenticación en Dos Pasos (2FA / MFA):**
   * Si la cuenta del médico o administrador tiene 2FA habilitado, la tarjeta conmuta fluidamente a un formulario modal de ingreso de código numérico de 6 dígitos (TOTP compatible con Google Authenticator / Microsoft Authenticator o código OTP vía WhatsApp).
4. **Protección Contra Ataques de Fuerza Bruta:**
   * Rate limiting distribuido con Redis (`5 intentos fallidos / 15 minutos por IP y por correo`).
   * Bloqueo progresivo y notificación inmediata al correo del usuario ante intentos sospechosos.

---

### 3.2. Sidebar Colapsable Inteligente con Tooltips Flotantes

La barra de navegación principal optimiza al máximo el área visual de trabajo clínico, permitiendo alternar fluidamente entre modo expandido y modo icono compacto:

```
    MODO EXPANDIDO (260px)                      MODO COLAPSADO (68px)
┌─────────────────────────────────┐         ┌───────┐
│ 🏥 VET HOSPITAL     [« Colapsar]│         │ [»]   │
│ Sede: Central San Salvador 🟢   │         │ 🟢    │
├─────────────────────────────────┤         ├───┬───┤
│ CLÍNICA                         │         │   │   │  [Tooltip Flotante]
│ 🩺 Consultas SOAP               │         │🩺 ├───┼►┌───────────────────────────┐
│ 🐾 Expediente 360°              │         │🐾 │   │ │ Consultas Médicas SOAP    │
│ 👥 Clientes y Tutores           │         │👥 │   │ │ Atajo: Ctrl + S           │
│                                 │         │   │   │ │ 3 pacientes en espera     │
│ URGENCIAS & QUIRÓFANO           │         │   │   │ └───────────────────────────┘
│ 🚨 Semáforo Triaje       [3]    │         │🚨 │ 3 │
│ ⚡ Carrito Rojo (Paro)          │         │⚡ │   │
│ 🔪 Quirófano & Anestesia        │         │🔪 │   │
│ 📈 UCI Flowboard 24/7    [5]    │         │📈 │ 5 │
│                                 │         │   │   │
│ LOGÍSTICA & FARMACIA            │         │   │   │
│ 💊 Inventario & Lotes    [!]    │         │💊 │ ! │
│ 🚪 Consultorios & Salas         │         │🚪 │   │
│ ✂️ Peluquería Kanban            │         │✂️ │   │
│                                 │         │   │   │
│ FINANZAS & DTE                  │         │   │   │
│ 🧾 Facturación DTE (MH)         │         │🧾 │   │
├─────────────────────────────────┤         ├───┴───┤
│ 👤 Dra. Andrea Martínez         │         │ 👤    │
│ Cirujano Líder | 🌙 Guardia Qx  │         │ 🌙    │
│ [Modo Oscuro 🌙]   [Salir ➔]    │         │ [➔]   │
└─────────────────────────────────┘         └───────┘
```

#### Características de la Sidebar Colapsable:
1. **Transición Suave y Persistencia:**
   * Conmutación entre anchos (`w-64` = 260px a `w-[68px]` = 68px) con animación acelerada por hardware: `transition-all duration-300 ease-in-out`.
   * El estado del colapso se almacena en una cookie `sidebar_collapsed=true/false` para que la preferencia se mantenga al recargar o navegar sin parpadeos (*no layout shift*).
   * **Atajo de teclado global:** Pulsar `Ctrl + B` (o `⌘ + B`) colapsa o expande la barra instantáneamente.
2. **Tooltips Flotantes Dinámicos (Radix UI Tooltip):**
   * En modo colapsado, al pasar el cursor (*hover*) sobre cualquier icono, se despliega a la derecha un **Tooltip flotante (`side="right"`, `sideOffset={12}`)** con:
     * **Título del Módulo:** En negrita con tipografía nítida (ej. *"Semáforo de Triaje"*).
     * **Atajo Rápido de Teclado:** Badge estilizado `<kbd>` (ej. `Ctrl + T`).
     * **Estado en Tiempo Real:** Texto de apoyo (ej. *"3 urgencias activas en espera"*).
3. **Badges de Notificación Vivos:**
   * En modo expandido: Badges rectangulares redondeados con número (ej. `[3]` rojo pulsante en emergencias).
   * En modo colapsado: Se transforman en un discreto punto indicador (*notification dot*) sobre el vértice del icono.
4. **Filtrado Dinámico por Roles (RBAC):**
   * Cada opción de la sidebar evalúa la función `can(item.permission)` del usuario activo; las secciones no autorizadas se ocultan automáticamente del árbol de navegación.
5. **Footer Integrado de Usuario:**
   * Perfil del médico o técnico en sesión, con avatar, rol activo, bandera de guardia nocturna activa (`🌙 Guardia Qx`) y selector de tema (Modo Claro / Modo Oscuro Clínico / Sistema).

---

## 4. HOJA DE RUTA EN 10 ETAPAS DE EJECUCIÓN (ROADMAP)

```
[Etapa 0-1] ──► [Etapa 2-3] ──► [Etapa 4-5] ──► [Etapa 6-7] ──► [Etapa 8-10]
Scaffolding,    Auth, Login,    Médicos JVPM,   Core SOAP,      Quirófano, UCI,
Docker, DB      Sidebar UI,     Salas, Stock    Semáforo VECCS, DTE Hacienda SV,
y Migraciones   Clientes & Pac  PEPS/FIFO       Turnos TV       PWA y Despliegue
```

### 🔹 Etapa 0: Scaffolding y Entorno de Desarrollo (Semana 1 - Días 1 a 3)
* Inicialización del proyecto Next.js 15+ con TypeScript, Tailwind CSS y App Router.
* Configuración de `docker-compose.yml` (PostgreSQL 16, Redis 7, MinIO S3).
* Creación de `.env.example` y scripts de conveniencia en `package.json`.
* Configuración de ESLint, Prettier y estructura base de carpetas.

### 🔹 Etapa 1: Modelo de Datos, Migraciones Prisma y Seed Inicial (Semana 1 - Días 4 a 7)
* Modelado en `prisma/schema.prisma` de todas las tablas diseñadas en [`02_ARQUITECTURA_Y_BASE_DE_DATOS.md`](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/02_ARQUITECTURA_Y_BASE_DE_DATOS.md).
* Ejecución de la migración inicial en PostgreSQL.
* Creación del script `prisma/seed.ts`:
  * Catálogo de Razas y Especies normalizadas (`breeds`).
  * Catálogo completo de Permisos del Sistema (RBAC).
  * Los 10 Roles Predefinidos del Sistema con sus asignaciones.
  * Departamento y Municipios de El Salvador según Ministerio de Hacienda.
* Verificación de directivas **Row-Level Security (RLS)** en el motor de base de datos.

### 🔹 Etapa 2: Autenticación, Login Profesional, Sidebar Colapsable y Contexto Multi-Sede (Semana 2)
* **Pantalla de Login Profesional:**
  * Implementación del layout Split-Screen con branding dinámico por subdominio/hospital.
  * Validación Zod con show/hide password, "Recordar sesión" y protección de rate-limiting en Redis.
  * Modal interactivo de autenticación en dos factores (2FA / MFA).
* **Sidebar Colapsable con Tooltips:**
  * Componente `CollapsibleSidebar` con animación fluida `transition-all duration-300` y atajo `Ctrl + B`.
  * Integración de `SidebarTooltip` flotante (`side="right"`) con Radix UI para el modo compacto.
  * Filtrado dinámico de ítems de menú según permisos RBAC del usuario.
* **Sesiones y Contexto Multi-Sede:**
  * Cookies `HttpOnly`, JWT rotativos y middleware de inyección `X-Branch-ID` y `app.current_tenant_id`.
  * Componente `BranchSwitcher` en la cabecera para alternar de sede según permisos (`user_branch_assignments`).

### 🔹 Etapa 3: Padrón de Clientes (Tutores) y Expediente Maestro de Pacientes (Semana 3)
* **Gestión de Clientes (`clients`):**
  * Formulario con validación de DUI (`00000000-0`), NIT, NRC y actividad económica.
  * Registro de contactos de emergencia alternativos y categorías de tutor (`VIP`, `STANDARD`, `DEBTOR`, etc.).
* **Gestión de Pacientes (`patients`):**
  * Formulario de ingreso de mascota con validador de microchips ISO 11784/11785 (15 dígitos).
  * Selector inteligente de raza con peso estándar de referencia.
  * Selector de estado reproductivo (`animal_gender`).
* **Banner Permanente de Seguridad Clínica:**
  * Componente flotante superior con alergias en rojo de alto contraste, grupo sanguíneo, patologías crónicas y alerta de temperamento/bozal.
* **Co-Propietarios (`patient_co_owners`):**
  * Interfaz para agregar familiares o cuidadores autorizados para firmar consentimientos y retirar al paciente.

### 🔹 Etapa 4: Médicos Veterinarios (JVPM) y Consultorios / Quirófanos Físicos (Semana 4)
* **Perfiles Médicos (`doctor_profiles`):**
  * Validación de Cédula de la Junta de Vigilancia de la Profesión Médico Veterinaria (JVPM).
  * Carga de firma y sello digital transparente (SVG/PNG).
  * Habilitación de facultades (`is_lead_surgeon`, `is_anesthesiologist`, `is_intensivist_icu`).
  * Asignación de agendas y turnos de guardia (`doctor_schedules`).
* **Consultorios y Salas (`rooms`):**
  * Tablero visual de estado de salas (`AVAILABLE`, `OCCUPIED`, `CLEANING_STERILIZING`, `MAINTENANCE`).
  * Asignación dinámica de médico a consultorio al iniciar jornada.
  * Inventario de equipos médicos fijos por sala.
  * Calendario de reservas de quirófanos y salas de ecografía (`room_reservations`).

### 🔹 Etapa 5: Inventario, Lotes PEPS/FIFO, Fraccionamiento y Compras (Semanas 5 a 6)
* **Catálogo de Ítems (`inventory_items`):**
  * Registro con código de barras, SKU, nombre genérico/DCI, bandera de medicamento y estupefaciente controlado.
* **Lotes y Caducidades (`inventory_lots`):**
  * Semáforo tricolor de vencimiento (🔴 <30d, 🟡 30-60d, 🟢 >60d).
  * Motor de dispensación automática bajo regla estricta **PEPS / FIFO**.
  * Bloqueo automático de lotes caducados.
* **Fraccionamiento Hospitalario (`pharmacy_open_vials`):**
  * Módulo para registrar apertura de frascos en UCI/Quirófano, control de $ml$ consumidos y caducidad post-apertura, evitando cobros duplicados al cliente.
* **Libro Digital de Estupefacientes y Psicotrópicos:**
  * Registro auditable de Ketamina, Fentanilo, Midazolam y Tramadol con médico firmante y paciente.
* **Órdenes de Compra y Proveedores (`purchase_orders`):**
  * Recepción contra Comprobante de Crédito Fiscal y recálculo de Costo Promedio Ponderado (CPP).
* **Tomas Físicas y Ajustes de Merma (`inventory_adjustments`):**
  * Conteo ciego y justificación formal de diferencias.

### 🔹 Etapa 6: Core Clínico SOAP, Recetas con QR y Medicina Preventiva (Semana 7)
* **Consulta Médica SOAP (AAHA):**
  * Registro rápido en menos de 3 minutos con constantes vitales obligatorias.
  * Checklist interactivo de examen físico por 10 sistemas orgánicos.
  * Cierre inmutable de consulta y sistema de adendas médico-legales fehacientes.
* **Recetas Médicas Digitales:**
  * Cálculo automatizado de dosis por peso ($mg/kg$).
  * Generación de PDF oficial membretado con sello, firma, cédula JVPM y Código QR público de validación.
* **Historial Médico Longitudinal 360°:**
  * Línea de tiempo unificada (Timeline) con consultas, vacunas, cirugías, analíticas e imágenes.
* **Medicina Preventiva:**
  * Carnet de vacunas y desparasitaciones con semáforo de vigencia y alertas automáticas.

### 🔹 Etapa 7: Emergencias (Semáforo VECCS), Carrito Rojo y Kiosco Smart TV (Semana 8)
* **Triaje de Emergencias (`emergency_triages`):**
  * Semáforo de 5 niveles (Rojo Inmediato, Naranja Muy Urgente, Amarillo Urgente, Verde Estándar, Azul No Urgente).
  * Evaluación rápida ABCDE en 30 segundos.
  * Transmisión instantánea de alarma sonora de "Código Rojo" en consolas de la clínica.
* **Calculadora de Carro de Paro (*Crash Cart RECOVER*):**
  * Cálculo inmediato por peso de drogas de reanimación (Epinefrina alta/baja dosis, Atropina, Naloxona, Flumazenil).
  * Metrónomo auditivo de RCP a 100-120 compresiones por minuto.
* **Sistema de Turnos para Smart TV:**
  * Interfaz de pantalla completa para televisores de sala de espera.
  * Sonido de campana polifónica (*chime*) mediante Web Audio API al llamar turno.
  * Modo salvapantallas anti-burn-in para paneles OLED.

### 🔹 Etapa 8: Quirófano, UCI 24/7 (Flowboard), Lab y Web DICOM PACS (Semanas 9 a 10)
* **Centro Quirúrgico:**
  * Estratificación de riesgo anestésico ASA (I a V + E).
  * Checklist de seguridad quirúrgica AAHA en 3 tiempos (Sign-in, Time-out, Sign-out).
  * Hoja anestésica transoperatoria minuto a minuto con signos vitales y gases.
  * Consentimiento informado digital con firma táctil en tablet (*Paperless*).
* **Pizarra de Hospitalización UCI 24/7 (Flowboard):**
  * Grilla horaria de tratamientos con estado de administración por técnicos.
  * Calculadora de Infusión Continua (CRI) y fluidoterapia.
* **Laboratorio Clínico:**
  * Carga de analitos con valores de referencia por especie y gráficas de tendencias evolutivas.
* **Imagenología DICOM PACS:**
  * Visor web médico integrado con Cornerstone.js para visualización de placas de Rayos X y Ecografía con calibración y mediciones VHS/TPLO.
* **Motor Zero-Lost-Charges:**
  * Imputación automática de medicamentos y descartables de UCI y Quirófano a la prefactura del paciente.

### 🔹 Etapa 9: Facturación Electrónica El Salvador (DTE / MH) y Peluquería (Semana 11)
* **Facturación DTE Ministerio de Hacienda:**
  * Firma criptográfica JWS (`RS512`) de documentos tributarios electrónicos.
  * Emisión de Factura Electrónica (DTE-01), Comprobante de Crédito Fiscal (DTE-03) y Nota de Crédito (DTE-05).
  * Conexión con la API del Ministerio de Hacienda (Ambiente de Pruebas `00` y Producción `01`).
  * Generación del Código de Generación (UUID v4), Número de Control y Código QR de consulta pública.
  * Modo Contingencia Offline con sincronización asíncrona mediante Redis BullMQ ante caídas de Hacienda.
  * Cortes de caja X y Z por terminal POS.
* **Módulo de Peluquería & Spa (Grooming):**
  * Tablero Kanban visual por fases de atención (Recepción ➔ Baño ➔ Secado/Corte ➔ Listo).
  * Triage dermatológico previo al baño y registro de fotos antes/después.

### 🔹 Etapa 10: Portal del Tutor PWA, WhatsApp Cloud, QA y Despliegue (Semana 12)
* **Portal del Tutor PWA:**
  * Acceso rápido sin contraseña mediante Magic Link o código OTP por WhatsApp/Email.
  * Carnet digital de vacunas con funcionamiento fuera de línea (Service Worker).
  * Visualización del estado en vivo de su mascota en UCI o Peluquería.
  * Descarga directa de recetas médicas y facturas electrónicas DTE.
* **Notificaciones WhatsApp Cloud API:**
  * Disparo automático de avisos de turnos, recordatorios preventivos y alertas de retiro de mascota.
* **Pruebas de Calidad (QA), Seguridad y Auditoría:**
  * Pruebas automatizadas de flujos críticos con Playwright y Vitest.
  * Auditoría de seguridad OWASP Top 10 y verificación de no fugas de datos entre inquilinos (RLS).
  * Pruebas de estrés y pase a producción en infraestructura cloud (Vercel / AWS / DigitalOcean).

---

## 4. CHECKLIST TÁCTICO PARA EL INICIO INMEDIATO (PASO 1)

Para iniciar formalmente el desarrollo del código en este repositorio, el orden de ejecución inmediata es el siguiente:

1. [ ] **Inicializar la aplicación Next.js 15+** en la raíz del proyecto con TypeScript, Tailwind CSS, ESLint y App Router.
2. [ ] **Crear el archivo `docker-compose.yml`** para levantar los servicios locales de PostgreSQL 16 y Redis 7.
3. [ ] **Instalar y configurar Prisma ORM**, vinculando la cadena de conexión en `.env`.
4. [ ] **Escribir el `schema.prisma` completo** reflejando con exactitud las tablas definidas en [`02_ARQUITECTURA_Y_BASE_DE_DATOS.md`](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/02_ARQUITECTURA_Y_BASE_DE_DATOS.md).
5. [ ] **Ejecutar la migración inicial** (`npx prisma migrate dev --name init`) y aplicar las políticas de Row-Level Security (RLS).
6. [ ] **Crear y ejecutar el script `seed.ts`** para poblar el catálogo de razas, roles y permisos iniciales.
7. [ ] **Construir el Layout Base** con soporte Dark Mode y el selector de sucursal (`BranchSwitcher`).
