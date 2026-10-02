"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createConsultation } from "@/lib/actions/consultations";
import { SafetyBanner } from "./SafetyBanner";
import {
  Stethoscope,
  Activity,
  Heart,
  Wind,
  Thermometer,
  Scale,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Bed,
  Scissors,
  TestTubes,
  FileImage,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConsultationType } from "@prisma/client";

const SYSTEM_LIST = [
  { key: "eyes", label: "1. Ojos y Anexos" },
  { key: "ears", label: "2. Oídos y Conductos" },
  { key: "oral", label: "3. Cavidad Oral & Dentición" },
  { key: "cardio", label: "4. Cardiovascular & Ritmo" },
  { key: "resp", label: "5. Respiratorio & Campos Pulmonares" },
  { key: "abdomen", label: "6. Abdomen & Palpación" },
  { key: "lymph", label: "7. Linfonodos / Ganglios" },
  { key: "musculo", label: "8. Músculo-Esquelético" },
  { key: "skin", label: "9. Piel, Manto & Ectoparásitos" },
  { key: "neuro", label: "10. Neurológico / Urogenital" },
];

const formSchema = z.object({
  patientId: z.string().uuid("Seleccione un paciente"),
  consultationType: z.nativeEnum(ConsultationType),
  anamnesisReason: z.string().min(3, "El motivo de consulta es obligatorio"),
  currentDiet: z.string().optional(),
  currentMedications: z.string().optional(),
  weightKg: z.coerce.number().positive("El peso debe ser mayor a 0"),
  tempCelsius: z.coerce.number().optional(),
  heartRateBpm: z.coerce.number().optional(),
  respiratoryRateBpm: z.coerce.number().optional(),
  systolicBp: z.coerce.number().optional(),
  capillaryRefillSeconds: z.coerce.number().optional(),
  mucousMembraneStatus: z.string().default("PINK"),
  hydrationPercentage: z.coerce.number().default(0),
  bodyConditionScore: z.coerce.number().min(1).max(9).default(5),
  painScaleScore: z.coerce.number().min(0).max(4).default(0),
  subjective: z.string().min(2, "Subjetivo requerido"),
  objective: z.string().min(2, "Objetivo requerido"),
  assessmentDiagnosis: z.string().min(2, "Diagnóstico requerido"),
  planTherapeuticSummary: z.string().min(2, "Plan terapéutico requerido"),
  requiresHospitalization: z.boolean().default(false),
  requiresSurgery: z.boolean().default(false),
  requiresLabTests: z.boolean().default(false),
  requiresImaging: z.boolean().default(false),
  isClosed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface SoapFormProps {
  branchCode: string;
  patients: any[];
  initialPatientId?: string;
}

export function SoapForm({ branchCode, patients, initialPatientId }: SoapFormProps) {
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatientId || patients[0]?.id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Examen de 10 sistemas: { [key]: { normal: boolean, notes: string } }
  const [systemsState, setSystemsState] = useState<Record<string, { normal: boolean; notes: string }>>(
    () => {
      const init: Record<string, { normal: boolean; notes: string }> = {};
      SYSTEM_LIST.forEach((s) => {
        init[s.key] = { normal: true, notes: "" };
      });
      return init;
    }
  );

  // Receta Médica Dinámica
  const [prescriptionItems, setPrescriptionItems] = useState<
    {
      medicationName: string;
      activeIngredient?: string;
      dosageText: string;
      routeOfAdministration: string;
      frequencyHours: number;
      durationDays: number;
      quantityToDispense: string;
      specialInstructions?: string;
    }[]
  >([]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const latestWeight = selectedPatient?.weightHistories?.[0]?.weightKg;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      patientId: selectedPatientId,
      consultationType: ConsultationType.GENERAL,
      weightKg: latestWeight ? Number(latestWeight) : 10,
      tempCelsius: selectedPatient?.species === "FELINE" ? 38.5 : 38.2,
      heartRateBpm: selectedPatient?.species === "FELINE" ? 160 : 100,
      respiratoryRateBpm: selectedPatient?.species === "FELINE" ? 28 : 22,
      capillaryRefillSeconds: 1.5,
      mucousMembraneStatus: "PINK",
      hydrationPercentage: 0,
      bodyConditionScore: 5,
      painScaleScore: 0,
      requiresHospitalization: false,
      requiresSurgery: false,
      requiresLabTests: false,
      requiresImaging: false,
      isClosed: true,
    },
  });

  const weightKg = watch("weightKg");

  const addPrescriptionRow = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicationName: "",
        dosageText: `${(weightKg * 10).toFixed(0)} mg`,
        routeOfAdministration: "ORAL",
        frequencyHours: 12,
        durationDays: 7,
        quantityToDispense: "1 Frasco / Caja",
        specialInstructions: "Administrar con alimentos.",
      },
    ]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const updatePrescriptionRow = (index: number, field: string, value: any) => {
    const updated = [...prescriptionItems];
    (updated[index] as any)[field] = value;
    setPrescriptionItems(updated);
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setServerError(null);

    const payload = {
      ...values,
      physicalExamSystems: systemsState,
      prescriptionItems,
    };

    const res = await createConsultation(payload as any, branchCode);
    setIsSubmitting(false);

    if (res.success && res.consultation) {
      router.push(`/${branchCode}/consultas/${res.consultation.id}`);
    } else {
      setServerError(res.error || "Error al asentar la consulta SOAP.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── SELECCIÓN DE PACIENTE ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-emerald-400" />
            Paciente a Examinar:
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              setValue("patientId", e.target.value);
              const p = patients.find((x) => x.id === e.target.value);
              if (p?.weightHistories?.[0]?.weightKg) {
                setValue("weightKg", Number(p.weightHistories[0].weightKg));
              }
            }}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[280px]"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.species === "CANINE" ? "🐶" : "🐱"} {p.name} • {p.client.firstName}{" "}
                {p.client.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* SafetyBanner del Paciente Seleccionado */}
        {selectedPatient && (
          <SafetyBanner
            temperamentAlert={selectedPatient.temperamentAlert}
            knownAllergies={selectedPatient.knownAllergies}
            chronicConditions={selectedPatient.chronicConditions}
            bloodType={selectedPatient.bloodType}
            microchipNumber={selectedPatient.microchipNumber}
          />
        )}
      </div>

      {/* ── CONSTANTES VITALES OBLIGATORIAS ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>Constantes Vitales & Triage Clínico</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center gap-1">
              <Scale className="h-3 w-3 text-emerald-400" />
              Peso ($kg$) <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("weightKg")}
              className="bg-slate-950 border-slate-800 font-mono text-white text-xs"
            />
            {errors.weightKg && (
              <p className="text-[10px] text-rose-400">{String(errors.weightKg.message || "")}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-cyan-400" />
              Temperatura (°C)
            </label>
            <Input
              type="number"
              step="0.1"
              {...register("tempCelsius")}
              className="bg-slate-950 border-slate-800 font-mono text-white text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center gap-1">
              <Heart className="h-3 w-3 text-rose-400" />
              FC (lpm)
            </label>
            <Input
              type="number"
              {...register("heartRateBpm")}
              className="bg-slate-950 border-slate-800 font-mono text-white text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center gap-1">
              <Wind className="h-3 w-3 text-teal-400" />
              FR (rpm)
            </label>
            <Input
              type="number"
              {...register("respiratoryRateBpm")}
              className="bg-slate-950 border-slate-800 font-mono text-white text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">TLLC (Segundos)</label>
            <Input
              type="number"
              step="0.1"
              {...register("capillaryRefillSeconds")}
              className="bg-slate-950 border-slate-800 font-mono text-white text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Mucosas</label>
            <select
              {...register("mucousMembraneStatus")}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white"
            >
              <option value="PINK">Rosadas (Normal)</option>
              <option value="PALE">Pálidas (Anemia / Shock)</option>
              <option value="ICTERIC">Ictéricas (Hepatopatía / Hemólisis)</option>
              <option value="CYANOTIC">Cianóticas (Hipoxia severa)</option>
              <option value="CONGESTED">Rojo Ladrillo / Congestivas (Sepsis)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Condición Corporal (1-9)</label>
            <select
              {...register("bodyConditionScore")}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white"
            >
              <option value={1}>1/9 - Caquéctico</option>
              <option value={3}>3/9 - Bajo Peso</option>
              <option value={5}>5/9 - Peso Ideal (WSAVA)</option>
              <option value={7}>7/9 - Sobrepeso</option>
              <option value={9}>9/9 - Obesidad Severa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Escala Dolor (0-4)</label>
            <select
              {...register("painScaleScore")}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white"
            >
              <option value={0}>0 - Sin Dolor</option>
              <option value={1}>1 - Dolor Leve</option>
              <option value={2}>2 - Dolor Moderado</option>
              <option value={3}>3 - Dolor Intenso</option>
              <option value={4}>4 - Dolor Severo / Refractario</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── EXAMEN FÍSICO POR 10 SISTEMAS ORGÁNICOS ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>Examen Físico Sistemático (10 Sistemas Orgánicos)</span>
          </div>
          <span className="text-[11px] text-slate-400">Estándar AAHA / WSAVA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {SYSTEM_LIST.map((sys) => {
            const st = systemsState[sys.key];
            return (
              <div
                key={sys.key}
                className={`p-3 rounded-xl border transition-all ${
                  st.normal
                    ? "border-slate-800 bg-slate-950/40"
                    : "border-amber-500/50 bg-amber-950/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-slate-200">{sys.label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setSystemsState({
                          ...systemsState,
                          [sys.key]: { ...st, normal: true },
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.normal
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSystemsState({
                          ...systemsState,
                          [sys.key]: { ...st, normal: false },
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        !st.normal
                          ? "bg-amber-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Anormal
                    </button>
                  </div>
                </div>

                {!st.normal && (
                  <Input
                    value={st.notes}
                    onChange={(e) =>
                      setSystemsState({
                        ...systemsState,
                        [sys.key]: { ...st, notes: e.target.value },
                      })
                    }
                    placeholder="Detalle el hallazgo anormal..."
                    className="bg-slate-950 border-amber-500/40 text-xs text-white h-8"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CUATRO CUADRANTES SOAP AAHA ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* S: Subjetivo */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-2">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            S • Subjetivo (Anamnesis & Motivo) <span className="text-rose-400">*</span>
          </label>
          <Input
            {...register("anamnesisReason")}
            placeholder="Motivo principal: ej. Vómito post-prandial de 24h, decaimiento..."
            className="bg-slate-950 border-slate-800 text-xs text-white"
          />
          <textarea
            {...register("subjective")}
            rows={3}
            placeholder="Historia clínica reportada por el tutor, dieta actual, esquema vacunal..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* O: Objetivo */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-2">
          <label className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
            O • Objetivo (Hallazgos Clínicos) <span className="text-rose-400">*</span>
          </label>
          <textarea
            {...register("objective")}
            rows={5}
            placeholder="Resumen del examen físico: ej. Soplo sistólico Grado II/VI en foco mitral, abdomen doloroso a la palpación en epigastrio..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* A: Assessment / Diagnóstico */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-2">
          <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
            A • Assessment (Diagnóstico Presuntivo / Definitivo) <span className="text-rose-400">*</span>
          </label>
          <textarea
            {...register("assessmentDiagnosis")}
            rows={4}
            placeholder="Diagnóstico principal: ej. Gastroenteritis infecciosa canina, probable cuerpo extraño lineal..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* P: Plan Terapéutico */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-2">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
            P • Plan Terapéutico & Manejo <span className="text-rose-400">*</span>
          </label>
          <textarea
            {...register("planTherapeuticSummary")}
            rows={4}
            placeholder="Plan médico: Fluidoterapia con Hartman, Maropitant 1mg/kg SC, dieta blanda gastrointestinal..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* ── DERIVACIONES Y DESTINO DEL PACIENTE ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Derivaciones y Servicios Adicionales Requeridos:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input type="checkbox" {...register("requiresHospitalization")} className="rounded text-emerald-600" />
            <Bed className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-200">Ingreso a UCI 24/7</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input type="checkbox" {...register("requiresSurgery")} className="rounded text-rose-600" />
            <Scissors className="h-4 w-4 text-rose-400" />
            <span className="text-slate-200">Quirófano / Qx</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input type="checkbox" {...register("requiresLabTests")} className="rounded text-cyan-600" />
            <TestTubes className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-200">Analítica de Sangre</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input type="checkbox" {...register("requiresImaging")} className="rounded text-teal-600" />
            <FileImage className="h-4 w-4 text-teal-400" />
            <span className="text-slate-200">Rayos X / Ecografía</span>
          </label>
        </div>
      </div>

      {/* ── GENERADOR DE RECETA MÉDICA DIGITAL ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Pill className="h-4 w-4 text-emerald-400" />
            <span>Receta Médica Digital (Cálculo Farmacológico por Peso)</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPrescriptionRow}
            className="h-8 text-xs border-slate-700 hover:bg-slate-800 text-emerald-400 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Fármaco
          </Button>
        </div>

        {prescriptionItems.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No se han recetado fármacos en esta consulta. Haz clic en "Agregar Fármaco" para generar la receta digital con código QR.
          </p>
        ) : (
          <div className="space-y-3">
            {prescriptionItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Medicamento / Principio Activo
                    </label>
                    <Input
                      value={item.medicationName}
                      onChange={(e) => updatePrescriptionRow(idx, "medicationName", e.target.value)}
                      placeholder="Ej. Enrofloxacina 10%, Meloxicam..."
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Dosis ($mg/kg$ calculada)
                    </label>
                    <Input
                      value={item.dosageText}
                      onChange={(e) => updatePrescriptionRow(idx, "dosageText", e.target.value)}
                      placeholder="Ej. 5 mg/kg (75 mg)"
                      className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Vía</label>
                    <select
                      value={item.routeOfAdministration}
                      onChange={(e) => updatePrescriptionRow(idx, "routeOfAdministration", e.target.value)}
                      className="w-full rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white"
                    >
                      <option value="ORAL">Oral (PO)</option>
                      <option value="SC">Subcutánea (SC)</option>
                      <option value="IM">Intramuscular (IM)</option>
                      <option value="IV">Intravenosa (IV)</option>
                      <option value="TOPICAL">Tópica</option>
                      <option value="OTIC">Ótica</option>
                      <option value="OPHTHALMIC">Oftálmica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Frecuencia (Horas)</label>
                    <Input
                      type="number"
                      value={item.frequencyHours}
                      onChange={(e) => updatePrescriptionRow(idx, "frequencyHours", Number(e.target.value))}
                      placeholder="Cada 12 horas"
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Duración (Días)</label>
                    <Input
                      type="number"
                      value={item.durationDays}
                      onChange={(e) => updatePrescriptionRow(idx, "durationDays", Number(e.target.value))}
                      placeholder="7 días"
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cantidad a Dispensar</label>
                    <Input
                      value={item.quantityToDispense}
                      onChange={(e) => updatePrescriptionRow(idx, "quantityToDispense", e.target.value)}
                      placeholder="1 Caja / 10 tabletas"
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-end justify-end pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrescriptionRow(idx)}
                      className="h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTONES DE CIERRE Y GUARDADO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            {...register("isClosed")}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            <strong>Cierre Inmutable Médico:</strong> Bloquear consulta para evitar alteraciones
            posteriores (las correcciones requerirán adenda formal).
          </span>
        </label>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs h-10 px-5"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-10 px-6 gap-2 shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Asentando Consulta...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Asentar Consulta SOAP AAHA
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
