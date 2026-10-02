# 02. ARQUITECTURA DE BASE DE DATOS Y SEGURIDAD RLS

Este documento contiene el modelo relacional en **Tercera Forma Normal (3NF) y Boyce-Codd (BCNF)** sobre **PostgreSQL 16**, con claves foráneas indexadas y políticas de aislamiento multi-tenant mediante **Row-Level Security (RLS)**.

---

## 1. EXTENSIONES Y ESTRUCTURA BASE

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
    has_emergency_service_24_7 BOOLEAN NOT NULL DEFAULT TRUE,
    
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
CREATE INDEX idx_pos_terminals_branch ON pos_terminals(tenant_id, branch_id);

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
CREATE INDEX idx_user_tenants_lookup ON user_tenants(tenant_id, user_id);

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
CREATE INDEX idx_user_branch_assignments ON user_branch_assignments(tenant_id, user_id, branch_id);

-- ============================================================================
-- 2.1. PERFILES MÉDICOS VETERINARIOS Y HORARIOS DE GUARDIA
-- ============================================================================

CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    jvpm_license_number VARCHAR(30) NOT NULL, -- Cédula de la Junta de Vigilancia de la Profesión Médico Veterinaria (SV)
    specialties TEXT[] NOT NULL DEFAULT '{}',
    signature_image_url TEXT,
    stamp_image_url TEXT,
    is_lead_surgeon BOOLEAN NOT NULL DEFAULT FALSE,
    is_anesthesiologist BOOLEAN NOT NULL DEFAULT FALSE,
    is_intensivist_icu BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_break_glass_authorized BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doctor_profiles_tenant ON doctor_profiles(tenant_id, user_id);

CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_night_shift BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doctor_schedules_branch ON doctor_schedules(tenant_id, branch_id, day_of_week);

-- ============================================================================
-- 3. CLIENTES (TUTORES), PACIENTES (MASCOTAS) Y ACCESO PWA
-- ============================================================================

CREATE TYPE client_tax_type AS ENUM ('CONSUMIDOR_FINAL', 'CONTRIBUYENTE_CREDITO_FISCAL', 'EXTRANJERO');
CREATE TYPE client_category_tag AS ENUM ('STANDARD', 'VIP', 'FREQUENT', 'RESCUER_SHELTER', 'DEBTOR', 'HIGH_RISK_CAUTION');

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    tax_type client_tax_type NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    category client_category_tag NOT NULL DEFAULT 'STANDARD',
    
    -- Documentos fiscales para El Salvador
    dui VARCHAR(10),
    nit VARCHAR(17),
    nrc VARCHAR(20),
    economic_activity_code VARCHAR(10),
    trade_name VARCHAR(150),
    
    -- Medios de contacto y ubicación
    phone_e164 VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    department_code CHAR(2) NOT NULL DEFAULT '06', -- 06: San Salvador
    municipality_code CHAR(2) NOT NULL DEFAULT '14', -- 14: San Salvador
    
    -- Contacto de emergencia alternativo
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Estado financiero y de cuenta corriente
    current_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    credit_limit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    
    internal_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_phone ON clients(tenant_id, phone_e164);
CREATE INDEX idx_clients_name ON clients(tenant_id, last_name, first_name);
CREATE INDEX idx_clients_dui ON clients(tenant_id, dui) WHERE dui IS NOT NULL;

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

CREATE TABLE breeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL si es raza estándar global
    species VARCHAR(50) NOT NULL, -- CANINE, FELINE, EQUINE, AVIAN, EXOTIC, LAGOMORPH
    name VARCHAR(100) NOT NULL,
    standard_weight_male_kg NUMERIC(6, 3),
    standard_weight_female_kg NUMERIC(6, 3),
    predispositions TEXT[],
    is_system_standard BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_breeds_species ON breeds(species, name);

CREATE TYPE animal_gender AS ENUM ('MALE_INTACT', 'MALE_NEUTERED', 'FEMALE_INTACT', 'FEMALE_SPAYED', 'UNKNOWN');
CREATE TYPE temperament_alert_type AS ENUM ('FRIENDLY', 'FEARFUL_AGGRESSIVE', 'REQUIRES_MUZZLE', 'FRACTIOUS_CAT', 'HIGH_STRESS_CARDIOPATH', 'NO_DOGS_COMPATIBLE');

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    breed_id UUID REFERENCES breeds(id) ON DELETE SET NULL,
    
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL DEFAULT 'CANINE', -- CANINE, FELINE, etc.
    breed VARCHAR(100), -- Nombre de raza texto o fallback
    gender animal_gender NOT NULL DEFAULT 'UNKNOWN',
    birth_date DATE,
    estimated_age_months INT,
    
    -- Identificación electrónica y física
    microchip_number VARCHAR(50),
    tattoo_number VARCHAR(50),
    avatar_url TEXT,
    coat_color VARCHAR(100),
    distinctive_markings TEXT,
    
    -- Banderas críticas de seguridad clínica
    blood_type VARCHAR(20), -- DEA 1.1 Pos/Neg (Caninos), Tipo A/B/AB (Felinos)
    temperament_alert temperament_alert_type NOT NULL DEFAULT 'FRIENDLY',
    known_allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    
    -- Estado vital
    is_deceased BOOLEAN NOT NULL DEFAULT FALSE,
    deceased_at TIMESTAMPTZ,
    deceased_reason TEXT,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_patients_client ON patients(tenant_id, client_id);
CREATE INDEX idx_patients_microchip ON patients(tenant_id, microchip_number) WHERE microchip_number IS NOT NULL;
CREATE INDEX idx_patients_name ON patients(tenant_id, name);

CREATE TABLE patient_co_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'CO_OWNER', -- SPOUSE, FAMILY_MEMBER, CAREGIVER, LEGAL_AUTHORIZED
    is_authorized_to_sign_consent BOOLEAN NOT NULL DEFAULT TRUE,
    is_authorized_to_pick_up BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, client_id)
);
CREATE INDEX idx_co_owners_lookup ON patient_co_owners(tenant_id, client_id, patient_id);

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
CREATE INDEX idx_vaccinations_patient ON vaccination_records(patient_id, next_due_date);

CREATE TABLE deworming_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'INTERNAL', -- INTERNAL, EXTERNAL, COMBINED
    administered_at DATE NOT NULL,
    next_due_date DATE NOT NULL,
    veterinarian_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE antiparasitic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    product_name VARCHAR(150) NOT NULL, -- Bravecto, NexGard, Simparica, Revolution
    target_parasites VARCHAR(50) NOT NULL DEFAULT 'FLEAS_TICKS', -- FLEAS_TICKS, HEARTWORM, BROAD_SPECTRUM
    administered_at DATE NOT NULL,
    next_due_date DATE NOT NULL,
    veterinarian_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_antiparasitic_patient ON antiparasitic_records(patient_id, next_due_date);

-- ============================================================================
-- 3.1. CONSULTORIOS, QUIRÓFANOS Y SALAS FÍSICAS (ROOMS)
-- ============================================================================

CREATE TYPE room_type AS ENUM (
    'CONSULTATION_GENERAL', 'CONSULTATION_SPECIALTY', 'SURGERY_ROOM', 'ICU_ROOM', 'XRAY_ROOM', 'TRIAGE_ROOM', 'GROOMING_ROOM'
);

CREATE TYPE room_operational_status AS ENUM (
    'AVAILABLE', 'OCCUPIED', 'CLEANING_STERILIZING', 'MAINTENANCE'
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    room_type room_type NOT NULL DEFAULT 'CONSULTATION_GENERAL',
    status room_operational_status NOT NULL DEFAULT 'AVAILABLE',
    current_doctor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    equipment_list JSONB NOT NULL DEFAULT '[]'::JSONB,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, code)
);
CREATE INDEX idx_rooms_branch_status ON rooms(tenant_id, branch_id, status);

CREATE TABLE room_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    reserved_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    purpose VARCHAR(150) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_room_reservations_time ON room_reservations(room_id, start_time, end_time);

-- ============================================================================
-- 4. MÓDULO DE EMERGENCIAS Y TRIAJE (VECCS / RECOVER)
-- ============================================================================

CREATE TYPE emergency_triage_color AS ENUM (
    'RED_IMMEDIATE', 'ORANGE_VERY_URGENT', 'YELLOW_URGENT', 'GREEN_STANDARD', 'BLUE_NON_URGENT'
);

CREATE TYPE emergency_clinical_status AS ENUM (
    'TRIAGED', 'IN_CRASH_ROOM', 'STABILIZING', 'RECOVERED_TO_CONSULT', 'TRANSFERRED_TO_ICU', 'TRANSFERRED_TO_OR', 'DECEASED', 'DISCHARGED'
);

CREATE TABLE emergency_triages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    evaluated_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    attending_vet_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    triage_color emergency_triage_color NOT NULL DEFAULT 'YELLOW_URGENT',
    clinical_status emergency_clinical_status NOT NULL DEFAULT 'TRIAGED',
    
    chief_complaint TEXT NOT NULL,
    estimated_or_fast_weight_kg NUMERIC(6, 3) NOT NULL,
    airway_status VARCHAR(30) NOT NULL DEFAULT 'PATENT',
    breathing_effort VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    circulation_pulse VARCHAR(30) NOT NULL DEFAULT 'STRONG',
    capillary_refill_seconds NUMERIC(3, 1),
    mucous_color VARCHAR(30) NOT NULL DEFAULT 'PINK',
    mental_status VARCHAR(30) NOT NULL DEFAULT 'ALERT',
    temp_celsius NUMERIC(4, 2),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    spo2_percent NUMERIC(4, 1),
    systolic_bp INT,
    glucose_mg_dl INT,
    lactate_mmol_l NUMERIC(4, 2),
    crash_cart_dosages_json JSONB,
    assigned_shock_table VARCHAR(30),
    assigned_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    is_code_red_broadcasted BOOLEAN NOT NULL DEFAULT FALSE,
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMPTZ,
    stabilized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_emergency_triage_active ON emergency_triages(tenant_id, branch_id, triage_color, clinical_status)
WHERE clinical_status IN ('TRIAGED', 'IN_CRASH_ROOM', 'STABILIZING');

-- ============================================================================
-- 5. CONSULTAS CLÍNICAS (SOAP AAHA), EXAMEN FÍSICO Y RECETAS
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
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    turn_id UUID,
    emergency_triage_id UUID REFERENCES emergency_triages(id) ON DELETE SET NULL,
    consultation_type consultation_type NOT NULL DEFAULT 'GENERAL',
    consultation_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    anamnesis_reason TEXT NOT NULL,
    current_diet TEXT,
    current_medications TEXT,
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
    
    physical_exam_systems JSONB NOT NULL DEFAULT '{}'::JSONB,
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
-- 6. QUIRÓFANO, CIRUGÍAS Y CONSENTIMIENTOS DIGITALES
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
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
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
-- 7. LABORATORIO, IMAGENOLOGÍA DICOM Y HOSPITALIZACIÓN UCI
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
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
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
-- 8. INVENTARIO INTEGRAL, FARMACIA HOSPITALARIA, COMPRAS Y CONTROL DE LOTES (PEPS/FIFO)
-- ============================================================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(150),
    nit VARCHAR(17),
    nrc VARCHAR(20),
    contact_name VARCHAR(100),
    phone_e164 VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    credit_days INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);

CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30),
    description TEXT,
    parent_category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    sku VARCHAR(50) NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150), -- Principio activo / DCI
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'UNIT', -- TABLET, VIAL, ML, MG, KG, BOX, PACK
    is_medication BOOLEAN NOT NULL DEFAULT FALSE,
    is_controlled_narcotic BOOLEAN NOT NULL DEFAULT FALSE, -- Fentanilo, Ketamina, Midazolam
    is_fractionable BOOLEAN NOT NULL DEFAULT FALSE,
    total_volume_per_vial_ml NUMERIC(10, 3),
    concentration_mg_per_ml NUMERIC(10, 3),
    cost_price_average NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    sale_price NUMERIC(12, 4) NOT NULL,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 13.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sku)
);
CREATE INDEX idx_inventory_items_barcode ON inventory_items(tenant_id, barcode);

CREATE TABLE inventory_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    current_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    minimum_alert_stock NUMERIC(12, 3) NOT NULL DEFAULT 5.000,
    reorder_quantity NUMERIC(12, 3) NOT NULL DEFAULT 20.000,
    location_bin VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, item_id)
);
CREATE INDEX idx_inventory_stocks_branch ON inventory_stocks(tenant_id, branch_id);

CREATE TABLE inventory_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    lot_number VARCHAR(50) NOT NULL,
    expiration_date DATE NOT NULL,
    initial_quantity NUMERIC(12, 3) NOT NULL,
    current_quantity NUMERIC(12, 3) NOT NULL CHECK (current_quantity >= 0),
    purchase_cost_unit NUMERIC(12, 4) NOT NULL,
    is_exhausted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_lots_peps_fifo ON inventory_lots(tenant_id, branch_id, item_id, expiration_date ASC);

CREATE TABLE pharmacy_open_vials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    lot_id UUID NOT NULL REFERENCES inventory_lots(id) ON DELETE RESTRICT,
    opened_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    initial_volume_ml NUMERIC(10, 3) NOT NULL,
    remaining_volume_ml NUMERIC(10, 3) NOT NULL CHECK (remaining_volume_ml >= 0),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_after_opening_at TIMESTAMPTZ NOT NULL,
    is_exhausted BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_open_vials_active ON pharmacy_open_vials(tenant_id, branch_id, item_id) WHERE is_exhausted = FALSE;

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    po_number VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ORDERED, RECEIVED, CANCELLED
    supplier_invoice_number VARCHAR(50),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    ordered_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, po_number)
);

CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_ordered NUMERIC(12, 3) NOT NULL,
    quantity_received NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
    unit_cost NUMERIC(12, 4) NOT NULL,
    lot_number VARCHAR(50),
    expiration_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL
);

CREATE TABLE inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
    adjustment_type VARCHAR(30) NOT NULL, -- EXPIRATION, DAMAGE_BREAKAGE, PHYSICAL_COUNT_SURPLUS, PHYSICAL_COUNT_DEFICIT, CLINICAL_SHRINKAGE
    quantity_adjusted NUMERIC(12, 3) NOT NULL,
    justification TEXT NOT NULL,
    authorized_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    target_branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    transfer_code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, IN_TRANSIT, RECEIVED, CANCELLED
    requested_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sent_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    received_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, transfer_code)
);

CREATE TABLE inventory_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
    quantity_sent NUMERIC(12, 3) NOT NULL,
    quantity_received NUMERIC(12, 3) NOT NULL DEFAULT 0.000
);

-- ============================================================================
-- 9. FACTURACIÓN ELECTRÓNICA DTE (EL SALVADOR)
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
    
    -- Enlaces de origen clínico
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
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL,
    item_number INT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    description VARCHAR(250) NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(12, 2) NOT NULL,
    UNIQUE(invoice_id, item_number)
);

-- ============================================================================
-- 10. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_co_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE deworming_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE antiparasitic_records ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_open_vials ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dte_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dte_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_clients ON clients
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_patients ON patients
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_patient_co_owners ON patient_co_owners
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_doctor_profiles ON doctor_profiles
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_rooms ON rooms
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_emergency ON emergency_triages
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_consultations ON consultations
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_prescriptions ON prescriptions
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_surgeries ON surgeries
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_inventory_items ON inventory_items
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_inventory_stocks ON inventory_stocks
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_inventory_lots ON inventory_lots
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_purchase_orders ON purchase_orders
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

CREATE POLICY tenant_isolation_dte_invoices ON dte_invoices
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
```
