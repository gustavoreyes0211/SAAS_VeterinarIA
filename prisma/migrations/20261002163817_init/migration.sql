-- CreateEnum
CREATE TYPE "BranchFacilityType" AS ENUM ('MAIN_HOSPITAL_24_7', 'AMBULATORY_CLINIC', 'EMERGENCY_POST', 'DIAGNOSTIC_CENTER');

-- CreateEnum
CREATE TYPE "ClientTaxType" AS ENUM ('CONSUMIDOR_FINAL', 'CONTRIBUYENTE_CREDITO_FISCAL', 'EXTRANJERO');

-- CreateEnum
CREATE TYPE "ClientCategoryTag" AS ENUM ('STANDARD', 'VIP', 'FREQUENT', 'RESCUER_SHELTER', 'DEBTOR', 'HIGH_RISK_CAUTION');

-- CreateEnum
CREATE TYPE "AnimalGender" AS ENUM ('MALE_INTACT', 'MALE_NEUTERED', 'FEMALE_INTACT', 'FEMALE_SPAYED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TemperamentAlertType" AS ENUM ('FRIENDLY', 'FEARFUL_AGGRESSIVE', 'REQUIRES_MUZZLE', 'FRACTIOUS_CAT', 'HIGH_STRESS_CARDIOPATH', 'NO_DOGS_COMPATIBLE');

-- CreateEnum
CREATE TYPE "VaccineStatus" AS ENUM ('APPLIED', 'DUE_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('CONSULTATION_GENERAL', 'CONSULTATION_SPECIALTY', 'SURGERY_ROOM', 'ICU_ROOM', 'XRAY_ROOM', 'TRIAGE_ROOM', 'GROOMING_ROOM');

-- CreateEnum
CREATE TYPE "RoomOperationalStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING_STERILIZING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "EmergencyTriageColor" AS ENUM ('RED_IMMEDIATE', 'ORANGE_VERY_URGENT', 'YELLOW_URGENT', 'GREEN_STANDARD', 'BLUE_NON_URGENT');

-- CreateEnum
CREATE TYPE "EmergencyClinicalStatus" AS ENUM ('TRIAGED', 'IN_CRASH_ROOM', 'STABILIZING', 'RECOVERED_TO_CONSULT', 'TRANSFERRED_TO_ICU', 'TRANSFERRED_TO_OR', 'DECEASED', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('GENERAL', 'FOLLOW_UP', 'EMERGENCY_TRIAGE', 'VACCINATION_CHECK', 'SPECIALTY', 'TELEMEDICINE');

-- CreateEnum
CREATE TYPE "ConsentFormType" AS ENUM ('SURGERY_ANESTHESIA', 'HOSPITALIZATION_ADMISSION', 'HIGH_RISK_PROCEDURE', 'EUTHANASIA_COMPASSIONATE');

-- CreateEnum
CREATE TYPE "SurgeryStatus" AS ENUM ('SCHEDULED', 'PRE_OP', 'IN_SURGERY', 'RECOVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AsaRiskClassification" AS ENUM ('ASA_I', 'ASA_II', 'ASA_III', 'ASA_IV', 'ASA_V', 'ASA_E');

-- CreateEnum
CREATE TYPE "MhEnvironmentType" AS ENUM ('00', '01');

-- CreateEnum
CREATE TYPE "DteDocumentType" AS ENUM ('01', '03', '05', '06', '14');

-- CreateEnum
CREATE TYPE "DteTransmissionStatus" AS ENUM ('DRAFT', 'SIGNED', 'TRANSMITTED', 'RECEIVED', 'REJECTED', 'CONTINGENCY');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "legal_name" VARCHAR(150) NOT NULL,
    "trade_name" VARCHAR(150) NOT NULL,
    "nit" VARCHAR(17) NOT NULL,
    "nrc" VARCHAR(20) NOT NULL,
    "economic_activity_code" VARCHAR(10) NOT NULL,
    "economic_activity_name" VARCHAR(200) NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'SV',
    "currency_code" CHAR(3) NOT NULL DEFAULT 'USD',
    "subdomain" VARCHAR(63) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "parent_branch_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "facility_type" "BranchFacilityType" NOT NULL DEFAULT 'MAIN_HOSPITAL_24_7',
    "address" TEXT NOT NULL,
    "department_code" CHAR(2) NOT NULL DEFAULT '06',
    "municipality_code" CHAR(2) NOT NULL DEFAULT '14',
    "establishment_code_mh" VARCHAR(4) NOT NULL DEFAULT 'M001',
    "phone_e164" VARCHAR(20) NOT NULL,
    "email_contact" VARCHAR(255) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/El_Salvador',
    "hospitalization_capacity" INTEGER NOT NULL DEFAULT 0,
    "icu_capacity" INTEGER NOT NULL DEFAULT 0,
    "has_surgery_room" BOOLEAN NOT NULL DEFAULT true,
    "has_grooming_salon" BOOLEAN NOT NULL DEFAULT true,
    "has_xray_imaging" BOOLEAN NOT NULL DEFAULT true,
    "has_lab_facility" BOOLEAN NOT NULL DEFAULT true,
    "has_emergency_service_24_7" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_terminals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "terminal_code" VARCHAR(4) NOT NULL DEFAULT 'P001',
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pos_terminals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "phone_e164" VARCHAR(20),
    "professional_license" VARCHAR(50),
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "name" VARCHAR(50) NOT NULL,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_tenants" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_branch_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "role_id" UUID,
    "is_default_branch" BOOLEAN NOT NULL DEFAULT false,
    "can_switch_branches" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_branch_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "jvpm_license_number" VARCHAR(30) NOT NULL,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "signature_image_url" TEXT,
    "stamp_image_url" TEXT,
    "is_lead_surgeon" BOOLEAN NOT NULL DEFAULT false,
    "is_anesthesiologist" BOOLEAN NOT NULL DEFAULT false,
    "is_intensivist_icu" BOOLEAN NOT NULL DEFAULT false,
    "emergency_break_glass_authorized" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "is_night_shift" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "tax_type" "ClientTaxType" NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    "category" "ClientCategoryTag" NOT NULL DEFAULT 'STANDARD',
    "dui" VARCHAR(10),
    "nit" VARCHAR(17),
    "nrc" VARCHAR(20),
    "economic_activity_code" VARCHAR(10),
    "trade_name" VARCHAR(150),
    "phone_e164" VARCHAR(20) NOT NULL,
    "secondary_phone" VARCHAR(20),
    "email" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "department_code" CHAR(2) NOT NULL DEFAULT '06',
    "municipality_code" CHAR(2) NOT NULL DEFAULT '14',
    "emergency_contact_name" VARCHAR(100),
    "emergency_contact_phone" VARCHAR(20),
    "emergency_contact_relationship" VARCHAR(50),
    "current_balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "credit_limit" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "internal_notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_portal_access" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "magic_link_token_hash" VARCHAR(255),
    "token_expires_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "last_login_ip" VARCHAR(45),
    "is_portal_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_portal_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeds" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "species" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "standard_weight_male_kg" DECIMAL(6,3),
    "standard_weight_female_kg" DECIMAL(6,3),
    "predispositions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_system_standard" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "breed_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "species" VARCHAR(50) NOT NULL DEFAULT 'CANINE',
    "breed" VARCHAR(100),
    "gender" "AnimalGender" NOT NULL DEFAULT 'UNKNOWN',
    "birth_date" DATE,
    "estimated_age_months" INTEGER,
    "microchip_number" VARCHAR(50),
    "tattoo_number" VARCHAR(50),
    "avatar_url" TEXT,
    "coat_color" VARCHAR(100),
    "distinctive_markings" TEXT,
    "blood_type" VARCHAR(20),
    "temperament_alert" "TemperamentAlertType" NOT NULL DEFAULT 'FRIENDLY',
    "known_allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronic_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_deceased" BOOLEAN NOT NULL DEFAULT false,
    "deceased_at" TIMESTAMPTZ,
    "deceased_reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_co_owners" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "relationship_type" VARCHAR(50) NOT NULL DEFAULT 'CO_OWNER',
    "is_authorized_to_sign_consent" BOOLEAN NOT NULL DEFAULT true,
    "is_authorized_to_pick_up" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_co_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_weight_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "branch_id" UUID,
    "weight_kg" DECIMAL(6,3) NOT NULL,
    "recorded_by_user_id" UUID,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_weight_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccination_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "vaccine_name" VARCHAR(150) NOT NULL,
    "lot_number" VARCHAR(50),
    "administered_at" DATE NOT NULL,
    "next_due_date" DATE NOT NULL,
    "status" "VaccineStatus" NOT NULL DEFAULT 'APPLIED',
    "veterinarian_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vaccination_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deworming_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "product_name" VARCHAR(150) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    "administered_at" DATE NOT NULL,
    "next_due_date" DATE NOT NULL,
    "veterinarian_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deworming_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antiparasitic_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "product_name" VARCHAR(150) NOT NULL,
    "target_parasites" VARCHAR(50) NOT NULL DEFAULT 'FLEAS_TICKS',
    "administered_at" DATE NOT NULL,
    "next_due_date" DATE NOT NULL,
    "veterinarian_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "antiparasitic_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "room_type" "RoomType" NOT NULL DEFAULT 'CONSULTATION_GENERAL',
    "status" "RoomOperationalStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_doctor_user_id" UUID,
    "current_patient_id" UUID,
    "equipment_list" JSONB NOT NULL DEFAULT '[]',
    "display_order" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "reserved_by_user_id" UUID NOT NULL,
    "patient_id" UUID,
    "purpose" VARCHAR(150) NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_triages" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID,
    "client_id" UUID,
    "evaluated_by_user_id" UUID NOT NULL,
    "attending_vet_id" UUID,
    "triage_color" "EmergencyTriageColor" NOT NULL DEFAULT 'YELLOW_URGENT',
    "clinical_status" "EmergencyClinicalStatus" NOT NULL DEFAULT 'TRIAGED',
    "chief_complaint" TEXT NOT NULL,
    "estimated_or_fast_weight_kg" DECIMAL(6,3) NOT NULL,
    "airway_status" VARCHAR(30) NOT NULL DEFAULT 'PATENT',
    "breathing_effort" VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    "circulation_pulse" VARCHAR(30) NOT NULL DEFAULT 'STRONG',
    "capillary_refill_seconds" DECIMAL(3,1),
    "mucous_color" VARCHAR(30) NOT NULL DEFAULT 'PINK',
    "mental_status" VARCHAR(30) NOT NULL DEFAULT 'ALERT',
    "temp_celsius" DECIMAL(4,2),
    "heart_rate_bpm" INTEGER,
    "respiratory_rate_bpm" INTEGER,
    "spo2_percent" DECIMAL(4,1),
    "systolic_bp" INTEGER,
    "glucose_mg_dl" INTEGER,
    "lactate_mmol_l" DECIMAL(4,2),
    "crash_cart_dosages_json" JSONB,
    "assigned_shock_table" VARCHAR(30),
    "assigned_room_id" UUID,
    "is_code_red_broadcasted" BOOLEAN NOT NULL DEFAULT false,
    "admitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended_at" TIMESTAMPTZ,
    "stabilized_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_triages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "veterinarian_id" UUID NOT NULL,
    "room_id" UUID,
    "turn_id" UUID,
    "emergency_triage_id" UUID,
    "consultation_type" "ConsultationType" NOT NULL DEFAULT 'GENERAL',
    "consultation_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anamnesis_reason" TEXT NOT NULL,
    "current_diet" TEXT,
    "current_medications" TEXT,
    "weight_kg" DECIMAL(6,3) NOT NULL,
    "temp_celsius" DECIMAL(4,2),
    "heart_rate_bpm" INTEGER,
    "respiratory_rate_bpm" INTEGER,
    "systolic_bp" INTEGER,
    "capillary_refill_seconds" DECIMAL(3,1),
    "mucous_membrane_status" VARCHAR(30) DEFAULT 'PINK',
    "hydration_percentage" DECIMAL(3,1) DEFAULT 0.0,
    "body_condition_score" INTEGER,
    "pain_scale_score" INTEGER,
    "physical_exam_systems" JSONB NOT NULL DEFAULT '{}',
    "subjective" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "assessment_diagnosis" TEXT NOT NULL,
    "differential_diagnoses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "plan_therapeutic_summary" TEXT NOT NULL,
    "requires_hospitalization" BOOLEAN NOT NULL DEFAULT false,
    "requires_surgery" BOOLEAN NOT NULL DEFAULT false,
    "requires_lab_tests" BOOLEAN NOT NULL DEFAULT false,
    "requires_imaging" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "closed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_addendums" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "consultation_id" UUID NOT NULL,
    "veterinarian_id" UUID NOT NULL,
    "addendum_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_addendums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "veterinarian_id" UUID NOT NULL,
    "consultation_id" UUID,
    "emergency_triage_id" UUID,
    "prescription_code" VARCHAR(30) NOT NULL,
    "is_controlled_narcotic" BOOLEAN NOT NULL DEFAULT false,
    "general_indications" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "prescription_id" UUID NOT NULL,
    "medication_name" VARCHAR(150) NOT NULL,
    "active_ingredient" VARCHAR(150),
    "dosage_text" VARCHAR(100) NOT NULL,
    "route_of_administration" VARCHAR(50) NOT NULL,
    "frequency_hours" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "quantity_to_dispense" VARCHAR(50) NOT NULL,
    "special_instructions" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_consent_forms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "form_type" "ConsentFormType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "terms_body_text" TEXT NOT NULL,
    "initial_deposit_amount" DECIMAL(10,2) DEFAULT 0.00,
    "signer_full_name" VARCHAR(150) NOT NULL,
    "signer_id_document" VARCHAR(50) NOT NULL,
    "signer_signature_svg" TEXT NOT NULL,
    "signed_pdf_url" TEXT,
    "signed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "digital_consent_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgeries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "lead_surgeon_id" UUID NOT NULL,
    "anesthesiologist_id" UUID,
    "room_id" UUID,
    "consent_form_id" UUID,
    "consultation_id" UUID,
    "emergency_triage_id" UUID,
    "surgery_name" VARCHAR(150) NOT NULL,
    "asa_grade" "AsaRiskClassification" NOT NULL DEFAULT 'ASA_I',
    "status" "SurgeryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "checklist_sign_in_passed" BOOLEAN NOT NULL DEFAULT false,
    "checklist_time_out_passed" BOOLEAN NOT NULL DEFAULT false,
    "checklist_sign_out_passed" BOOLEAN NOT NULL DEFAULT false,
    "pre_op_weight_kg" DECIMAL(6,3) NOT NULL,
    "pre_medication_protocol" TEXT,
    "induction_agent" VARCHAR(100),
    "maintenance_agent" VARCHAR(100) DEFAULT 'ISOFLURANE',
    "surgery_start_time" TIMESTAMPTZ,
    "surgery_end_time" TIMESTAMPTZ,
    "surgical_findings_report" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surgeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_anesthesia_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "surgery_id" UUID NOT NULL,
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heart_rate_bpm" INTEGER,
    "respiratory_rate_bpm" INTEGER,
    "spo2_percent" DECIMAL(4,1),
    "etco2_mmhg" INTEGER,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "mean_bp" INTEGER,
    "temp_celsius" DECIMAL(4,2),
    "vaporizer_pct" DECIMAL(3,1),
    "fluid_rate_ml_hr" DECIMAL(6,2),
    "administered_bolus" TEXT,
    "notes" TEXT,

    CONSTRAINT "surgery_anesthesia_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "requested_by_vet_id" UUID NOT NULL,
    "consultation_id" UUID,
    "emergency_triage_id" UUID,
    "category" VARCHAR(30) NOT NULL,
    "profile_name" VARCHAR(150) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ORDERED',
    "sample_type" VARCHAR(50) NOT NULL DEFAULT 'WHOLE_BLOOD_EDTA',
    "pdf_attachment_url" TEXT,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_test_results" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "analyte_name" VARCHAR(100) NOT NULL,
    "analyte_code" VARCHAR(30),
    "measured_value" DECIMAL(12,3) NOT NULL,
    "unit_of_measure" VARCHAR(30) NOT NULL,
    "reference_low" DECIMAL(12,3),
    "reference_high" DECIMAL(12,3),
    "flag" VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_studies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "prescribed_by_vet_id" UUID NOT NULL,
    "consultation_id" UUID,
    "emergency_triage_id" UUID,
    "modality" VARCHAR(30) NOT NULL DEFAULT 'X_RAY_DIGITAL',
    "anatomical_region" VARCHAR(150) NOT NULL,
    "clinical_history_reason" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    "dicom_study_instance_uid" VARCHAR(128),
    "dicom_web_pacs_viewer_url" TEXT,
    "preview_jpeg_url" TEXT,
    "radiological_report" TEXT,
    "measurements_json" JSONB,
    "performed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitalizations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "attending_vet_id" UUID NOT NULL,
    "consultation_id" UUID,
    "emergency_triage_id" UUID,
    "admission_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharge_date" TIMESTAMPTZ,
    "admission_weight_kg" DECIMAL(6,3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ADMITTED',
    "admission_reason" TEXT NOT NULL,
    "discharge_summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospitalizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitalization_orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "hospitalization_id" UUID NOT NULL,
    "order_type" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "dosage" VARCHAR(100),
    "rate_ml_hr" DECIMAL(6,2),
    "frequency_hours" INTEGER,
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospitalization_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flowboard_executions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "administered_at" TIMESTAMPTZ,
    "administered_by_user_id" UUID,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "vital_signs_payload" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flowboard_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grooming_sessions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "groomer_user_id" UUID,
    "room_id" UUID,
    "service_type" VARCHAR(30) NOT NULL DEFAULT 'BATH_BASIC',
    "status" VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN',
    "has_matting" BOOLEAN NOT NULL DEFAULT false,
    "has_parasites" BOOLEAN NOT NULL DEFAULT false,
    "has_skin_lesions" BOOLEAN NOT NULL DEFAULT false,
    "requires_medical_check" BOOLEAN NOT NULL DEFAULT false,
    "dermatological_notes" TEXT,
    "photo_before_url" TEXT,
    "photo_after_url" TEXT,
    "check_in_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ready_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grooming_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "trade_name" VARCHAR(150),
    "nit" VARCHAR(17),
    "nrc" VARCHAR(20),
    "contact_name" VARCHAR(100),
    "phone_e164" VARCHAR(20),
    "email" VARCHAR(255),
    "address" TEXT,
    "credit_days" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30),
    "description" TEXT,
    "parent_category_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "sku" VARCHAR(50) NOT NULL,
    "barcode" VARCHAR(100),
    "name" VARCHAR(150) NOT NULL,
    "generic_name" VARCHAR(150),
    "unit_of_measure" VARCHAR(30) NOT NULL DEFAULT 'UNIT',
    "is_medication" BOOLEAN NOT NULL DEFAULT false,
    "is_controlled_narcotic" BOOLEAN NOT NULL DEFAULT false,
    "is_fractionable" BOOLEAN NOT NULL DEFAULT false,
    "total_volume_per_vial_ml" DECIMAL(10,3),
    "concentration_mg_per_ml" DECIMAL(10,3),
    "cost_price_average" DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
    "sale_price" DECIMAL(12,4) NOT NULL,
    "tax_percentage" DECIMAL(5,2) NOT NULL DEFAULT 13.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stocks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "current_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    "minimum_alert_stock" DECIMAL(12,3) NOT NULL DEFAULT 5.000,
    "reorder_quantity" DECIMAL(12,3) NOT NULL DEFAULT 20.000,
    "location_bin" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_lots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "lot_number" VARCHAR(50) NOT NULL,
    "expiration_date" DATE NOT NULL,
    "initial_quantity" DECIMAL(12,3) NOT NULL,
    "current_quantity" DECIMAL(12,3) NOT NULL,
    "purchase_cost_unit" DECIMAL(12,4) NOT NULL,
    "is_exhausted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_open_vials" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "lot_id" UUID NOT NULL,
    "opened_by_user_id" UUID NOT NULL,
    "initial_volume_ml" DECIMAL(10,3) NOT NULL,
    "remaining_volume_ml" DECIMAL(10,3) NOT NULL,
    "opened_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_after_opening_at" TIMESTAMPTZ NOT NULL,
    "is_exhausted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pharmacy_open_vials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "po_number" VARCHAR(30) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "supplier_invoice_number" VARCHAR(50),
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "ordered_by_user_id" UUID NOT NULL,
    "received_by_user_id" UUID,
    "received_at" TIMESTAMPTZ,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "purchase_order_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity_ordered" DECIMAL(12,3) NOT NULL,
    "quantity_received" DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    "unit_cost" DECIMAL(12,4) NOT NULL,
    "lot_number" VARCHAR(50),
    "expiration_date" DATE,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "lot_id" UUID,
    "adjustment_type" VARCHAR(30) NOT NULL,
    "quantity_adjusted" DECIMAL(12,3) NOT NULL,
    "justification" TEXT NOT NULL,
    "authorized_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transfers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "source_branch_id" UUID NOT NULL,
    "target_branch_id" UUID NOT NULL,
    "transfer_code" VARCHAR(30) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    "requested_by_user_id" UUID NOT NULL,
    "sent_by_user_id" UUID,
    "received_by_user_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transfer_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "lot_id" UUID,
    "quantity_sent" DECIMAL(12,3) NOT NULL,
    "quantity_received" DECIMAL(12,3) NOT NULL DEFAULT 0.000,

    CONSTRAINT "inventory_transfer_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_dte_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "environment" "MhEnvironmentType" NOT NULL DEFAULT '00',
    "auth_user" VARCHAR(100) NOT NULL,
    "api_auth_token" TEXT,
    "api_auth_token_expires_at" TIMESTAMPTZ,
    "private_key_encrypted" TEXT NOT NULL,
    "certificate_password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_dte_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dte_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "pos_terminal_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "patient_id" UUID,
    "emergency_triage_id" UUID,
    "consultation_id" UUID,
    "surgery_id" UUID,
    "hospitalization_id" UUID,
    "grooming_session_id" UUID,
    "lab_order_id" UUID,
    "imaging_study_id" UUID,
    "dte_type" "DteDocumentType" NOT NULL DEFAULT '01',
    "generation_code" UUID NOT NULL,
    "control_number" VARCHAR(31) NOT NULL,
    "sequential_number" BIGINT NOT NULL,
    "transmission_status" "DteTransmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "reception_stamp" VARCHAR(50),
    "mh_received_at" TIMESTAMPTZ,
    "total_exempt" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_gravado" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "iva_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "iva_retention" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_payable" DECIMAL(12,2) NOT NULL,
    "payment_method_code" VARCHAR(2) NOT NULL DEFAULT '01',
    "signed_jws_payload" TEXT,
    "qr_url" TEXT,
    "pdf_url" TEXT,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dte_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dte_invoice_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "item_id" UUID,
    "lot_id" UUID,
    "item_number" INTEGER NOT NULL,
    "item_type" VARCHAR(20) NOT NULL,
    "description" VARCHAR(250) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(12,4) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "dte_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE INDEX "idx_branches_tenant" ON "branches"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_tenant_id_code_key" ON "branches"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "branches_tenant_id_establishment_code_mh_key" ON "branches"("tenant_id", "establishment_code_mh");

-- CreateIndex
CREATE INDEX "idx_pos_terminals_branch" ON "pos_terminals"("tenant_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "pos_terminals_branch_id_terminal_code_key" ON "pos_terminals"("branch_id", "terminal_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "idx_user_tenants_lookup" ON "user_tenants"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenants_user_id_tenant_id_key" ON "user_tenants"("user_id", "tenant_id");

-- CreateIndex
CREATE INDEX "idx_user_branch_assignments" ON "user_branch_assignments"("tenant_id", "user_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_branch_assignments_user_id_branch_id_key" ON "user_branch_assignments"("user_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_user_id_key" ON "doctor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_doctor_profiles_tenant" ON "doctor_profiles"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_doctor_schedules_branch" ON "doctor_schedules"("tenant_id", "branch_id", "day_of_week");

-- CreateIndex
CREATE INDEX "idx_clients_phone" ON "clients"("tenant_id", "phone_e164");

-- CreateIndex
CREATE INDEX "idx_clients_name" ON "clients"("tenant_id", "last_name", "first_name");

-- CreateIndex
CREATE INDEX "idx_clients_dui" ON "clients"("tenant_id", "dui");

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_access_client_id_key" ON "client_portal_access"("client_id");

-- CreateIndex
CREATE INDEX "idx_breeds_species" ON "breeds"("species", "name");

-- CreateIndex
CREATE INDEX "idx_patients_client" ON "patients"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "idx_patients_microchip" ON "patients"("tenant_id", "microchip_number");

-- CreateIndex
CREATE INDEX "idx_patients_name" ON "patients"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "idx_co_owners_lookup" ON "patient_co_owners"("tenant_id", "client_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_co_owners_patient_id_client_id_key" ON "patient_co_owners"("patient_id", "client_id");

-- CreateIndex
CREATE INDEX "idx_weight_history_patient" ON "patient_weight_history"("patient_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "idx_vaccinations_patient" ON "vaccination_records"("patient_id", "next_due_date");

-- CreateIndex
CREATE INDEX "idx_antiparasitic_patient" ON "antiparasitic_records"("patient_id", "next_due_date");

-- CreateIndex
CREATE INDEX "idx_rooms_branch_status" ON "rooms"("tenant_id", "branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_branch_id_code_key" ON "rooms"("branch_id", "code");

-- CreateIndex
CREATE INDEX "idx_room_reservations_time" ON "room_reservations"("room_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "idx_emergency_triage_active" ON "emergency_triages"("tenant_id", "branch_id", "triage_color", "clinical_status");

-- CreateIndex
CREATE INDEX "idx_consultations_patient" ON "consultations"("tenant_id", "patient_id", "consultation_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_prescription_code_key" ON "prescriptions"("prescription_code");

-- CreateIndex
CREATE INDEX "idx_prescriptions_patient" ON "prescriptions"("tenant_id", "patient_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_dicom_study_instance_uid_key" ON "imaging_studies"("dicom_study_instance_uid");

-- CreateIndex
CREATE INDEX "idx_suppliers_tenant" ON "suppliers"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_inventory_items_barcode" ON "inventory_items"("tenant_id", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_tenant_id_sku_key" ON "inventory_items"("tenant_id", "sku");

-- CreateIndex
CREATE INDEX "idx_inventory_stocks_branch" ON "inventory_stocks"("tenant_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_stocks_branch_id_item_id_key" ON "inventory_stocks"("branch_id", "item_id");

-- CreateIndex
CREATE INDEX "idx_lots_peps_fifo" ON "inventory_lots"("tenant_id", "branch_id", "item_id", "expiration_date");

-- CreateIndex
CREATE INDEX "idx_open_vials_active" ON "pharmacy_open_vials"("tenant_id", "branch_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_tenant_id_po_number_key" ON "purchase_orders"("tenant_id", "po_number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transfers_tenant_id_transfer_code_key" ON "inventory_transfers"("tenant_id", "transfer_code");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_dte_configs_tenant_id_key" ON "tenant_dte_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "dte_invoices_tenant_id_dte_type_control_number_key" ON "dte_invoices"("tenant_id", "dte_type", "control_number");

-- CreateIndex
CREATE UNIQUE INDEX "dte_invoice_items_invoice_id_item_number_key" ON "dte_invoice_items"("invoice_id", "item_number");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_parent_branch_id_fkey" FOREIGN KEY ("parent_branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pos_terminals" ADD CONSTRAINT "pos_terminals_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branch_assignments" ADD CONSTRAINT "user_branch_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branch_assignments" ADD CONSTRAINT "user_branch_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branch_assignments" ADD CONSTRAINT "user_branch_assignments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_branch_assignments" ADD CONSTRAINT "user_branch_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_portal_access" ADD CONSTRAINT "client_portal_access_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_co_owners" ADD CONSTRAINT "patient_co_owners_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_co_owners" ADD CONSTRAINT "patient_co_owners_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_co_owners" ADD CONSTRAINT "patient_co_owners_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_weight_history" ADD CONSTRAINT "patient_weight_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_weight_history" ADD CONSTRAINT "patient_weight_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_weight_history" ADD CONSTRAINT "patient_weight_history_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_weight_history" ADD CONSTRAINT "patient_weight_history_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deworming_records" ADD CONSTRAINT "deworming_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deworming_records" ADD CONSTRAINT "deworming_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deworming_records" ADD CONSTRAINT "deworming_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deworming_records" ADD CONSTRAINT "deworming_records_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antiparasitic_records" ADD CONSTRAINT "antiparasitic_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antiparasitic_records" ADD CONSTRAINT "antiparasitic_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antiparasitic_records" ADD CONSTRAINT "antiparasitic_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antiparasitic_records" ADD CONSTRAINT "antiparasitic_records_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_current_doctor_user_id_fkey" FOREIGN KEY ("current_doctor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_current_patient_id_fkey" FOREIGN KEY ("current_patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reservations" ADD CONSTRAINT "room_reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reservations" ADD CONSTRAINT "room_reservations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reservations" ADD CONSTRAINT "room_reservations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reservations" ADD CONSTRAINT "room_reservations_reserved_by_user_id_fkey" FOREIGN KEY ("reserved_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_reservations" ADD CONSTRAINT "room_reservations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_evaluated_by_user_id_fkey" FOREIGN KEY ("evaluated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_attending_vet_id_fkey" FOREIGN KEY ("attending_vet_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_triages" ADD CONSTRAINT "emergency_triages_assigned_room_id_fkey" FOREIGN KEY ("assigned_room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_addendums" ADD CONSTRAINT "consultation_addendums_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_addendums" ADD CONSTRAINT "consultation_addendums_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_addendums" ADD CONSTRAINT "consultation_addendums_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_veterinarian_id_fkey" FOREIGN KEY ("veterinarian_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_consent_forms" ADD CONSTRAINT "digital_consent_forms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_consent_forms" ADD CONSTRAINT "digital_consent_forms_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_consent_forms" ADD CONSTRAINT "digital_consent_forms_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_consent_forms" ADD CONSTRAINT "digital_consent_forms_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_lead_surgeon_id_fkey" FOREIGN KEY ("lead_surgeon_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_anesthesiologist_id_fkey" FOREIGN KEY ("anesthesiologist_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_consent_form_id_fkey" FOREIGN KEY ("consent_form_id") REFERENCES "digital_consent_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_anesthesia_logs" ADD CONSTRAINT "surgery_anesthesia_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_anesthesia_logs" ADD CONSTRAINT "surgery_anesthesia_logs_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_requested_by_vet_id_fkey" FOREIGN KEY ("requested_by_vet_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_results" ADD CONSTRAINT "lab_test_results_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_test_results" ADD CONSTRAINT "lab_test_results_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_prescribed_by_vet_id_fkey" FOREIGN KEY ("prescribed_by_vet_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_attending_vet_id_fkey" FOREIGN KEY ("attending_vet_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalizations" ADD CONSTRAINT "hospitalizations_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalization_orders" ADD CONSTRAINT "hospitalization_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitalization_orders" ADD CONSTRAINT "hospitalization_orders_hospitalization_id_fkey" FOREIGN KEY ("hospitalization_id") REFERENCES "hospitalizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowboard_executions" ADD CONSTRAINT "flowboard_executions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowboard_executions" ADD CONSTRAINT "flowboard_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "hospitalization_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowboard_executions" ADD CONSTRAINT "flowboard_executions_administered_by_user_id_fkey" FOREIGN KEY ("administered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grooming_sessions" ADD CONSTRAINT "grooming_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grooming_sessions" ADD CONSTRAINT "grooming_sessions_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grooming_sessions" ADD CONSTRAINT "grooming_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grooming_sessions" ADD CONSTRAINT "grooming_sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grooming_sessions" ADD CONSTRAINT "grooming_sessions_groomer_user_id_fkey" FOREIGN KEY ("groomer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grooming_sessions" ADD CONSTRAINT "grooming_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_open_vials" ADD CONSTRAINT "pharmacy_open_vials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_open_vials" ADD CONSTRAINT "pharmacy_open_vials_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_open_vials" ADD CONSTRAINT "pharmacy_open_vials_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_open_vials" ADD CONSTRAINT "pharmacy_open_vials_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "inventory_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_open_vials" ADD CONSTRAINT "pharmacy_open_vials_opened_by_user_id_fkey" FOREIGN KEY ("opened_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_ordered_by_user_id_fkey" FOREIGN KEY ("ordered_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_received_by_user_id_fkey" FOREIGN KEY ("received_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_authorized_by_user_id_fkey" FOREIGN KEY ("authorized_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_source_branch_id_fkey" FOREIGN KEY ("source_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_target_branch_id_fkey" FOREIGN KEY ("target_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_sent_by_user_id_fkey" FOREIGN KEY ("sent_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfers" ADD CONSTRAINT "inventory_transfers_received_by_user_id_fkey" FOREIGN KEY ("received_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "inventory_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transfer_items" ADD CONSTRAINT "inventory_transfer_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_dte_configs" ADD CONSTRAINT "tenant_dte_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_pos_terminal_id_fkey" FOREIGN KEY ("pos_terminal_id") REFERENCES "pos_terminals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_emergency_triage_id_fkey" FOREIGN KEY ("emergency_triage_id") REFERENCES "emergency_triages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_hospitalization_id_fkey" FOREIGN KEY ("hospitalization_id") REFERENCES "hospitalizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_grooming_session_id_fkey" FOREIGN KEY ("grooming_session_id") REFERENCES "grooming_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoices" ADD CONSTRAINT "dte_invoices_imaging_study_id_fkey" FOREIGN KEY ("imaging_study_id") REFERENCES "imaging_studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoice_items" ADD CONSTRAINT "dte_invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoice_items" ADD CONSTRAINT "dte_invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "dte_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoice_items" ADD CONSTRAINT "dte_invoice_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dte_invoice_items" ADD CONSTRAINT "dte_invoice_items_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "inventory_lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
