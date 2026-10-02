import React from "react";
import Link from "next/link";
import { getEmergencyTriages } from "@/lib/actions/emergencies";
import { getPatients } from "@/lib/actions/patients";
import { TriageTrafficLight } from "@/components/emergencies/TriageTrafficLight";
import { TriageFormModal } from "@/components/emergencies/TriageFormModal";
import { serializeData } from "@/lib/utils";
import {
  Siren,
  Zap,
  Activity,
  HeartCrack,
  Building2,
  Clock,
  Bed,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmergenciasPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function EmergenciasPage({ params }: EmergenciasPageProps) {
  const { branch } = await params;
  const triages = await getEmergencyTriages({ branchCode: branch });
  const patients = await getPatients({ branchCode: branch });

  const total = triages.length;
  const codeRed = triages.filter((t: any) => t.isCodeRedBroadcasted || t.triageColor === "RED_IMMEDIATE").length;
  const critical = triages.filter((t: any) => t.triageColor === "ORANGE_VERY_URGENT" || t.triageColor === "RED_IMMEDIATE").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER DE SECCIÓN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>URGENCIAS & QUIRÓFANO</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">Centro de Choque</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Siren className="h-6 w-6 text-rose-500 animate-pulse" />
            Semáforo de Triaje de Emergencia (VECCS)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Clasificación fisiológica ABC en menos de 45 segundos, tiempos de espera y rescate clínico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${branch}/emergencias/crash-cart`}>
            <Button
              variant="outline"
              className="border-rose-700 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 font-bold text-xs h-10 gap-1.5 shadow-md shadow-rose-950/40"
            >
              <Zap className="h-4 w-4 text-rose-400" />
              Carrito Rojo CPR (RECOVER)
            </Button>
          </Link>

          <TriageFormModal
            branchCode={branch}
            patients={serializeData(patients) as any}
          />
        </div>
      </div>

      {/* ── KPIS DE EMERGENCIAS ACTIVAS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-rose-500/40 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold text-rose-300">Código Rojo Activo</span>
            <Zap className="h-4 w-4 animate-bounce" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">{codeRed}</div>
          <p className="text-[11px] text-slate-400 mt-1">En maniobras inmediatas</p>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-amber-300">Rojo & Naranja (Críticos)</span>
            <Activity className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">{critical}</div>
          <p className="text-[11px] text-slate-400 mt-1">Atención &lt; 15 minutos</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-300">Total en Urgencias</span>
            <Siren className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">{total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Pacientes en sala o box</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold text-cyan-300">Pase a UCI 24/7</span>
            <Bed className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-2 font-mono">
            {triages.filter((t: any) => t.clinicalStatus === "TRANSFERRED_TO_ICU").length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hospitalizados post-estabilización</p>
        </div>
      </div>

      {/* ── SEMÁFORO Y TABLERO DE TRIAJE REACTIVO ── */}
      <TriageTrafficLight
        branchCode={branch}
        initialTriages={serializeData(triages) as any}
      />
    </div>
  );
}
