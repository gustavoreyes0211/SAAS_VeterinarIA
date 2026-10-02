import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Siren,
  Scissors,
  Activity,
  DoorOpen,
  ArrowUpRight,
  Clock,
  Sparkles,
  HeartPulse,
  Pill,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BranchDashboardPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function BranchDashboardPage({ params }: BranchDashboardPageProps) {
  const { branch } = await params;
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── BANNER DE BIENVENIDA CLÍNICA ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="default" className="gap-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                Guardia Quirúrgica Activa 24/7
              </Badge>
              <span className="text-xs text-slate-400">
                Sede Central • Consultorio 1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bienvenida, <span className="text-emerald-400">Dra. Andrea Martínez</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>Cédula Profesional: <strong className="text-white">JVPM #4821</strong></span>
              <span>•</span>
              <span>Especialidad: <strong>Cirugía de Tejidos Blandos & Trauma</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-10 shadow-lg shadow-emerald-600/20"
            >
              <Link href={`/${branch}/consultas/nueva`}>
                <Stethoscope className="h-4 w-4 mr-1.5" />
                Nueva Consulta SOAP
              </Link>
            </Button>
            <Button
              asChild
              variant="destructive"
              className="font-medium text-xs h-10 shadow-lg shadow-rose-600/20"
            >
              <Link href={`/${branch}/emergencias`}>
                <Siren className="h-4 w-4 mr-1.5 animate-pulse" />
                Triaje Urgencias (VECCS)
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── TARJETAS KPI DE ALTA PRECISIÓN CLÍNICA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Urgencias VECCS */}
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/80 p-5 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Triaje Emergencias
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Siren className="h-4 w-4 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">2</span>
            <span className="text-xs text-rose-400 font-medium">En Código Rojo/Naranja</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            1 canino politraumatizado en Box de Choque 1
          </p>
        </div>

        {/* KPI 2: UCI Flowboard 24/7 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Pizarra UCI 24/7
            </span>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">5</span>
            <span className="text-xs text-slate-400 font-medium">/ 8 Caniles Ocupados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            4 pacientes con bomba de infusión continua CRI
          </p>
        </div>

        {/* KPI 3: Quirófano */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Centro Quirúrgico
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Scissors className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">1</span>
            <span className="text-xs text-emerald-400 font-medium">Cirugía en Curso</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Quirófano 1: Laparotomía exploratoria (ASA III)
          </p>
        </div>

        {/* KPI 4: Farmacia Hospitalaria */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-amber-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Viales Abiertos (UCI)
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Pill className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">8</span>
            <span className="text-xs text-slate-400 font-medium">Frascos en Uso</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fraccionamiento exacto en ml/mg sin pérdidas
          </p>
        </div>
      </div>

      {/* ── SECTOR CENTRAL: LLAMADOR DE TURNOS & SALAS FÍSICAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pacientes en Espera / Llamado a Smart TV */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                Cola de Espera Activa (Llamado a Smart TV)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Al pulsar &quot;Llamar a Consultorio&quot;, la pantalla en sala de espera emitirá la campana y proyectará el ticket.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              3 en espera
            </Badge>
          </div>

          <div className="divide-y divide-slate-800/80">
            {/* Paciente 1 */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                  A-102
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      Rocky (Canino • Bulldog Francés • 14.2 kg)
                    </span>
                    <Badge variant="warning" className="text-[10px]">
                      Prioritario
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tutor: Carlos Mendoza (DUI: 04581290-3) • Motivo: Dificultad respiratoria aguda
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
              >
                Llamar a Cons. 1
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Paciente 2 */}
            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                  A-103
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      Luna (Felino • Siamés • 3.8 kg)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Tutora: María Hernández • Motivo: Control de Vacunación Anual Triple Felina
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
              >
                Llamar
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Estado Operativo de Salas Físicas */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-emerald-400" />
              Salas & Quirófanos
            </h3>
            <span className="text-[11px] text-slate-400">Tiempo Real</span>
          </div>

          <div className="space-y-2.5">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">Consultorio 1 (Caninos)</span>
                <span className="text-[10px] text-emerald-400 font-medium">Asignado: Dra. Andrea Martínez</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                Disponible
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">Quirófano 1 (Estéril)</span>
                <span className="text-[10px] text-amber-400 font-medium">En cirugía: Dr. Fernando Ruiz</span>
              </div>
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] animate-pulse">
                Ocupado
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">Sala Rayos X (Plomada)</span>
                <span className="text-[10px] text-slate-400">Limpieza & Esterilización UV</span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                Desinfección
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
