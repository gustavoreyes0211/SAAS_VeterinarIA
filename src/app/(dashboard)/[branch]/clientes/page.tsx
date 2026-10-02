import React from "react";
import { getClients } from "@/lib/actions/clients";
import { ClientTable } from "@/components/clients/ClientTable";
import { serializeData } from "@/lib/utils";
import {
  Users,
  PawPrint,
  Sparkles,
  ShieldAlert,
  CreditCard,
  Building2,
} from "lucide-react";
import { ClientCategoryTag } from "@prisma/client";

interface ClientesPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function ClientesPage({ params }: ClientesPageProps) {
  const { branch } = await params;
  const clients = await getClients({ branchCode: branch });

  const totalClients = clients.length;
  const totalPatients = clients.reduce((acc, c) => acc + c.patients.length, 0);
  const vipClients = clients.filter((c) => c.category === ClientCategoryTag.VIP).length;
  const debtorClients = clients.filter(
    (c) => Number(c.currentBalance) < 0 || c.category === ClientCategoryTag.DEBTOR
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
            <span className="text-slate-400 uppercase tracking-wider">Padrón de Tutores</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Clientes y Tutores Responsables
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de responsables legales, facturación electrónica (DTE) y contactos de emergencia.
          </p>
        </div>
      </div>

      {/* ── TARJETAS DE MÉTRICAS (KPIS) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* KPI 1: Total Clientes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Tutores</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {totalClients}
            </span>
            <span className="text-[10px] text-slate-400">registrados</span>
          </div>
        </div>

        {/* KPI 2: Pacientes Vinculados */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Mascotas Activas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <PawPrint className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {totalPatients}
            </span>
            <span className="text-[10px] text-slate-400">pacientes</span>
          </div>
        </div>

        {/* KPI 3: Tutores VIP */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Clientes VIP</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {vipClients}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">prioritarios</span>
          </div>
        </div>

        {/* KPI 4: Con Saldos / Morosos */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cuentas por Cobrar</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {debtorClients}
            </span>
            <span className="text-[10px] text-rose-400 font-medium">pendientes</span>
          </div>
        </div>
      </div>

      {/* ── TABLA PRINCIPAL DE CLIENTES ── */}
      <ClientTable initialClients={serializeData(clients) as any} branchCode={branch} />
    </div>
  );
}
