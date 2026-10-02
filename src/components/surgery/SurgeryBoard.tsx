"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scissors,
  Clock,
  Activity,
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  ChevronRight,
  Filter,
  User,
  Sparkles,
} from "lucide-react";
import { NewSurgeryModal } from "./NewSurgeryModal";

interface SurgeryItem {
  id: string;
  surgeryName: string;
  asaGrade: string;
  status: string;
  preOpWeightKg: number | string;
  surgeryStartTime: string | Date | null;
  surgeryEndTime: string | Date | null;
  checklistSignInPassed: boolean;
  checklistTimeOutPassed: boolean;
  checklistSignOutPassed: boolean;
  patient: {
    id: string;
    name: string;
    species: string;
    breed: string;
    client?: {
      firstName: string;
      lastName: string;
    };
  };
  leadSurgeon: {
    fullName: string;
  };
  anesthesiologist?: {
    fullName: string;
  } | null;
  room?: {
    name: string;
    code: string;
  } | null;
  anesthesiaLogs?: Array<{
    heartRateBpm: number | null;
    spo2Percent: number | string | null;
    meanBp: number | null;
    recordedAt: string | Date;
  }>;
}

interface SurgeryBoardProps {
  branchCode: string;
  initialSurgeries: SurgeryItem[];
  patients: any[];
  doctors: any[];
  rooms: any[];
}

export function SurgeryBoard({
  branchCode,
  initialSurgeries,
  patients,
  doctors,
  rooms,
}: SurgeryBoardProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = initialSurgeries.filter((s) => {
    if (filterStatus === "ALL") return true;
    return s.status === filterStatus;
  });

  const asaColors: Record<string, string> = {
    ASA_I: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ASA_II: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    ASA_III: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    ASA_IV: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    ASA_V: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ASA_E: "bg-red-600 text-white border-red-500 animate-pulse",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: "Programada", color: "bg-slate-800 text-slate-300" },
    PRE_OP: { label: "Pre-Quirófano", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    IN_SURGERY: { label: "En Pabellón", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse" },
    RECOVERY: { label: "Recuperación", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    COMPLETED: { label: "Completada", color: "bg-slate-700/50 text-slate-400" },
    CANCELLED: { label: "Cancelada", color: "bg-rose-500/20 text-rose-300" },
  };

  return (
    <div className="space-y-6">
      {/* ── BARRA DE FILTROS Y NUEVA CIRUGÍA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filtros de Estado */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          {[
            { id: "ALL", label: "Todas", count: initialSurgeries.length },
            {
              id: "IN_SURGERY",
              label: "En Pabellón",
              count: initialSurgeries.filter((s) => s.status === "IN_SURGERY").length,
            },
            {
              id: "PRE_OP",
              label: "Pre-Quirófano",
              count: initialSurgeries.filter((s) => s.status === "PRE_OP").length,
            },
            {
              id: "SCHEDULED",
              label: "Programadas",
              count: initialSurgeries.filter((s) => s.status === "SCHEDULED").length,
            },
            {
              id: "RECOVERY",
              label: "Recuperación",
              count: initialSurgeries.filter((s) => s.status === "RECOVERY").length,
            },
            {
              id: "COMPLETED",
              label: "Completadas",
              count: initialSurgeries.filter((s) => s.status === "COMPLETED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterStatus === tab.id ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Botón Nueva Cirugía */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nueva Cirugía
        </button>
      </div>

      {/* ── LISTADO / CARDS QUIRÚRGICAS ── */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/20">
          <Scissors className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">
            No hay cirugías en esta categoría
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Puedes programar una intervención electiva o dar ingreso inmediato a una urgencia quirúrgica.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Programar Cirugía
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => {
            const latestVital = s.anesthesiaLogs?.[0];
            const isInSurgery = s.status === "IN_SURGERY";

            return (
              <div
                key={s.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between backdrop-blur-md shadow-xl ${
                  isInSurgery
                    ? "border-emerald-500/50 bg-slate-900/90 shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        asaColors[s.asaGrade] || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {s.asaGrade.replace("_", " ")}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        statusLabels[s.status]?.color || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {statusLabels[s.status]?.label || s.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {s.surgeryName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pabellón: <strong className="text-slate-300">{s.room?.name || "Pabellón General"}</strong>
                    </p>
                  </div>

                  {/* Paciente y Tutor */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white">{s.patient.name}</span>
                      <span className="text-indigo-400 font-mono font-semibold">
                        {Number(s.preOpWeightKg)} kg
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {s.patient.species === "CANINE" ? "Canino" : "Felino"} • {s.patient.breed}
                    </div>
                    {s.patient.client && (
                      <div className="text-[10px] text-slate-500">
                        Tutor: {s.patient.client.firstName} {s.patient.client.lastName}
                      </div>
                    )}
                  </div>

                  {/* Equipo Quirúrgico */}
                  <div className="text-xs text-slate-400 space-y-0.5">
                    <div>Cirujano: <strong className="text-slate-200">{s.leadSurgeon.fullName}</strong></div>
                    {s.anesthesiologist && (
                      <div>Anestesista: <strong className="text-slate-200">{s.anesthesiologist.fullName}</strong></div>
                    )}
                  </div>

                  {/* Checklist OMS Badges */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                    <span className="font-semibold">Checklist OMS:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        s.checklistSignInPassed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      Sign In {s.checklistSignInPassed ? "✓" : "✗"}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        s.checklistTimeOutPassed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      Time Out {s.checklistTimeOutPassed ? "✓" : "✗"}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono ${
                        s.checklistSignOutPassed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      Sign Out {s.checklistSignOutPassed ? "✓" : "✗"}
                    </span>
                  </div>

                  {/* Últimos signos vitales si existen */}
                  {latestVital && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">
                      <span className="text-rose-400">FC: {latestVital.heartRateBpm ?? "--"}</span>
                      <span className="text-emerald-400">SpO2: {latestVital.spo2Percent ? `${Number(latestVital.spo2Percent)}%` : "--"}</span>
                      <span className="text-indigo-300">PAM: {latestVital.meanBp ?? "--"}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isInSurgery ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Monitoreo Activo
                      </span>
                    ) : (
                      `ID: ${s.id.slice(0, 8)}`
                    )}
                  </span>

                  <Link
                    href={`/${branchCode}/quirofano/${s.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    Abrir Monitor
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Cirugía */}
      <NewSurgeryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branchCode={branchCode}
        patients={patients}
        doctors={doctors}
        rooms={rooms}
      />
    </div>
  );
}
