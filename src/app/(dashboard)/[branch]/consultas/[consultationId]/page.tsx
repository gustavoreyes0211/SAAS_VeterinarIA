import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConsultationById } from "@/lib/actions/consultations";
import { SafetyBanner } from "@/components/clinical/SafetyBanner";
import { AddendumSection } from "@/components/clinical/AddendumSection";
import { serializeData } from "@/lib/utils";
import {
  ArrowLeft,
  Stethoscope,
  Activity,
  Heart,
  Wind,
  Thermometer,
  Scale,
  Pill,
  Lock,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Building2,
  AlertTriangle,
  QrCode,
  FileText,
  Printer,
  Bed,
  Scissors,
  TestTubes,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConsultationDetailPageProps {
  params: Promise<{
    branch: string;
    consultationId: string;
  }>;
}

const SYSTEM_LABELS: Record<string, string> = {
  eyes: "1. Ojos y Anexos",
  ears: "2. Oídos y Conductos",
  oral: "3. Cavidad Oral & Dentición",
  cardio: "4. Cardiovascular & Ritmo",
  resp: "5. Respiratorio & Campos Pulmonares",
  abdomen: "6. Abdomen & Palpación",
  lymph: "7. Linfonodos / Ganglios",
  musculo: "8. Músculo-Esquelético",
  skin: "9. Piel, Manto & Ectoparásitos",
  neuro: "10. Neurológico / Urogenital",
};

export default async function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const { branch, consultationId } = await params;
  const consultation = await getConsultationById(consultationId);

  if (!consultation) {
    notFound();
  }

  const { patient, veterinarian, prescriptions, addendums } = consultation;
  const examSystems = (consultation.physicalExamSystems as Record<string, any>) || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:p-0 print:m-0">
      {/* ── NAVEGACIÓN Y ACCIONES SUPERIORES (OCULTAS AL IMPRIMIR) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>CLÍNICA & ATENCIÓN</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">Acto Médico Expediente</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-emerald-400" />
            Consulta Médica SOAP • {consultation.consultationType}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fecha: {new Date(consultation.consultationDate).toLocaleString("es-SV", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${branch}/pacientes/${patient.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Expediente 360° ({patient.name})
            </Button>
          </Link>
          <Link href={`/${branch}/consultas`}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Todas las Consultas
            </Button>
          </Link>
        </div>
      </div>

      {/* ── SAFETY BANNER DE LA MASCOTA ── */}
      <SafetyBanner
        temperamentAlert={patient.temperamentAlert}
        knownAllergies={patient.knownAllergies}
        chronicConditions={patient.chronicConditions}
        bloodType={patient.bloodType}
        microchipNumber={patient.microchipNumber}
      />

      {/* ── SELLO DE ESTADO CLÍNICO & AUDITORÍA ── */}
      <div className={`rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        consultation.isClosed
          ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-300"
          : "border-amber-900/50 bg-amber-950/20 text-amber-300"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            consultation.isClosed ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
          }`}>
            {consultation.isClosed ? <Lock className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider uppercase">
                {consultation.isClosed ? "Acto Médico Concluido & Bloqueado (Inmutable)" : "Consulta Médica en Curso (Abierta)"}
              </span>
              <Badge
                variant="outline"
                className={
                  consultation.isClosed
                    ? "border-emerald-700 bg-emerald-950/60 text-emerald-300 text-[10px]"
                    : "border-amber-700 bg-amber-950/60 text-amber-300 text-[10px]"
                }
              >
                {consultation.isClosed ? "LEGALMENTE VÁLIDO" : "BORRADOR ACTIVO"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Médico Tratante: <strong className="text-slate-200">Dr(a). {veterinarian?.fullName || "No asignado"}</strong>
              {veterinarian?.professionalLicense && (
                <span className="text-slate-400 ml-1.5 font-mono">
                  [JVPMV: {veterinarian.professionalLicense}]
                </span>
              )}
              {consultation.closedAt && (
                <span className="ml-2 text-slate-500">
                  • Bloqueado el {new Date(consultation.closedAt).toLocaleString("es-SV")}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Resumen de Paciente y Tutor */}
        <div className="text-right text-xs text-slate-400">
          <div>
            Paciente: <strong className="text-white text-sm">{patient.species === "CANINE" ? "🐶" : "🐱"} {patient.name}</strong> ({patient.breedRelation?.name || patient.breed || "Mestizo"})
          </div>
          <div>
            Tutor: <strong className="text-slate-200">{patient.client.firstName} {patient.client.lastName}</strong> • Tel: {patient.client.phoneE164}
          </div>
        </div>
      </div>

      {/* ── CUADRÍCULA DE CONSTANTES VITALES ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          Constantes Biológicas Registradas
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              <Scale className="h-3 w-3 text-emerald-400" /> Peso
            </span>
            <span className="text-base font-bold text-white block mt-1">
              {Number(consultation.weightKg).toFixed(1)} <span className="text-xs font-normal text-slate-400">kg</span>
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              <Thermometer className="h-3 w-3 text-rose-400" /> Temp.
            </span>
            <span className="text-base font-bold text-white block mt-1">
              {consultation.tempCelsius ? `${Number(consultation.tempCelsius).toFixed(1)}°C` : "N/R"}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              <Heart className="h-3 w-3 text-rose-500" /> FC
            </span>
            <span className="text-base font-bold text-white block mt-1">
              {consultation.heartRateBpm || "N/R"} <span className="text-[10px] font-normal text-slate-400">lpm</span>
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              <Wind className="h-3 w-3 text-sky-400" /> FR
            </span>
            <span className="text-base font-bold text-white block mt-1">
              {consultation.respiratoryRateBpm || "N/R"} <span className="text-[10px] font-normal text-slate-400">rpm</span>
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
              TLLC
            </span>
            <span className="text-base font-bold text-white block mt-1">
              {consultation.capillaryRefillSeconds ? `${Number(consultation.capillaryRefillSeconds).toFixed(1)}s` : "N/R"}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase">Mucosas</span>
            <span className="text-xs font-semibold text-white block mt-1.5 truncate">
              {consultation.mucousMembraneStatus}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase">Cond. Corp</span>
            <span className="text-base font-bold text-white block mt-1">
              {consultation.bodyConditionScore}/9
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
            <span className="text-[10px] text-slate-500 uppercase">Dolor (0-4)</span>
            <span className="text-base font-bold text-white block mt-1">
              {consultation.painScaleScore}/4
            </span>
          </div>
        </div>
      </div>

      {/* ── EXAMEN SISTEMÁTICO DE 10 ÓRGANOS / SISTEMAS ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-emerald-400" />
          Examen Sistemático de 10 Órganos / Sistemas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(SYSTEM_LABELS).map(([key, label]) => {
            const sys = examSystems[key];
            const isNormal = sys?.normal ?? true;
            const notes = sys?.notes || "";

            return (
              <div
                key={key}
                className={`rounded-xl border p-3 text-xs ${
                  isNormal
                    ? "border-slate-800/80 bg-slate-950/40"
                    : "border-amber-900/50 bg-amber-950/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200">{label}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 ${
                      isNormal
                        ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
                        : "border-amber-800/80 bg-amber-950/50 text-amber-300 font-bold"
                    }`}
                  >
                    {isNormal ? "Normal" : "Hallazgos"}
                  </Badge>
                </div>
                {notes ? (
                  <p className="text-[11px] text-slate-300 italic">{notes}</p>
                ) : (
                  <p className="text-[11px] text-slate-500">Sin particularidades.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CUATRO CUADRANTES SOAP AAHA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CUADRANTE S: SUBJETIVO */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs">
                S
              </span>
              Subjetivo (Anamnesis & Historia)
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              AAHA Standard
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-slate-400">Motivo de Consulta:</span>
              <p className="text-slate-200 mt-0.5 whitespace-pre-line font-medium">
                {consultation.anamnesisReason}
              </p>
            </div>

            {consultation.currentDiet && (
              <div>
                <span className="font-semibold text-slate-400">Alimentación / Dieta:</span>
                <p className="text-slate-300 mt-0.5">{consultation.currentDiet}</p>
              </div>
            )}

            {consultation.currentMedications && (
              <div>
                <span className="font-semibold text-slate-400">Medicación Actual:</span>
                <p className="text-slate-300 mt-0.5">{consultation.currentMedications}</p>
              </div>
            )}

            <div>
              <span className="font-semibold text-slate-400">Detalle Subjetivo:</span>
              <p className="text-slate-300 mt-0.5 whitespace-pre-line">
                {consultation.subjective}
              </p>
            </div>
          </div>
        </div>

        {/* CUADRANTE O: OBJETIVO */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                O
              </span>
              Objetivo (Hallazgos Clínicos & Examen)
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              AAHA Standard
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-slate-400">Examen Físico Detallado:</span>
              <p className="text-slate-200 mt-0.5 whitespace-pre-line">
                {consultation.objective}
              </p>
            </div>
          </div>
        </div>

        {/* CUADRANTE A: EVALUACIÓN / DIAGNÓSTICO */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs">
                A
              </span>
              Evaluación (Diagnóstico Clínico)
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              AAHA Standard
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-400">Diagnóstico Principal:</span>
              <p className="text-base font-bold text-emerald-400 mt-1">
                {consultation.assessmentDiagnosis}
              </p>
            </div>

            {consultation.differentialDiagnoses && consultation.differentialDiagnoses.length > 0 && (
              <div>
                <span className="font-semibold text-slate-400 block mb-1.5">
                  Diagnósticos Diferenciales:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {consultation.differentialDiagnoses.map((diff, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-slate-700 bg-slate-950 text-slate-300 text-[11px]"
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CUADRANTE P: PLAN TERAPÉUTICO */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs">
                P
              </span>
              Plan Terapéutico & Procedimientos
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              AAHA Standard
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-400">Resumen Terapéutico:</span>
              <p className="text-slate-200 mt-0.5 whitespace-pre-line">
                {consultation.planTherapeuticSummary}
              </p>
            </div>

            {/* Requerimientos Complementarios */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
              {consultation.requiresHospitalization && (
                <Badge className="bg-rose-500/20 border-rose-500/40 text-rose-300 text-[10px] flex items-center gap-1">
                  <Bed className="h-3 w-3" /> Requiere Hospitalización
                </Badge>
              )}
              {consultation.requiresSurgery && (
                <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-[10px] flex items-center gap-1">
                  <Scissors className="h-3 w-3" /> Requiere Cirugía
                </Badge>
              )}
              {consultation.requiresLabTests && (
                <Badge className="bg-sky-500/20 border-sky-500/40 text-sky-300 text-[10px] flex items-center gap-1">
                  <TestTubes className="h-3 w-3" /> Requiere Laboratorio
                </Badge>
              )}
              {consultation.requiresImaging && (
                <Badge className="bg-purple-500/20 border-purple-500/40 text-purple-300 text-[10px] flex items-center gap-1">
                  <FileImage className="h-3 w-3" /> Requiere Imagenología
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECETA MÉDICA FARMACOLÓGICA ASOCIADA ── */}
      {prescriptions && prescriptions.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-400" />
              Receta Médica Digital #{prescriptions[0].prescriptionCode}
            </h3>
            <Badge
              variant="outline"
              className="border-emerald-700 bg-emerald-950/60 text-emerald-300 font-mono text-xs"
            >
              Firma Electrónica Válida
            </Badge>
          </div>

          <div className="space-y-3">
            {prescriptions[0].items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      {idx + 1}
                    </span>
                    <strong className="text-sm text-white">{item.medicationName}</strong>
                    {item.activeIngredient && (
                      <span className="text-xs text-slate-400">
                        ({item.activeIngredient})
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {item.dosageText} • Vía {item.routeOfAdministration}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <div>
                    Frecuencia: <strong className="text-slate-200">Cada {item.frequencyHours} horas</strong>
                  </div>
                  <div>
                    Duración: <strong className="text-slate-200">{item.durationDays} días</strong>
                  </div>
                  <div>
                    Dispensar: <strong className="text-slate-200">{item.quantityToDispense}</strong>
                  </div>
                  {item.specialInstructions && (
                    <div className="col-span-2 sm:col-span-1 text-slate-300 italic">
                      Nota: {item.specialInstructions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECCIÓN DE ADENDAS MÉDICAS LEGALES (CLIENT COMPONENT) ── */}
      <AddendumSection
        consultationId={consultation.id}
        branchCode={branch}
        isClosed={consultation.isClosed}
        addendums={serializeData(addendums) as any}
      />
    </div>
  );
}
