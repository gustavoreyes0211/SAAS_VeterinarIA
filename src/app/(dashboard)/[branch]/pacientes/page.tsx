import React from "react";
import { getPatients } from "@/lib/actions/patients";
import { PatientTable } from "@/components/patients/PatientTable";
import {
  PawPrint,
  HeartPulse,
  AlertTriangle,
  Stethoscope,
  Building2,
} from "lucide-react";

interface PacientesPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function PacientesPage({ params }: PacientesPageProps) {
  const { branch } = await params;
  const patients = await getPatients({ branchCode: branch });

  const totalPatients = patients.length;
  const canines = patients.filter((p) => p.species === "CANINE").length;
  const felines = patients.filter((p) => p.species === "FELINE").length;
  const alertPatients = patients.filter(
    (p) => p.knownAllergies.length > 0 || p.temperamentAlert !== "FRIENDLY"
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER DE SECCIÓN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>CLÍNICA & ATENCIÓN</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">Padrón Biológico</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Pacientes (Mascotas)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directorio maestro de mascotas, alertas de seguridad de vida, control de microchips y peso.
          </p>
        </div>
      </div>

      {/* ── TARJETAS DE MÉTRICAS (KPIS) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pacientes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <PawPrint className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {totalPatients}
            </span>
            <span className="text-[10px] text-slate-400">activos</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Población Canina</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 text-sm">
              🐶
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {canines}
            </span>
            <span className="text-[10px] text-slate-400">perros</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Población Felina</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 text-sm">
              🐱
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {felines}
            </span>
            <span className="text-[10px] text-slate-400">gatos</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Alertas de Riesgo</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {alertPatients}
            </span>
            <span className="text-[10px] text-rose-400 font-medium">con precaución</span>
          </div>
        </div>
      </div>

      {/* ── TABLA PRINCIPAL DE PACIENTES ── */}
      <PatientTable initialPatients={patients as any} branchCode={branch} />
    </div>
  );
}
