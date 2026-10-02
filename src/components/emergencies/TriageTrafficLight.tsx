"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Siren,
  Zap,
  Activity,
  Heart,
  Wind,
  Clock,
  ArrowRight,
  ShieldAlert,
  Bed,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  User,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmergencyTriageColor, EmergencyClinicalStatus } from "@prisma/client";
import { updateTriageStatus, toggleCodeRedBroadcast } from "@/lib/actions/emergencies";

interface TriageItem {
  id: string;
  triageColor: EmergencyTriageColor;
  clinicalStatus: EmergencyClinicalStatus;
  chiefComplaint: string;
  estimatedOrFastWeightKg: any;
  airwayStatus: string;
  breathingEffort: string;
  circulationPulse: string;
  mucousColor: string;
  heartRateBpm: number | null;
  spo2Percent: any | null;
  assignedShockTable: string | null;
  isCodeRedBroadcasted: boolean;
  admittedAt: Date | string;
  patient: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    breedRelation?: { name: string } | null;
    knownAllergies: string[];
    temperamentAlert: string;
    client: {
      firstName: string;
      lastName: string;
      phoneE164: string;
    };
  } | null;
}

interface TriageTrafficLightProps {
  branchCode: string;
  initialTriages: TriageItem[];
}

export function TriageTrafficLight({
  branchCode,
  initialTriages,
}: TriageTrafficLightProps) {
  const [filterColor, setFilterColor] = useState<string>("ALL");
  const [triages, setTriages] = useState<TriageItem[]>(initialTriages);

  // Contadores del semáforo
  const countRed = triages.filter((t) => t.triageColor === EmergencyTriageColor.RED_IMMEDIATE).length;
  const countOrange = triages.filter((t) => t.triageColor === EmergencyTriageColor.ORANGE_VERY_URGENT).length;
  const countYellow = triages.filter((t) => t.triageColor === EmergencyTriageColor.YELLOW_URGENT).length;
  const countGreen = triages.filter((t) => t.triageColor === EmergencyTriageColor.GREEN_STANDARD).length;
  const countBlue = triages.filter((t) => t.triageColor === EmergencyTriageColor.BLUE_NON_URGENT).length;

  const filteredTriages = triages.filter((t) => {
    if (filterColor === "ALL") return true;
    return t.triageColor === filterColor;
  });

  const handleStatusChange = async (triageId: string, newStatus: EmergencyClinicalStatus) => {
    const res = await updateTriageStatus(triageId, newStatus, branchCode);
    if (res.success) {
      setTriages((prev) =>
        prev.map((t) => (t.id === triageId ? { ...t, clinicalStatus: newStatus } : t))
      );
    }
  };

  const handleToggleCodeRed = async (triageId: string, current: boolean) => {
    const res = await toggleCodeRedBroadcast(triageId, !current, branchCode);
    if (res.success) {
      setTriages((prev) =>
        prev.map((t) => (t.id === triageId ? { ...t, isCodeRedBroadcasted: !current } : t))
      );
    }
  };

  const getColorConfig = (color: EmergencyTriageColor) => {
    switch (color) {
      case EmergencyTriageColor.RED_IMMEDIATE:
        return {
          title: "ROJO • Resucitación / Choque",
          waitTime: "0 min (Inmediato)",
          badgeBg: "bg-red-600 text-white",
          border: "border-red-500/60",
          bgLight: "bg-red-950/20",
          text: "text-red-400",
        };
      case EmergencyTriageColor.ORANGE_VERY_URGENT:
        return {
          title: "NARANJA • Muy Urgente",
          waitTime: "< 15 min",
          badgeBg: "bg-amber-600 text-white",
          border: "border-amber-500/60",
          bgLight: "bg-amber-950/20",
          text: "text-amber-400",
        };
      case EmergencyTriageColor.YELLOW_URGENT:
        return {
          title: "AMARILLO • Urgente",
          waitTime: "< 60 min",
          badgeBg: "bg-yellow-600 text-white",
          border: "border-yellow-500/60",
          bgLight: "bg-yellow-950/20",
          text: "text-yellow-400",
        };
      case EmergencyTriageColor.GREEN_STANDARD:
        return {
          title: "VERDE • Estándar",
          waitTime: "< 120 min",
          badgeBg: "bg-emerald-600 text-white",
          border: "border-emerald-500/60",
          bgLight: "bg-emerald-950/20",
          text: "text-emerald-400",
        };
      default:
        return {
          title: "AZUL • No Urgente",
          waitTime: "Programable",
          badgeBg: "bg-blue-600 text-white",
          border: "border-blue-500/60",
          bgLight: "bg-blue-950/20",
          text: "text-blue-400",
        };
    }
  };

  const getElapsedTime = (admittedAt: Date | string) => {
    const diffMs = Date.now() - new Date(admittedAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Recién admitido";
    if (mins === 1) return "Hace 1 minuto";
    if (mins < 60) return `Hace ${mins} minutos`;
    const hours = Math.floor(mins / 60);
    return `Hace ${hours}h ${mins % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* ── SEMÁFORO VISUAL INTERACTIVO VECCS (5 NIVELES) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Rojo */}
        <button
          type="button"
          onClick={() => setFilterColor(filterColor === EmergencyTriageColor.RED_IMMEDIATE ? "ALL" : EmergencyTriageColor.RED_IMMEDIATE)}
          className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
            filterColor === EmergencyTriageColor.RED_IMMEDIATE
              ? "border-red-500 bg-red-950/40 ring-2 ring-red-500"
              : "border-red-900/50 bg-red-950/20 hover:border-red-500/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-400 mb-1">
            <span>🔴 ROJO (0 min)</span>
            <span className="text-[10px] uppercase font-mono tracking-wider">Inmediato</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">{countRed}</div>
          <p className="text-[11px] text-red-300 mt-1">Paro / Choque / Coma</p>
        </button>

        {/* Naranja */}
        <button
          type="button"
          onClick={() => setFilterColor(filterColor === EmergencyTriageColor.ORANGE_VERY_URGENT ? "ALL" : EmergencyTriageColor.ORANGE_VERY_URGENT)}
          className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
            filterColor === EmergencyTriageColor.ORANGE_VERY_URGENT
              ? "border-amber-500 bg-amber-950/40 ring-2 ring-amber-500"
              : "border-amber-900/50 bg-amber-950/20 hover:border-amber-500/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1">
            <span>🟠 NARANJA (&lt;15m)</span>
            <span className="text-[10px] uppercase font-mono tracking-wider">Crítico</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">{countOrange}</div>
          <p className="text-[11px] text-amber-300 mt-1">Disnea / Convulsión</p>
        </button>

        {/* Amarillo */}
        <button
          type="button"
          onClick={() => setFilterColor(filterColor === EmergencyTriageColor.YELLOW_URGENT ? "ALL" : EmergencyTriageColor.YELLOW_URGENT)}
          className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
            filterColor === EmergencyTriageColor.YELLOW_URGENT
              ? "border-yellow-500 bg-yellow-950/40 ring-2 ring-yellow-500"
              : "border-yellow-900/50 bg-yellow-950/20 hover:border-yellow-500/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-yellow-400 mb-1">
            <span>🟡 AMARILLO (&lt;1h)</span>
            <span className="text-[10px] uppercase font-mono tracking-wider">Urgente</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">{countYellow}</div>
          <p className="text-[11px] text-yellow-300 mt-1">Vómito / Dolor agudo</p>
        </button>

        {/* Verde */}
        <button
          type="button"
          onClick={() => setFilterColor(filterColor === EmergencyTriageColor.GREEN_STANDARD ? "ALL" : EmergencyTriageColor.GREEN_STANDARD)}
          className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
            filterColor === EmergencyTriageColor.GREEN_STANDARD
              ? "border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500"
              : "border-emerald-900/50 bg-emerald-950/20 hover:border-emerald-500/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
            <span>🟢 VERDE (&lt;2h)</span>
            <span className="text-[10px] uppercase font-mono tracking-wider">Estándar</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">{countGreen}</div>
          <p className="text-[11px] text-emerald-300 mt-1">Heridas leves / Cojera</p>
        </button>

        {/* Azul */}
        <button
          type="button"
          onClick={() => setFilterColor(filterColor === EmergencyTriageColor.BLUE_NON_URGENT ? "ALL" : EmergencyTriageColor.BLUE_NON_URGENT)}
          className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden col-span-2 sm:col-span-1 ${
            filterColor === EmergencyTriageColor.BLUE_NON_URGENT
              ? "border-blue-500 bg-blue-950/40 ring-2 ring-blue-500"
              : "border-blue-900/50 bg-blue-950/20 hover:border-blue-500/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-400 mb-1">
            <span>🔵 AZUL</span>
            <span className="text-[10px] uppercase font-mono tracking-wider">No Urgente</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">{countBlue}</div>
          <p className="text-[11px] text-blue-300 mt-1">Trámites / Chequeos</p>
        </button>
      </div>

      {/* ── LISTA DE PACIENTES EN URGENCIAS ACTIVAS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">
              Cola de Pacientes en Urgencias ({filteredTriages.length})
            </h2>
          </div>

          {filterColor !== "ALL" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterColor("ALL")}
              className="text-xs border-slate-700 text-slate-300 h-8 gap-1"
            >
              <Filter className="h-3 w-3" />
              Limpiar Filtro ({filterColor})
            </Button>
          )}
        </div>

        {filteredTriages.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
            <h3 className="text-sm font-bold text-white">No hay pacientes en este nivel de urgencia</h3>
            <p className="text-xs text-slate-400 mt-1">
              La sala de espera de este nivel se encuentra despejada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTriages.map((triage) => {
              const cfg = getColorConfig(triage.triageColor);
              const pWeight = Number(triage.estimatedOrFastWeightKg) || 10;
              const pName = triage.patient?.name || "Paciente de Emergencia";

              return (
                <div
                  key={triage.id}
                  className={`rounded-2xl border p-5 backdrop-blur-md transition-all ${cfg.border} ${cfg.bgLight} ${
                    triage.isCodeRedBroadcasted
                      ? "ring-2 ring-rose-500 shadow-xl shadow-rose-950/50"
                      : "bg-slate-900/60"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Identificación y Motivo */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs font-bold ${cfg.badgeBg}`}>
                          {cfg.title}
                        </Badge>

                        {triage.isCodeRedBroadcasted && (
                          <Badge className="bg-rose-600 text-white animate-pulse font-mono text-xs flex items-center gap-1">
                            <Zap className="h-3 w-3" /> CÓDIGO ROJO ACTIVO
                          </Badge>
                        )}

                        <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                          {triage.assignedShockTable || "Box de Choque 1"}
                        </Badge>

                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {getElapsedTime(triage.admittedAt)}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-white">
                          {triage.patient ? (
                            <>
                              <span>{triage.patient.species === "CANINE" ? "🐶" : "🐱"}</span>{" "}
                              {triage.patient.name}
                            </>
                          ) : (
                            "🐾 Paciente Urgente"
                          )}
                        </h3>
                        <span className="text-xs text-slate-300 font-mono font-bold">
                          ({pWeight} kg)
                        </span>
                        {triage.patient?.breed && (
                          <span className="text-xs text-slate-400">
                            • {triage.patient.breed}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 font-medium">
                        <strong>Motivo:</strong> {triage.chiefComplaint}
                      </p>

                      {/* Parámetros Fisiológicos ABC Rápidos */}
                      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400 pt-1">
                        <div>
                          Vía Aérea: <strong className="text-slate-200">{triage.airwayStatus}</strong>
                        </div>
                        <div>•</div>
                        <div>
                          Respiración: <strong className="text-slate-200">{triage.breathingEffort}</strong>
                        </div>
                        <div>•</div>
                        <div>
                          Pulso: <strong className="text-slate-200">{triage.circulationPulse}</strong>
                        </div>
                        {triage.heartRateBpm && (
                          <>
                            <div>•</div>
                            <div>
                              FC: <strong className="text-rose-400 font-mono">{triage.heartRateBpm} lpm</strong>
                            </div>
                          </>
                        )}
                        {triage.spo2Percent && (
                          <>
                            <div>•</div>
                            <div>
                              SpO2: <strong className="text-cyan-400 font-mono">{Number(triage.spo2Percent)}%</strong>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Acciones y Derivación Rápida */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      {/* Enlace directo a Carrito Rojo con peso pre-cargado */}
                      <Link
                        href={`/${branchCode}/emergencias/crash-cart?weight=${pWeight}&name=${encodeURIComponent(pName)}`}
                      >
                        <Button
                          size="sm"
                          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 gap-1.5 shadow-md shadow-rose-600/30"
                        >
                          <Zap className="h-3.5 w-3.5 fill-white" />
                          Carrito Rojo CPR
                        </Button>
                      </Link>

                      {/* Derivar a UCI */}
                      <Link href={`/${branchCode}/uci?patientId=${triage.patient?.id || ""}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-cyan-800/80 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 text-xs h-9 gap-1"
                        >
                          <Bed className="h-3.5 w-3.5 text-cyan-400" />
                          Pase a UCI
                        </Button>
                      </Link>

                      {/* Alternar Código Rojo */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCodeRed(triage.id, triage.isCodeRedBroadcasted)}
                        className={`text-xs h-9 ${
                          triage.isCodeRedBroadcasted
                            ? "border-rose-500 bg-rose-600 text-white"
                            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Siren className="h-3.5 w-3.5" />
                        {triage.isCodeRedBroadcasted ? "Silenciar Código Rojo" : "Activar Código Rojo"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
