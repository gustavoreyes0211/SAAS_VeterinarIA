import React from "react";
import Link from "next/link";
import { getConsultations } from "@/lib/actions/consultations";
import { ConsultationTable } from "@/components/clinical/ConsultationTable";
import {
  Stethoscope,
  Plus,
  Lock,
  Activity,
  Pill,
  Building2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsultasPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function ConsultasPage({ params }: ConsultasPageProps) {
  const { branch } = await params;
  const consultations = await getConsultations({ branchCode: branch });

  const total = consultations.length;
  const closed = consultations.filter((c) => c.isClosed).length;
  const open = total - closed;
  const withPrescription = consultations.filter(
    (c) => c.prescriptions && c.prescriptions.length > 0
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
            <span className="text-slate-400 uppercase tracking-wider">Actos Clínicos</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-emerald-400" />
            Consultas Médicas (SOAP AAHA)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historial de actos clínicos, constantes vitales, examen de 10 órganos y recetas digitales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${branch}/consultas/nueva`}>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950/40 text-xs">
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva Consulta Médica
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPIs DE CONSULTAS MÉDICAS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Consultas</span>
            <Stethoscope className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Actos asentados en sede</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cerradas / Inmutables</span>
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{closed}</div>
          <p className="text-[11px] text-slate-500 mt-1">Protegidas con adendas</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">En Proceso / Abiertas</span>
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{open}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pendientes de cierre médico</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Recetas Digitales</span>
            <Pill className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 mt-2">{withPrescription}</div>
          <p className="text-[11px] text-slate-500 mt-1">Prescripciones emitidas</p>
        </div>
      </div>

      {/* ── TABLA REACTIVA DE CONSULTAS ── */}
      <ConsultationTable
        branchCode={branch}
        initialConsultations={consultations as any}
      />
    </div>
  );
}
