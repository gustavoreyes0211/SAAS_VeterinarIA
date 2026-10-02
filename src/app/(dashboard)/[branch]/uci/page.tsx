import React from "react";
import Link from "next/link";
import { getHospitalizations } from "@/lib/actions/hospitalization";
import { UciFlowboard } from "@/components/uci/UciFlowboard";
import { serializeData } from "@/lib/utils";
import {
  Bed,
  Droplet,
  Activity,
  HeartCrack,
  Building2,
  Clock,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UciPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function UciPage({ params }: UciPageProps) {
  const { branch } = await params;
  const hospitalizations = await getHospitalizations({
    branchCode: branch,
    status: "ADMITTED",
  });

  const occupiedCount = hospitalizations.length;
  const totalCages = 8;
  const availableCount = totalCages - occupiedCount;
  const withFluidsCount = hospitalizations.filter((h: any) =>
    h.orders.some((o: any) => o.orderType === "FLUIDS")
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER DE SECCIÓN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>URGENCIAS & QUIRÓFANO</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">Unidad de Cuidados Intensivos</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bed className="h-6 w-6 text-cyan-400" />
            Pizarra UCI 24/7 (Flowboard de Hospitalización)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitoreo en tiempo real de caniles, infusiones continuas CRI y matriz de tratamientos 24 horas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${branch}/emergencias`}>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 text-xs h-10"
            >
              Semáforo de Triaje
            </Button>
          </Link>

          <Link href={`/${branch}/emergencias/crash-cart`}>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-800/80 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs h-10 gap-1.5"
            >
              Carrito Rojo CPR
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPIS DE HOSPITALIZACIÓN UCI ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold text-cyan-300">Caniles Ocupados</span>
            <Bed className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {occupiedCount} <span className="text-xs font-normal text-slate-400">/ {totalCages}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pacientes en monitorización activa</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-emerald-300">Caniles Disponibles</span>
            <Building2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            {availableCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Esterilizados y listos para ingreso</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold text-slate-300">Bombas de Infusión</span>
            <Droplet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {withFluidsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Líneas de cristaloides / CRI activas</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-amber-300">Controles de Guardia</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
            24 Horas
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Médico y enfermero de turno 24/7</p>
        </div>
      </div>

      {/* ── PIZARRA DE CANILES Y MATRIZ 24H ── */}
      <UciFlowboard
        branchCode={branch}
        initialHospitalizations={serializeData(hospitalizations) as any}
      />
    </div>
  );
}
