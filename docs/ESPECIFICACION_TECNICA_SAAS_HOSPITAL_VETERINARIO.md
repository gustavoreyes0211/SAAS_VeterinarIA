# ESPECIFICACIÓN TÉCNICA Y PLAN DE IMPLEMENTACIÓN: SAAS HOSPITAL VETERINARIO & UCI
### Con Módulo de Emergencias y Semáforo de Triaje (VECCS/RECOVER), Core Clínico 360°, Quirófano, Laboratorio, Rayos X DICOM, Red Multi-Sucursal, DTE El Salvador y Portal PWA

---

## 0. DIAGNÓSTICO DE GAPS Y MEJORAS DE ARQUITECTURA

En la revisión de la plataforma para hospitales veterinarios 24/7 y centros de trauma, se identificó y solventó la necesidad de un **Módulo de Emergencias y Triaje Crítico con Semáforo de 5 Niveles**, perfectamente articulado con la consulta, el quirófano y la UCI:

1. **Módulo de Emergencias y Triaje con Semáforo (VECCS / RECOVER) (`emergency_triages`):**
   * **Inclusión mandatoria del triage de urgencias:** Escala de 5 niveles por colores con tiempos máximos de atención médica:
     * 🔴 **Rojo (Inmediato - 0 min):** Paro cardiorrespiratorio, colapso agudo, shock descompensado, estatus epiléptico, torsión gástrica (GDV), hemorragia exanguinante.
     * 🟠 **Naranja (Muy Urgente - < 15 min):** Disnea severa, politrauma mayor, intoxicación aguda mortal, dolor incontrolable.
     * 🟡 **Amarillo (Urgente - < 60 min):** Vómitos/diarreas con deshidratación, fracturas cerradas estables, hematuria.
     * 🟢 **Verde (Estándar - < 120 min):** Cojeras leves, lesiones cutáneas agudas sin compromiso sistémico.
     * 🔵 **Azul (No urgente / Rutina):** Chequeos menores sin urgencia médica.
   * **Evaluación Rápida ABCDE (Airway, Breathing, Circulation, Disability, Exposure):** Formulario de triaje ultrarrápido de 30 segundos con cálculo automático de dosis de resucitación del Carrito Rojo (*Crash Cart*: Epinefrina, Atropina, Naloxona, Lidocaína).
   * **Alarma de Código Rojo en Pantallas y Smart TVs:** Notificación visual y sonora en las estaciones de médicos y técnicos para preparar la mesa de shock/reanimación.
2. **Consultas Médicas Estructuradas (AAHA SOAP) y Examen por Sistemas (`consultations`):**
   * Constantes vitales completas (Peso, Temp, FC, FR, Presión Arterial, TLLC, Mucosas, Hidratación %, Condición Corporal 1-9 y Escala de Dolor) y checklist de 10 sistemas orgánicos.
   * Cierre médico-legal inmutable y adendas auditadas (`consultation_addendums`).
3. **Recetas Médicas Digitales con Firma JVPM y QR (`prescriptions` y `prescription_items`):**
   * Cálculo de dosis por kilogramo ($mg/kg$), generación de PDF oficial con firma y QR, envío por WhatsApp y control de estupefacientes.
4. **Historial Clínico Longitudinal 360° (Timeline Unificado del Paciente):**
   * Línea de tiempo que consolida: Emergencias, Consultas SOAP, Recetas, Vacunas, Laboratorio, Rayos X DICOM, Cirugías, UCI 24/7 y Peluquería.
5. **Centro Quirúrgico y Hoja Anestésica Transoperatoria (`surgeries` y `surgery_anesthesia_logs`):**
   * Riesgo anestésico según escala **ASA (I a V)**, checklist quirúrgico AAHA y monitoreo transoperatorio minuto a minuto ($\text{SpO}_2$, $\text{EtCO}_2$, presión arterial, temperatura y gas anestésico).
6. **Laboratorio Clínico con Gráficas de Tendencias (`lab_orders` y `lab_test_results`):**
   * Rangos de referencia automáticos por especie/edad, semáforo de valores críticos y curvas evolutivas de biomarcadores (BUN, Creatinina, Glucosa, ALT).
7. **Diagnóstico por Imagen y Visor Web DICOM/PACS (`imaging_studies`):**
   * Visor web médico integrado en el navegador (Cornerstone.js) para Rayos X y Ecografías, con mediciones ortopédicas/cardiológicas (VHS de Buchanan y TPLO).
8. **Consentimientos Informados Digitales "Cero Papel" (`digital_consent_forms`):**
   * Firma biométrica táctil en tablet para cirugías, anestesia general, fianza de internamiento y eutanasia, sellados en PDF inmutable.
9. **Módulo de Peluquería y Spa Veterinario (`grooming_sessions`):**
   * Tablero Kanban por fases, triage dermatológico pre-baño con derivación médica y aviso por WhatsApp con fotografía al finalizar.
10. **Portal del Tutor PWA (Mobile-First y Desktop) (`client_portal_access`):**
    * Acceso sin contraseñas (Magic Link/OTP), carnet de vacunas con funcionamiento offline (Service Worker), seguimiento en vivo de UCI/Spa y facturas DTE.
11. **Red Multi-Sucursal Jerárquica y Logística Inter-Sedes:**
    * Derivaciones clínicas ambulatorio-a-UCI (`patient_transfers`), traslados de farmacia inter-bodegas (`pharmacy_transfers`) y asignación de personal flotante.
12. **Facturación Electrónica Nativa de El Salvador (DTE / MH):**
    * DTE-01 (Factura), DTE-03 (Crédito Fiscal) y DTE-05 (Notas de Crédito) con firma JWS, correlativos fiscales por establecimiento (`M001`, `M002`) y contingencia offline.

---

## 1. RESUMEN EJECUTIVO Y ANÁLISIS DE MERCADO

### 1.1. Análisis Competitivo en Urgencias y Nivel Hospitalario
* **Digitail:** No cuenta con semáforo de triaje de urgencias ni calculadora de paro cardiopulmonar RECOVER.
* **ezyVet:** Tiene gestión de emergencias pero es lenta de operar en admisiones críticas donde cada segundo cuenta, y carece de integración fiscal para El Salvador.
* **Instinct EMR:** Líder en cuidados intensivos, pero sin triaje visual con semáforo para sala de espera ni conexión con Smart TVs de llamados.
* **DaySmart Vet:** Orientado a citas programadas, completamente inoperante ante colapsos agudos, shock y trauma.

### 1.2. Factores Diferenciadores de la Plataforma
1. **Semáforo de Triaje de Emergencias en Tiempo Real:**
   * Clasificación visual por colores (Rojo, Naranja, Amarillo, Verde, Azul) visible en todas las pantallas del hospital. Prioriza automáticamente la atención sobre las citas ordinarias.
2. **Calculadora del Carrito Rojo de Paro (Crash Cart Doses):**
   * Con solo ingresar el peso o peso estimado del paciente en shock, el sistema despliega las dosis exactas en $ml$ de Epinefrina, Atropina, Lidocaína y Naloxona según el protocolo RECOVER.
3. **Core Clínico Integral SOAP con Examen Físico Completo:**
   * Redacción asistida de consultas en menos de 3 minutos con checklist de 10 sistemas orgánicos y recetas automáticas por $mg/kg$.
4. **Pizarra de Urgencias y UCI Interconectadas:**
   * El paciente estabilizado en shock pasa con un solo clic a la Pizarra Flowboard UCI 24/7 o a Quirófano de Emergencia con captura automática de costos a la factura DTE.

---

## 2. ESTÁNDARES INTERNACIONALES Y FISCALES APLICADOS

* **Iniciativa RECOVER (Reassessment Campaign on Veterinary Resuscitation):** Algoritmos internacionales de soporte vital básico (BLS) y avanzado (ALS) en paro cardiorrespiratorio veterinario.
* **Escala de Triaje VECCS (Veterinary Emergency and Critical Care Society):** Clasificación por niveles de gravedad fisiológica y tiempo máximo de respuesta.
* **Estándar AAHA:** Metodología SOAP y checklist de seguridad quirúrgica.
* **Clasificación ASA:** Estratificación del riesgo anestésico (ASA I a V y Emergencia).
* **Estándar DICOM & WADO-RS:** Visor web para Rayos X y Ecografías.
* **Normativa DTE El Salvador (Ministerio de Hacienda / DGII):** DTE v3 con firma JWS RSA SHA-512, códigos de establecimiento (`M001`, `M002`) y contingencia offline con Redis BullMQ.

---

## 3. MODELO DE NEGOCIO: MATRIZ DE PLANES Y CAPACIDADES MODULARES (TIERS)

| Módulo / Capacidad | Plan Básico (Consultorio) | Plan Medio (Clínica Quirúrgica) | Plan Pro (Hospital 24/7 & Referencia) |
| :--- | :--- | :--- | :--- |
| **Público Objetivo** | Consultorios e Independientes | Clínicas con Cirugía Ambulatoria | Hospitales 24/7, Redes y Centros de Trauma |
| **Usuarios Concurrentes** | Hasta 2 usuarios | Hasta 8 usuarios | **Ilimitados con auditoría de sesiones y turnos** |
| **Sucursales y Sedes** | 1 Sucursal única | Hasta 2 Sucursales (Matriz + Satélite) | **Sucursales Ilimitadas con jerarquía y derivaciones** |
| **Módulo de Emergencias & Triaje**| Triaje simple (lista de espera) | **Semáforo 3 Colores (Rojo, Amarillo, Verde)** | **Semáforo Completo 5 Niveles (VECCS/RECOVER) + Código Rojo + Crash Cart Doses** |
| **Consultas SOAP & Examen** | Consultas generales + SOAP | Consultas especializadas + Adendas | **Consultas Ilimitadas + Timeline 360° + Adendas legales** |
| **Recetas Médicas Digitales**| Receta simple con PDF | Receta con cálculo por peso + QR | **Recetas Ilimitadas + Control Estupefacientes + WhatsApp**|
| **Quirófano & Cirugías** | No disponible | Cirugías básicas + Reporte Operatorio | **Hoja Anestésica Transoperatoria + ASA + Checklist AAHA** |
| **Laboratorio Clínico** | Resultados manuales (texto/PDF) | Paneles con rangos de ref. por especie | **Gráficas de Tendencias + Alertas de Valores Críticos** |
| **Imagenología (Rayos X/Eco)**| Solo adjuntar imagen/PDF | Almacenamiento de imágenes de estudio | **Visor Web DICOM PACS + Mediciones (VHS/TPLO)** |
| **Consentimientos Digitales** | Plantillas para imprimir | Firma en pantalla de consentimientos básicos | **Firma Biométrica en Tablet + Fianza Hospitalaria** |
| **Captura de Costos** | Registro manual | Asignación de servicios | **Motor Automático de Costos Quirúrgicos, UCI y Urgencias**|
| **Peluquería (Grooming)** | Citas simples en agenda | Tablero Kanban + Notificación de retiro | **Grooming Avanzado + Triage Cutáneo + Fotos Antes/Después** |
| **Hospitalización** | No disponible | Estancia diurna ambulatoria | **Pizarra UCI 24/7 (Flowboard) + Cálculo de Infusión (CRI)** |
| **Portal del Tutor (PWA)** | Carnet de vacunas digital básico | Citas online + Historial de vacunas | **PWA Completa + Fotos UCI en Vivo + Facturas DTE** |
| **Facturación DTE El Salvador**| Hasta 100 DTE/mes (Factura DTE-01) | Hasta 500 DTE/mes (DTE-01 + DTE-03 CCF)| **DTE Ilimitado + Multi-Caja + Contingencia BullMQ** |
| **Pantallas TV (Turnos/Triaje)**| Lista interna (Sin TV) | 1 Pantalla por sede con chime | **Pantallas Ilimitadas por sala + Alarma Código Rojo en TV**|

---

## 4. ARQUITECTURA DE BASE DE DATOS RELACIONAL (POSTGRESQL 3NF COMPLETA)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TENANTS Y SUCURSALES (CON METADATOS FISCALES DE EL SALVADOR)
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150) NOT NULL,
    nit VARCHAR(17) NOT NULL,
    nrc VARCHAR(20) NOT NULL,
    economic_activity_code VARCHAR(10) NOT NULL,
    economic_activity_name VARCHAR(200) NOT NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'SV',
    currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    subdomain VARCHAR(63) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE branch_facility_type AS ENUM (
    'MAIN_HOSPITAL_24_7', 'AMBULATORY_CLINIC', 'EMERGENCY_POST', 'DIAGNOSTIC_CENTER'
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    facility_type branch_facility_type NOT NULL DEFAULT 'MAIN_HOSPITAL_24_7',
    address TEXT NOT NULL,
    department_code CHAR(2) NOT NULL DEFAULT '06',
    municipality_code CHAR(2) NOT NULL DEFAULT '14',
    establishment_code_mh VARCHAR(4) NOT NULL DEFAULT 'M001',
    phone_e164 VARCHAR(20) NOT NULL,
    email_contact VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/El_Salvador',
    
    hospitalization_capacity INT NOT NULL DEFAULT 0,
    icu_capacity INT NOT NULL DEFAULT 0,
    has_surgery_room BOOLEAN NOT NULL DEFAULT TRUE,
    has_grooming_salon BOOLEAN NOT NULL DEFAULT TRUE,
    has_xray_imaging BOOLEAN NOT NULL DEFAULT TRUE,
    has_lab_facility BOOLEAN NOT NULL DEFAULT TRUE,
    has_emergency_service_24_7 BOOLEAN NOT NULL DEFAULT TRUE, -- Bandera de servicio de urgencias 24/7
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, code),
    UNIQUE (tenant_id, establishment_code_mh)
);
CREATE INDEX idx_branches_tenant ON branches(tenant_id);

CREATE TABLE pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    terminal_code VARCHAR(4) NOT NULL DEFAULT 'P001',
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, terminal_code)
);

-- ============================================================================
-- 2. USUARIOS, ROLES Y ASIGNACIÓN MULTI-SUCURSAL
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_e164 VARCHAR(20),
    professional_license VARCHAR(50),
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_system_role CHECK (tenant_id IS NOT NULL OR is_system_role = TRUE)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, tenant_id)
);

CREATE TABLE user_branch_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_default_branch BOOLEAN NOT NULL DEFAULT FALSE,
    can_switch_branches BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, branch_id)
);

-- ============================================================================
-- 3. CLIENTES, PACIENTES Y ACCESO PWA TUTOR
-- ============================================================================

CREATE TYPE client_tax_type AS ENUM ('CONSUMIDOR_FINAL', 'CONTRIBUYENTE_CREDITO_FISCAL', 'EXTRANJERO');

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    tax_type client_tax_type NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    dui VARCHAR(10),
    nit VARCHAR(17),
    nrc VARCHAR(20),
    economic_activity_code VARCHAR(10),
    trade_name VARCHAR(150),
    phone_e164 VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    department_code CHAR(2) NOT NULL DEFAULT '06',
    municipality_code CHAR(2) NOT NULL DEFAULT '14',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_phone ON clients(tenant_id, phone_e164);

CREATE TABLE client_portal_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
    magic_link_token_hash VARCHAR(255),
    token_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    is_portal_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE animal_gender AS ENUM ('MALE_INTACT', 'MALE_NEUTERED', 'FEMALE_INTACT', 'FEMALE_SPAYED', 'UNKNOWN');

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    gender animal_gender NOT NULL DEFAULT 'UNKNOWN',
    birth_date DATE,
    microchip_number VARCHAR(50),
    avatar_url TEXT,
    blood_type VARCHAR(20),
    known_allergies TEXT[],
    chronic_conditions TEXT[],
    is_deceased BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_patients_client ON patients(tenant_id, client_id);

CREATE TABLE patient_weight_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    weight_kg NUMERIC(6, 3) NOT NULL CHECK (weight_kg > 0),
    recorded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_weight_history_patient ON patient_weight_history(patient_id, recorded_at DESC);

CREATE TYPE vaccine_status AS ENUM ('APPLIED', 'DUE_SOON', 'EXPIRED');

CREATE TABLE vaccination_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(150) NOT NULL,
    lot_number VARCHAR(50),
    administered_at DATE NOT NULL,
    next_due_date DATE NOT NULL,
    status vaccine_status NOT NULL DEFAULT 'APPLIED',
    veterinarian_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deworming_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    administered_at DATE NOT NULL,
    next_due_date DATE NOT NULL,
    veterinarian_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. MÓDULO DE EMERGENCIAS Y TRIAJE CON SEMÁFORO (VECCS / RECOVER)
-- ============================================================================

CREATE TYPE emergency_triage_color AS ENUM (
    'RED_IMMEDIATE',       -- 🔴 Nivel 1: Reanimación inmediata (0 min). Paro, shock, coma, apnea.
    'ORANGE_VERY_URGENT',  -- 🟠 Nivel 2: Muy urgente (< 15 min). Disnea severa, trauma masivo.
    'YELLOW_URGENT',       -- 🟡 Nivel 3: Urgente (< 60 min). Deshidratación, vómito persistente.
    'GREEN_STANDARD',      -- 🟢 Nivel 4: Estándar (< 120 min). Cojera aguda, lesiones leves.
    'BLUE_NON_URGENT'      -- 🔵 Nivel 5: No urgente. Vacunas, revisiones rutinarias.
);

CREATE TYPE emergency_clinical_status AS ENUM (
    'TRIAGED',             -- Evaluado en semáforo, en espera de box
    'IN_CRASH_ROOM',       -- En mesa de shock / reanimación activa
    'STABILIZING',         -- En estabilización y fluidoterapia intensiva
    'RECOVERED_TO_CONSULT',-- Estabilizado, transferido a consulta general
    'TRANSFERRED_TO_ICU',  -- Transferido a hospitalización UCI 24/7
    'TRANSFERRED_TO_OR',   -- Transferido de urgencia a quirófano
    'DECEASED',            -- Fallecido en urgencias / RCP no exitoso
    'DISCHARGED'           -- Alta médica de urgencia
);

CREATE TABLE emergency_triages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Permite ingreso no identificado inicial
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    evaluated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    attending_vet_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    triage_color emergency_triage_color NOT NULL DEFAULT 'YELLOW_URGENT',
    clinical_status emergency_clinical_status NOT NULL DEFAULT 'TRIAGED',
    
    chief_complaint TEXT NOT NULL,                      -- Motivo de urgencia (ej. Atropello, convulsión)
    estimated_or_fast_weight_kg NUMERIC(6, 3) NOT NULL, -- Peso rápido para dosis de emergencia
    
    -- Evaluación Rápida ABCDE (Airway, Breathing, Circulation, Disability, Exposure)
    airway_status VARCHAR(30) NOT NULL DEFAULT 'PATENT', -- 'PATENT', 'PARTIALLY_OBSTRUCTED', 'INTUBATED'
    breathing_effort VARCHAR(30) NOT NULL DEFAULT 'NORMAL', -- 'NORMAL', 'DYSPNEA_MODERATE', 'DYSPNEA_SEVERE', 'AGONAL', 'APNEA'
    circulation_pulse VARCHAR(30) NOT NULL DEFAULT 'STRONG', -- 'STRONG', 'WEAK_THREADY', 'BOUNDING', 'ABSENT'
    capillary_refill_seconds NUMERIC(3, 1),
    mucous_color VARCHAR(30) NOT NULL DEFAULT 'PINK',   -- 'PINK', 'PALE', 'CYANOTIC', 'ICTERIC', 'BRICK_RED', 'GRAY'
    mental_status VARCHAR(30) NOT NULL DEFAULT 'ALERT', -- 'ALERT', 'DEPRESSED', 'STUPOROUS', 'COMATOSE', 'SEIZING'
    
    temp_celsius NUMERIC(4, 2),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    spo2_percent NUMERIC(4, 1),
    systolic_bp INT,
    glucose_mg_dl INT,                                  -- Glucemia rápida de urgencias
    lactate_mmol_l NUMERIC(4, 2),                       -- Lactato en sangre (indicador de hipoperfusión/shock)
    
    -- Dosis Rápidas de Resucitación / Carrito Rojo (Protocolo RECOVER en JSONB)
    crash_cart_dosages_json JSONB,                      -- Dosis calculadas automáticas: Epinefrina, Atropina, Naloxona
    
    assigned_shock_table VARCHAR(30),                   -- Ej: 'Box de Shock 1'
    is_code_red_broadcasted BOOLEAN NOT NULL DEFAULT FALSE, -- Alarma disparada a pantallas de hospital
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMPTZ,
    stabilized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_emergency_triage_active ON emergency_triages(tenant_id, branch_id, triage_color, clinical_status)
WHERE clinical_status IN ('TRIAGED', 'IN_CRASH_ROOM', 'STABILIZING');

-- ============================================================================
-- 5. CONSULTAS CLÍNICAS (SOAP AAHA), EXAMEN FÍSICO Y RECETAS MÉDICAS
-- ============================================================================

CREATE TYPE consultation_type AS ENUM (
    'GENERAL', 'FOLLOW_UP', 'EMERGENCY_TRIAGE', 'VACCINATION_CHECK', 'SPECIALTY', 'TELEMEDICINE'
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    veterinarian_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    turn_id UUID,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL, -- Enlace al triaje previo si viene de urgencias
    consultation_type consultation_type NOT NULL DEFAULT 'GENERAL',
    consultation_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    anamnesis_reason TEXT NOT NULL,
    current_diet TEXT,
    current_medications TEXT,
    
    -- Constantes Vitales
    weight_kg NUMERIC(6, 3) NOT NULL,
    temp_celsius NUMERIC(4, 2),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    systolic_bp INT,
    capillary_refill_seconds NUMERIC(3, 1),
    mucous_membrane_status VARCHAR(30) DEFAULT 'PINK',
    hydration_percentage NUMERIC(3, 1) DEFAULT 0.0,
    body_condition_score INT CHECK (body_condition_score BETWEEN 1 AND 9),
    pain_scale_score INT CHECK (pain_scale_score BETWEEN 0 AND 4),
    
    physical_exam_systems JSONB NOT NULL DEFAULT '{
        "eyes": {"status": "NORMAL", "notes": ""},
        "ears": {"status": "NORMAL", "notes": ""},
        "oral_cavity": {"status": "NORMAL", "notes": ""},
        "respiratory": {"status": "NORMAL", "notes": ""},
        "cardiovascular": {"status": "NORMAL", "notes": ""},
        "abdomen": {"status": "NORMAL", "notes": ""},
        "lymph_nodes": {"status": "NORMAL", "notes": ""},
        "musculoskeletal": {"status": "NORMAL", "notes": ""},
        "skin_coat": {"status": "NORMAL", "notes": ""},
        "neurological": {"status": "NORMAL", "notes": ""},
        "urogenital": {"status": "NORMAL", "notes": ""}
    }'::JSONB,
    
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment_diagnosis TEXT NOT NULL,
    differential_diagnoses TEXT[],
    plan_therapeutic_summary TEXT NOT NULL,
    
    requires_hospitalization BOOLEAN NOT NULL DEFAULT FALSE,
    requires_surgery BOOLEAN NOT NULL DEFAULT FALSE,
    requires_lab_tests BOOLEAN NOT NULL DEFAULT FALSE,
    requires_imaging BOOLEAN NOT NULL DEFAULT FALSE,
    
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_consultations_patient ON consultations(tenant_id, patient_id, consultation_date DESC);

CREATE TABLE consultation_addendums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    veterinarian_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    addendum_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    veterinarian_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    prescription_code VARCHAR(30) NOT NULL UNIQUE,
    is_controlled_narcotic BOOLEAN NOT NULL DEFAULT FALSE,
    general_indications TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prescriptions_patient ON prescriptions(tenant_id, patient_id, created_at DESC);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(150) NOT NULL,
    active_ingredient VARCHAR(150),
    dosage_text VARCHAR(100) NOT NULL,
    route_of_administration VARCHAR(50) NOT NULL,
    frequency_hours INT NOT NULL,
    duration_days INT NOT NULL,
    quantity_to_dispense VARCHAR(50) NOT NULL,
    special_instructions TEXT
);

-- ============================================================================
-- 6. CONSENTIMIENTOS INFORMADOS DIGITALES CON FIRMA BIOMÉTRICA
-- ============================================================================

CREATE TYPE consent_form_type AS ENUM (
    'SURGERY_ANESTHESIA', 'HOSPITALIZATION_ADMISSION', 'HIGH_RISK_PROCEDURE', 'EUTHANASIA_COMPASSIONATE'
);

CREATE TABLE digital_consent_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    form_type consent_form_type NOT NULL,
    title VARCHAR(150) NOT NULL,
    terms_body_text TEXT NOT NULL,
    initial_deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
    signer_full_name VARCHAR(150) NOT NULL,
    signer_id_document VARCHAR(50) NOT NULL,
    signer_signature_svg TEXT NOT NULL,
    signed_pdf_url TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- 7. QUIRÓFANO, CIRUGÍAS Y MONITOREO ANESTÉSICO
-- ============================================================================

CREATE TYPE surgery_status AS ENUM (
    'SCHEDULED', 'PRE_OP', 'IN_SURGERY', 'RECOVERY', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE asa_risk_classification AS ENUM (
    'ASA_I', 'ASA_II', 'ASA_III', 'ASA_IV', 'ASA_V', 'ASA_E'
);

CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    lead_surgeon_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    anesthesiologist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    consent_form_id UUID REFERENCES digital_consent_forms(id) ON DELETE SET NULL,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    
    surgery_name VARCHAR(150) NOT NULL,
    asa_grade asa_risk_classification NOT NULL DEFAULT 'ASA_I',
    status surgery_status NOT NULL DEFAULT 'SCHEDULED',
    checklist_sign_in_passed BOOLEAN NOT NULL DEFAULT FALSE,
    checklist_time_out_passed BOOLEAN NOT NULL DEFAULT FALSE,
    checklist_sign_out_passed BOOLEAN NOT NULL DEFAULT FALSE,
    pre_op_weight_kg NUMERIC(6, 3) NOT NULL,
    pre_medication_protocol TEXT,
    induction_agent VARCHAR(100),
    maintenance_agent VARCHAR(100) DEFAULT 'ISOFLURANE',
    surgery_start_time TIMESTAMPTZ,
    surgery_end_time TIMESTAMPTZ,
    surgical_findings_report TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE surgery_anesthesia_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    spo2_percent NUMERIC(4, 1),
    etco2_mmhg INT,
    systolic_bp INT,
    diastolic_bp INT,
    mean_bp INT,
    temp_celsius NUMERIC(4, 2),
    vaporizer_pct NUMERIC(3, 1),
    fluid_rate_ml_hr NUMERIC(6, 2),
    administered_bolus TEXT,
    notes TEXT
);

-- ============================================================================
-- 8. LABORATORIO, IMAGENOLOGÍA DICOM Y HOSPITALIZACIÓN UCI
-- ============================================================================

CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    requested_by_vet_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    category VARCHAR(30) NOT NULL,
    profile_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ORDERED',
    sample_type VARCHAR(50) NOT NULL DEFAULT 'WHOLE_BLOOD_EDTA',
    pdf_attachment_url TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    analyte_name VARCHAR(100) NOT NULL,
    analyte_code VARCHAR(30),
    measured_value NUMERIC(12, 3) NOT NULL,
    unit_of_measure VARCHAR(30) NOT NULL,
    reference_low NUMERIC(12, 3),
    reference_high NUMERIC(12, 3),
    flag VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE imaging_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    prescribed_by_vet_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    modality VARCHAR(30) NOT NULL DEFAULT 'X_RAY_DIGITAL',
    anatomical_region VARCHAR(150) NOT NULL,
    clinical_history_reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    dicom_study_instance_uid VARCHAR(128) UNIQUE,
    dicom_web_pacs_viewer_url TEXT,
    preview_jpeg_url TEXT,
    radiological_report TEXT,
    measurements_json JSONB,
    performed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hospitalizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    attending_vet_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    admission_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMPTZ,
    admission_weight_kg NUMERIC(6, 3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ADMITTED',
    admission_reason TEXT NOT NULL,
    discharge_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hospitalization_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,
    order_type VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    dosage VARCHAR(100),
    rate_ml_hr NUMERIC(6, 2),
    frequency_hours INT,
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flowboard_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES hospitalization_orders(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    administered_at TIMESTAMPTZ,
    administered_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    vital_signs_payload JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grooming_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    groomer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_type VARCHAR(30) NOT NULL DEFAULT 'BATH_BASIC',
    status VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN',
    has_matting BOOLEAN NOT NULL DEFAULT FALSE,
    has_parasites BOOLEAN NOT NULL DEFAULT FALSE,
    has_skin_lesions BOOLEAN NOT NULL DEFAULT FALSE,
    requires_medical_check BOOLEAN NOT NULL DEFAULT FALSE,
    dermatological_notes TEXT,
    photo_before_url TEXT,
    photo_after_url TEXT,
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ready_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. FACTURACIÓN ELECTRÓNICA DE EL SALVADOR (DTE) Y CAPTURA DE COSTOS
-- ============================================================================

CREATE TYPE mh_environment_type AS ENUM ('00', '01');

CREATE TABLE tenant_dte_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    environment mh_environment_type NOT NULL DEFAULT '00',
    auth_user VARCHAR(100) NOT NULL,
    api_auth_token TEXT,
    api_auth_token_expires_at TIMESTAMPTZ,
    private_key_encrypted TEXT NOT NULL,
    certificate_password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE dte_document_type AS ENUM ('01', '03', '05', '06', '14');
CREATE TYPE dte_transmission_status AS ENUM ('DRAFT', 'SIGNED', 'TRANSMITTED', 'RECEIVED', 'REJECTED', 'CONTINGENCY');

CREATE TABLE dte_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    pos_terminal_id UUID NOT NULL REFERENCES pos_terminals(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    
    -- Enlaces de origen clínico para captura automática de costos
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    surgery_id UUID REFERENCES surgeries(id) ON DELETE SET NULL,
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE SET NULL,
    grooming_session_id UUID REFERENCES grooming_sessions(id) ON DELETE SET NULL,
    lab_order_id UUID REFERENCES lab_orders(id) ON DELETE SET NULL,
    imaging_study_id UUID REFERENCES imaging_studies(id) ON DELETE SET NULL,
    
    dte_type dte_document_type NOT NULL DEFAULT '01',
    generation_code UUID NOT NULL DEFAULT gen_random_uuid(),
    control_number VARCHAR(31) NOT NULL,
    sequential_number BIGINT NOT NULL,
    transmission_status dte_transmission_status NOT NULL DEFAULT 'DRAFT',
    reception_stamp VARCHAR(50),
    mh_received_at TIMESTAMPTZ,
    
    total_exempt NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_gravado NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL,
    iva_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    iva_retention NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_payable NUMERIC(12, 2) NOT NULL,
    
    payment_method_code VARCHAR(2) NOT NULL DEFAULT '01',
    signed_jws_payload TEXT,
    qr_url TEXT,
    pdf_url TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, dte_type, control_number)
);

CREATE TABLE dte_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES dte_invoices(id) ON DELETE CASCADE,
    item_number INT NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'EMERGENCY_FEE', 'CONSULTATION', 'SURGERY', 'ANESTHESIA', 'LAB', 'IMAGING', 'HOSPITAL_DAY', 'PHARMACY', 'GROOMING'
    description VARCHAR(250) NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(12, 2) NOT NULL,
    UNIQUE(invoice_id, item_number)
);

-- ============================================================================
-- 10. HABILITACIÓN DE POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_triages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_addendums ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgery_anesthesia_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitalization_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowboard_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grooming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dte_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dte_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_emergency ON emergency_triages
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_consultations ON consultations
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_prescriptions ON prescriptions
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_surgeries ON surgeries
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_dte_invoices ON dte_invoices
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
```

---

## 5. MÓDULO DE EMERGENCIAS Y SEMÁFORO DE TRIAJE (VECCS / RECOVER)

```
        [Ingreso por Recepción / Puerta de Urgencias]
                              │
                              ▼
            [Triaje Rápido ABCDE en Tablet (30 seg)]
            (Vía aérea, esfuerzo respiratorio, pulso, TLLC, mucosas, Glasgow)
                              │
                              ▼
           ┌────────────────────────────────────────────────────────┐
           │                   SEMÁFORO DE TRIAJE                   │
           ├────────────────────────┬───────────────────────────────┤
           │ 🔴 ROJO (0 min)        │ Reanimación / Paro Inmediato  │
           │ 🟠 NARANJA (< 15 min)  │ Muy Urgente / Shock Inminente │
           │ 🟡 AMARILLO (< 60 min) │ Urgente / Dolor Agudo         │
           │ 🟢 VERDE (< 120 min)   │ Estándar / Estable            │
           │ 🔵 AZUL (No Urgente)   │ Prioridad Mínima              │
           └────────────────────────┴───────────────────────────────┘
                              │
            ¿Triaje Rojo o Naranja?
             ├── SÍ ──► [Alarma "Código Rojo" en Pantallas y Smart TV]
             │          [Mesa de Shock Asignada + Calculadora Crash Cart RECOVER]
             │          [Acceso "Break-Glass" para el Médico de Turno]
             │
             └── NO ──► [Espera en Sala con Ticket Priorizado en Pantalla TV]
```

### 5.1. Calculadora del Carrito Rojo (Crash Cart RECOVER)
Al ingresar el peso (real o estimado) de un paciente en código rojo o paro:
* El sistema calcula al instante y muestra en pantalla gigante:
  * **Epinefrina (Dosis baja / alta):** Volumen exacto en $ml$ para concentración 1:1000.
  * **Atropina:** $ml$ para bradicardia severa o paro por tono vagal.
  * **Naloxona / Flumazenil:** Reversión de opioides / benzodiacepinas.
  * **Lidocaína:** Para taquicardia ventricular sostenida.
  * **Frecuencia de Compresiones:** Metrónomo sonoro a 100-120 lpm integrado en el navegador.

---

## 6. EL HISTORIAL CLÍNICO LONGITUDINAL 360° (PATIENT EMR TIMELINE)

Línea de tiempo médica unificada que reúne cronológicamente cada interacción clínica:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 🐶 EXPEDIENTE 360°: "MAX" - Canino Golden Retriever (32.4 kg)          │
 │ Alergias: Penicilina ⚠️ | Condición Crónica: Cardiopatía Grado II     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
   [2026-10-02] 🚨 EMERGENCIA CÓDIGO ROJO: Atropellamiento vehicular
                ├─ Triaje: 🔴 Nivel 1 | Shock hipovolémico + Disnea severa
                ├─ Lactato: 6.2 mmol/L | Resucitación en Mesa de Shock 1
                └─ Estabilizado y transferido a UCI Flowboard 24/7
                                     │
   [2026-10-02] 🩻 Estudio Rayos X Tórax (2 Vistas Lateral y VD)
                ├─ Hallazgo: Neumotórax leve + Contusión pulmonar
                └─ Visor Web DICOM integrado (Cornerstone.js)
                                     │
   [2026-10-02] 🧪 Laboratorio: Panel de Gases y Hematocrito Urgente
                ├─ HCT: 28% | Lactato post-bolo: 2.8 mmol/L (Mejoría)
                └─ Gráfica de evolución en tiempo real
                                     │
   [2026-09-15] 🩺 Consulta General SOAP: Revisión de rutina previa
                └─ 💊 Receta Digital: Desparasitación interna
```

---

## 7. QUIRÓFANO, UCI FLOWBOARD, LABORATORIO Y RAYOS X DICOM

* **Quirófano:** Estratificación ASA (I a V), checklist quirúrgico AAHA y hoja de anestesia transoperatoria con registro continuo minuto a minuto.
* **Pizarra UCI 24/7 (Flowboard):** Control horario de fluidoterapia, cálculo de infusión continua (CRI) y captura directa de costos a la cuenta del paciente.
* **Laboratorio Clínico:** Paneles automatizados con rangos por especie y gráficas de tendencias evolutivas de biomarcadores.
* **Imagenología DICOM PACS:** Visor médico web con mediciones de VHS de Buchanan y ángulos TPLO.

---

## 8. MOTOR DE FACTURACIÓN ELECTRÓNICA DTE (EL SALVADOR) Y CAPTURA DE COSTOS

* **Captura Automática:** Honorarios de urgencia, maniobras de resucitación, fármacos del carrito rojo, insumos de quirófano, estudios de imagen y días de hospitalización se transfieren automáticamente a la pre-factura.
* **Emisión DTE Oficial:** Factura Electrónica (DTE-01) o Crédito Fiscal (DTE-03) en USD ($) con firma JWS, correlativos por establecimiento (`M001`, `M002`) y Código QR avalado por el Ministerio de Hacienda.

---

## 9. PORTAL DEL TUTOR (PET PARENT PORTAL - PWA MÓVIL Y DESKTOP)

* **Acceso sin Contraseña (Magic Link / WhatsApp OTP).**
* **Carnet de Vacunación Interactivo:** Con semáforo de vigencias y funcionamiento offline (Service Worker).
* **Seguimiento en Vivo:** Reportes de urgencia, estado de hospitalización UCI con fotografías y descarga de recetas médicas en PDF con código QR.

---

## 10. PLAN DE IMPLEMENTACIÓN POR FASES (SEMANAS 1 A 12)

```
[Semanas 1-2]         [Semanas 3-4]           [Semanas 5-6]           [Semanas 7-9]            [Semanas 10-12]
Fase 1: Infra Core,   Fase 2: Multi-Sede UI,  Fase 3: Emergencias &   Fase 4: Quirófano, UCI,  Fase 5: DTE Hacienda,
Multi-Sede & DB       RBAC & Subscriptions    Triaje, Core SOAP, TV   Lab & PACS Web DICOM     Portal Tutor PWA, QA
Docker, PG RLS,       Branch Switcher, JWT,   Semáforo VECCS, Recetas Hoja Anestesia, Curvas   Homologación El Salvador
Drizzle/Prisma        Stripe Subscriptions    y Tablero Grooming      Tendencias, Visor DICOM  y Lanzamiento Producción
```

### Detalle de Hitos:

* **Fase 1 (Semanas 1-2): Infraestructura Base y Modelado de Datos 3NF**
  * Entorno Docker Compose (Node.js, PostgreSQL 16 con RLS, Redis 7).
  * Migraciones DDL completas: Módulo de Emergencias (`emergency_triages`), Consultas SOAP, Recetas, Quirófano, Laboratorio, Rayos X, UCI, Peluquería y Cajas DTE.
* **Fase 2 (Semanas 3-4): Autenticación, RBAC y Multi-Sede**
  * Sesiones seguras con cookies `HttpOnly`, JWT rotativos y resolución de sede en Middleware de Next.js (`X-Branch-ID`).
  * Switcher de sucursales en barra superior y orquestación de planes SaaS con Stripe (Tiers Básico, Medio y Pro).
* **Fase 3 (Semanas 5-6): Módulo de Emergencias, Semáforo VECCS, Core SOAP y Turnos TV**
  * **Módulo de Emergencias y Triaje:** Semáforo de 5 niveles por colores, evaluación ABCDE en 30 segundos, alarma de Código Rojo y calculadora del Carrito Rojo (RECOVER).
  * **Consultas Clínicas SOAP (AAHA) y Recetas Digitales:** Cálculo automático por peso ($mg/kg$), adendas inmutables y Timeline 360°.
  * Turnos con Smart TV (Web Audio Chime + TTS) y Tablero Kanban de Peluquería con triage cutáneo.
* **Fase 4 (Semanas 7-9): Quirófano, UCI Flowboard, Laboratorio y Visor DICOM**
  * Suite quirúrgica con hoja anestésica minuto a minuto, riesgo ASA y checklist AAHA.
  * Pizarra UCI 24/7 (Flowboard) con infusión continua (CRI) y fluidoterapia.
  * Laboratorio clínico con curvas de tendencia y Visor Web DICOM (Cornerstone.js) con mediciones VHS y TPLO.
  * Consentimientos informados digitales con firma táctil en tablet y motor de captura automática de costos.
* **Fase 5 (Semanas 10-12): Facturación DTE El Salvador, Portal del Tutor PWA y Despliegue**
  * Conexión con el API del Ministerio de Hacienda de El Salvador: Firma digital JWS, homologación en Sandbox (Ambiente `00`), contingencia offline con Redis BullMQ y pase a Producción (Ambiente `01`).
  * Portal del Tutor PWA (mobile-first) con carnet de vacunas offline, recetas y seguimiento en vivo.
  * Integración con WhatsApp Cloud API para notificaciones transaccionales y auditoría de seguridad OWASP Top 10.
