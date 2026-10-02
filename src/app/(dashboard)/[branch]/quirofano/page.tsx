import React from "react";
import { prisma } from "@/lib/prisma";
import { getSurgeries } from "@/lib/actions/surgery";
import { getPatients } from "@/lib/actions/patients";
import { serializeData } from "@/lib/utils";
import { SurgeryBoard } from "@/components/surgery/SurgeryBoard";
import {
  Scissors,
  Building2,
  Activity,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface QuirofanoPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function QuirofanoPage({ params }: QuirofanoPageProps) {
  const { branch } = await params;

  const branchEntity = await prisma.branch.findFirst({
    where: { code: branch },
    select: { id: true, name: true },
  });

  const surgeries = await getSurgeries({ branchCode: branch });
  const patients = await getPatients({ branchCode: branch });

  const doctors = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      fullName: true,
      professionalLicense: true,
    },
    orderBy: { fullName: "asc" },
  });

  const rooms = await prisma.room.findMany({
    where: {
      branch: { code: branch },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  });

  const total = surgeries.length;
  const inSurgeryCount = surgeries.filter((s: any) => s.status === "IN_SURGERY").length;
  const preOpCount = surgeries.filter((s: any) => s.status === "PRE_OP").length;
  const scheduledCount = surgeries.filter((s: any) => s.status === "SCHEDULED").length;
  const highRiskAsa = surgeries.filter((s: any) =>
    ["ASA_III", "ASA_IV", "ASA_V", "ASA_E"].includes(s.asaGrade)
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER DE SECCIÓN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>URGENCIAS & QUIRÓFANO</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">{branchEntity?.name || branch}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Scissors className="h-7 w-7 text-indigo-500" />
            Centro Quirúrgico & Monitoreo ASA
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de pabellones, checklist de seguridad quirúrgica OMS (Sign In / Time Out / Sign Out) y hoja transoperatoria.
          </p>
        </div>
      </div>

      {/* ── KPIS DE PABELLÓN ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* En Pabellón Ahora */}
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/60 p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-emerald-300">En Pabellón (Activas)</span>
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            {inSurgeryCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Con monitor anestésico activo</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/40" />
        </div>

        {/* Pre-Quirófano / Inducción */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-amber-300">En Pre-Quirófano</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
            {preOpCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Premedicación y canalización</p>
        </div>

        {/* Programadas */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold text-slate-300">Programadas Hoy</span>
            <Scissors className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {scheduledCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cirugías en agenda</p>
        </div>

        {/* Riesgo Alto ASA III+ */}
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold text-rose-300">Riesgo Alto (ASA III+)</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">
            {highRiskAsa}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Protocolo hemodinámico estricto</p>
        </div>
      </div>

      {/* ── TABLERO DE CONTROL QUIRÚRGICO REACTIVO ── */}
      <SurgeryBoard
        branchCode={branch}
        initialSurgeries={serializeData(surgeries) as any}
        patients={serializeData(patients) as any}
        doctors={serializeData(doctors) as any}
        rooms={serializeData(rooms) as any}
      />
    </div>
  );
}
