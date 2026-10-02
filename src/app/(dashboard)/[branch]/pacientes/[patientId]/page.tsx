import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientById } from "@/lib/actions/patients";
import { SafetyBanner } from "@/components/clinical/SafetyBanner";
import { PatientEmrTabs } from "@/components/patients/PatientEmrTabs";
import {
  ArrowLeft,
  PawPrint,
  Stethoscope,
  Phone,
  User,
  Scale,
  Calendar,
  Sparkles,
  Siren,
  Scissors,
  Bed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PatientDetailPageProps {
  params: Promise<{
    branch: string;
    patientId: string;
  }>;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { branch, patientId } = await params;
  const patient = await getPatientById(patientId);

  if (!patient) {
    notFound();
  }

  const latestWeight = patient.weightHistories?.[0]?.weightKg;
  const previousWeight = patient.weightHistories?.[1]?.weightKg;
  const weightDiff =
    latestWeight && previousWeight
      ? Number(latestWeight) - Number(previousWeight)
      : null;

  const calculateAge = () => {
    if (patient.birthDate) {
      const diffMs = Date.now() - new Date(patient.birthDate).getTime();
      const ageDate = new Date(diffMs);
      const years = Math.abs(ageDate.getUTCFullYear() - 1970);
      const months = ageDate.getUTCMonth();
      return `${years} años, ${months} meses`;
    }
    if (patient.estimatedAgeMonths) {
      const years = Math.floor(patient.estimatedAgeMonths / 12);
      const months = patient.estimatedAgeMonths % 12;
      return `${years} años, ${months} meses (estimada)`;
    }
    return "Edad no registrada";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── BOTÓN VOLVER Y BREADCRUMB ── */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-slate-400 hover:text-white gap-1.5"
        >
          <Link href={`/${branch}/pacientes`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al Directorio de Pacientes
          </Link>
        </Button>
      </div>

      {/* ── SAFETY BANNER CLÍNICO DE ALTO CONTRASTE (FIJO SUPERIOR) ── */}
      <SafetyBanner
        temperamentAlert={patient.temperamentAlert}
        knownAllergies={patient.knownAllergies}
        chronicConditions={patient.chronicConditions}
        bloodType={patient.bloodType}
        microchipNumber={patient.microchipNumber}
      />

      {/* ── CABECERA PRINCIPAL DEL EXPEDIENTE 360° ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar e Identificación del Paciente */}
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-3xl font-bold shrink-0">
              {patient.species === "CANINE" ? "🐶" : patient.species === "FELINE" ? "🐱" : "🐾"}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {patient.name}
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  {patient.species === "CANINE" ? "Canino" : "Felino"}
                </Badge>
                {patient.isDeceased && (
                  <Badge variant="destructive" className="text-xs">
                    Fallecido
                  </Badge>
                )}
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">
                  {patient.breed || patient.breedRelation?.name || "Raza no especificada"}
                </span>
                <span>•</span>
                <span>{calculateAge()}</span>
                <span>•</span>
                <span className="text-slate-400">
                  {patient.gender === "MALE_NEUTERED"
                    ? "Macho Castrado"
                    : patient.gender === "FEMALE_SPAYED"
                    ? "Hembra Esterilizada"
                    : patient.gender === "MALE_INTACT"
                    ? "Macho Entero"
                    : "Hembra Entera"}
                </span>
              </div>

              {/* Tutor Responsable Vinculado */}
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                <span>Tutor:</span>
                <Link
                  href={`/${branch}/clientes/${patient.client.id}`}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  {patient.client.firstName} {patient.client.lastName}
                </Link>
                <span>•</span>
                <a
                  href={`https://wa.me/${patient.client.phoneE164.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-slate-300 hover:text-white"
                >
                  {patient.client.phoneE164}
                </a>
              </div>
            </div>
          </div>

          {/* Tarjeta de Peso Actual */}
          <div className="flex flex-col items-start md:items-end justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-800 min-w-[200px]">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Scale className="h-3.5 w-3.5 text-emerald-400" />
              Último Peso Registrado
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-white">
                {latestWeight ? Number(latestWeight).toFixed(2) : "--.--"}
              </span>
              <span className="text-xs text-slate-400 font-medium">kg</span>
            </div>
            {weightDiff !== null && (
              <span
                className={`text-[10px] font-mono mt-0.5 ${
                  weightDiff > 0 ? "text-emerald-400" : weightDiff < 0 ? "text-rose-400" : "text-slate-400"
                }`}
              >
                {weightDiff > 0 ? `+${weightDiff.toFixed(2)}` : weightDiff.toFixed(2)} kg vs anterior
              </span>
            )}
          </div>
        </div>

        {/* Barra de Acceso Rápido Médico */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 flex-wrap">
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Link href={`/${branch}/consultas/nueva?patientId=${patient.id}`}>
              <Stethoscope className="h-4 w-4" />
              Iniciar Consulta Médica SOAP
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-rose-800/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs h-9 gap-1.5"
          >
            <Link href={`/${branch}/emergencias/triaje?patientId=${patient.id}`}>
              <Siren className="h-4 w-4 text-rose-400" />
              Triaje de Emergencia
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-xs h-9 gap-1.5"
          >
            <Link href={`/${branch}/uci/ingreso?patientId=${patient.id}`}>
              <Bed className="h-4 w-4 text-cyan-400" />
              Ingresar a UCI 24/7
            </Link>
          </Button>
        </div>
      </div>

      {/* ── PESTAÑAS INTERACTIVAS DEL EXPEDIENTE 360° ── */}
      <PatientEmrTabs patient={patient} branchCode={branch} />
    </div>
  );
}
