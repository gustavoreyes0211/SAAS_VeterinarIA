# 🏥 SAAS HOSPITAL VETERINARIO & UCI: DOCUMENTACIÓN TÉCNICA MAESTRA

Bienvenido a la documentación técnica, arquitectónica y operativa del SaaS para hospitales veterinarios, redes multi-sucursales, clínicas con quirófano y centros de emergencias 24/7.

Para evitar documentos monolíticos y facilitar el desarrollo por módulos, la especificación se encuentra estructurada en **10 documentos temáticos independientes y navegables**:

---

## 🗺️ MAPA DE NAVEGACIÓN MODULAR

```
docs/
├── README.md                                          <-- (Estás aquí) Índice General y Guía Rápida
├── 01_NEGOCIO_Y_PLANES.md                             <-- Matriz de Tiers (Básico, Medio, Pro) y Benchmarking
├── 02_ARQUITECTURA_Y_BASE_DE_DATOS.md                 <-- DDL PostgreSQL 3NF, Esquemas, Índices y RLS
├── 03_CORE_CLINICO_Y_HOSPITALARIO.md                  <-- Consultas SOAP, Historial 360°, Quirófano, UCI y Rayos X
├── 04_EMERGENCIAS_Y_TRIAJE.md                         <-- Semáforo de 5 Niveles (VECCS/RECOVER) y Carrito Rojo
├── 05_RED_MULTI_SUCURSAL.md                           <-- Red de Sedes, Traslado de Pacientes y Logística Stock
├── 06_FACTURACION_DTE_EL_SALVADOR.md                  <-- Facturación Electrónica (DTE MH), JWS, QR y Contingencia
├── 07_PELUQUERIA_PORTAL_TUTOR_Y_TV.md                 <-- Grooming Kanban, Portal del Tutor PWA y Smart TV
├── 08_PLAN_DE_IMPLEMENTACION_Y_FASES.md               <-- Cronograma de 12 semanas, Hitos y Despliegue
├── 09_USUARIOS_PERMISOS_INVENTARIO_Y_CONSULTORIOS.md  <-- Médicos, Consultorios, Inventario PEPS y Matriz RBAC
└── 10_GESTION_CLIENTES_Y_PACIENTES.md                 <-- Clientes/Tutores, Mascotas, Razas, Co-propietarios y Vacunas
```

---

## 📚 GUÍA DE CONTENIDO POR DOCUMENTO

### 1. [01. Modelo de Negocio y Matriz de Planes (Tiers)](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/01_NEGOCIO_Y_PLANES.md)
* **Público:** Dirección Comercial, Product Managers y Finanzas.
* **Contenido:**
  * Benchmarking frente a Digitail, ezyVet, Instinct EMR y DaySmart.
  * Matriz comparativa de capacidades: Plan Básico (Consultorios), Plan Medio (Clínicas Quirúrgicas) y Plan Pro (Hospitales 24/7 y Referencia).
  * Cuotas de usuarios concurrentes, almacenamiento en la nube y límites de emisión fiscal.

### 2. [02. Arquitectura de Base de Datos y Seguridad RLS](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/02_ARQUITECTURA_Y_BASE_DE_DATOS.md)
* **Público:** Ingenieros Backend, DBAs y Arquitectos de Software.
* **Contenido:**
  * Script DDL completo en PostgreSQL 16 normalizado en 3NF y BCNF.
  * Todas las tablas con claves foráneas e índices de alto rendimiento.
  * Habilitación de políticas **Row-Level Security (RLS)** por `tenant_id` y función de contexto seguro de sesión.

### 3. [03. Core Clínico, Quirófano, UCI y Diagnóstico](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/03_CORE_CLINICO_Y_HOSPITALARIO.md)
* **Público:** Veterinarios, Diseñadores UX/UI y Desarrolladores Frontend/Backend.
* **Contenido:**
  * Consultas Médicas SOAP (AAHA) con examen físico sistemático de 10 sistemas orgánicos.
  * Adendas médico-legales inmutables y recetas médicas digitales con QR y cédula JVPM.
  * Historial Clínico Longitudinal 360° (Timeline médico unificado).
  * Centro Quirúrgico: Hoja anestésica minuto a minuto, riesgo ASA y checklist AAHA.
  * Pizarra UCI 24/7 (Flowboard) con infusión continua (CRI) y fluidoterapia.
  * Laboratorio Clínico con curvas de tendencia y Visor Web DICOM PACS (Rayos X y Ecografía con medición VHS/TPLO).
  * Consentimientos informados "Cero Papel" con firma táctil en tablet y Motor Zero-Lost-Charges.

### 4. [04. Emergencias y Semáforo de Triaje](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/04_EMERGENCIAS_Y_TRIAJE.md)
* **Público:** Médicos de Urgencias, Técnicos Veterinarios y Desarrolladores de Tiempo Real.
* **Contenido:**
  * Semáforo de Triaje de 5 Niveles según estándar internacional VECCS / RECOVER (Rojo, Naranja, Amarillo, Verde, Azul).
  * Evaluación ultrarrápida ABCDE en 30 segundos.
  * Calculadora automática del Carrito Rojo (*Crash Cart*: Epinefrina, Atropina, Naloxona) y metrónomo de RCP.
  * Alarma sonora y visual de "Código Rojo" en consolas y Smart TVs.

### 5. [05. Red Multi-Sucursal y Logística Inter-Sedes](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/05_RED_MULTI_SUCURSAL.md)
* **Público:** Gerentes de Operaciones y Desarrolladores de Infraestructura.
* **Contenido:**
  * Jerarquía de establecimientos: Hospital Matriz 24/7 vs Clínicas Satélites.
  * Módulo de derivaciones clínicas de pacientes en ambulancia con reserva de jaula UCI.
  * Transferencias de inventario de farmacia inter-bodegas con doble confirmación en Kardex.
  * Selector dinámico de sucursal en el Frontend (*Branch Switcher*) con permisos por sede.

### 6. [06. Facturación Electrónica de El Salvador (DTE / MH)](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/06_FACTURACION_DTE_EL_SALVADOR.md)
* **Público:** Desarrolladores de Integraciones Fiscales, Contabilidad y Finanzas.
* **Contenido:**
  * Factura Electrónica (DTE-01), Comprobante de Crédito Fiscal (DTE-03) y Notas de Crédito (DTE-05).
  * Algoritmo de firma digital criptográfica JWS (RSA SHA-512).
  * Generación de Número de Control oficial por Establecimiento (`M001`, `M002`) y Código de Generación (UUID v4).
  * Representación Gráfica (PDF) con Código QR oficial del Ministerio de Hacienda.
  * Modo Contingencia Offline con sincronización asíncrona mediante Redis BullMQ.

### 7. [07. Peluquería, Portal del Tutor PWA y Smart TV](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/07_PELUQUERIA_PORTAL_TUTOR_Y_TV.md)
* **Público:** Estilistas Caninos, Desarrolladores Frontend Mobile y Tutores de Mascotas.
* **Contenido:**
  * Módulo de Grooming & Spa: Tablero Kanban por fases, triage dermatológico y aviso WhatsApp al terminar.
  * Portal del Tutor PWA (Mobile-First y PC): Acceso sin contraseña (Magic Link/OTP), carnet de vacunas interactivo con funcionamiento offline (Service Worker) y descarga de facturas DTE.
  * Sistema de Turnos para Smart TV: Sintetizador Web Audio API de chime polifónico y modo anti-burn-in para paneles OLED.

### 8. [08. Plan Maestro de Implementación y Guía de Inicio (Kickoff)](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/08_PLAN_DE_IMPLEMENTACION_Y_FASES.md)
* **Público:** Project Managers, Tech Leads, Diseñadores UI/UX y Desarrolladores Fullstack.
* **Contenido:**
  * **Stack Tecnológico:** Next.js 15+ App Router, TypeScript, Tailwind CSS, PostgreSQL 16, Prisma ORM, Redis 7 (BullMQ) y Cornerstone.js.
  * **Diseño UI/UX:** Pantalla de Login Profesional split-screen con 2FA/MFA y **Sidebar Colapsable (260px a 68px)** con **Tooltips Flotantes Dinámicos** y atajo `Ctrl + B`.
  * **Estructura de Directorios:** Arquitectura modular por dominio clínico y hospitalario.
  * **Hoja de Ruta en 10 Etapas:** Cronograma detallado desde scaffolding y base de datos hasta DTE y despliegue.
  * **Checklist Táctico de Kickoff:** Pasos inmediatos y ejecutables para comenzar a programar la aplicación.

### 9. [09. Usuarios, Permisos (RBAC), Inventario, Médicos y Consultorios](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/09_USUARIOS_PERMISOS_INVENTARIO_Y_CONSULTORIOS.md)
* **Público:** Administradores Hospitalarios, Encargados de Farmacia, Directores Médicos y Oficiales de Seguridad.
* **Contenido:**
  * **Perfiles Médicos:** Cédula oficial JVPM (El Salvador), firma/sello digitalizado, facultades quirúrgicas y protocolo de emergencia *"Break-Glass"*.
  * **Gestión de Consultorios y Salas:** Máquina de estados (`AVAILABLE`, `OCCUPIED`, `CLEANING_STERILIZING`, `MAINTENANCE`), equipamiento médico por sala, llamada de turnos en Smart TV y reservas de quirófano.
  * **Inventario y Farmacia Hospitalaria:** Proveedores, órdenes de compra con Costo Promedio Ponderado (CPP), control de lotes y semáforo de vencimiento bajo rotación PEPS/FIFO estricta.
  * **Fraccionamiento UCI y Quirófano:** Control de viales abiertos (`pharmacy_open_vials`) con mililitros exactos administrados, sin cobros duplicados ni mermas ocultas.
  * **Libro de Estupefacientes Controlados:** Registro obligatorio para Ketamina, Fentanilo, Midazolam y Tramadol.
  * **Matriz Granular RBAC:** Catálogo exhaustivo de permisos por módulo, tabla comparativa de los 10 roles predefinidos del sistema y soporte de roles personalizados por hospital.

### 10. [10. Gestión Integral de Clientes y Pacientes](file:///c:/Users/djgar/OneDrive/Desktop/VeterinarIA_Next/docs/10_GESTION_CLIENTES_Y_PACIENTES.md)
* **Público:** Recepción, Médicos Veterinarios, Técnicos Hospitalarios y Dirección Médica.
* **Contenido:**
  * **Expediente del Cliente (Tutor):** Registro fiscal de El Salvador (DUI, NIT, NRC, actividad económica), teléfono principal y secundario, contacto de emergencia alternativo, categorías (VIP, Estándar, Refugio, Moroso) y estado de cuenta corriente / depósitos.
  * **Expediente del Paciente (Mascota):** Identificación con Microchip ISO 11784/11785 (15 dígitos), catálogo de razas normalizado (`breeds`), señas particulares y avatar.
  * **Banner Permanente de Seguridad Clínica:** Alergias medicamentosas en alto contraste rojo, tipo sanguíneo (DEA 1.1 / Tipo A-B), patologías crónicas y alertas de temperamento / bozal obligatorio / Cat Friendly.
  * **Co-Propietarios y Tutores Secundarios:** Vínculos familiares con facultades diferenciadas (autorización para firmar consentimientos y retiro del paciente).
  * **Medicina Preventiva:** Curva de peso histórica, carnet de vacunación, desparasitaciones internas y externas (antipulgas/garrapatas) con semáforos de vigencia.
  * **Protocolo de Defunción:** Cierre respetuoso, desactivación inmediata de mensajería comercial y emisión de certificado de defunción / eutanasia con firma JVPM.


