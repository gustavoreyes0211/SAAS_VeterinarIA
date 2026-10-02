"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bed,
  Droplet,
  Activity,
  Heart,
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FluidsCalculatorModal } from "./FluidsCalculatorModal";
import { markExecutionAdministered, addHospitalizationOrder } from "@/lib/actions/hospitalization";

interface FlowboardItem {
  id: string;
  admissionDate: Date | string;
  admissionWeightKg: any;
  status: string;
  admissionReason: string;
  patient: {
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    knownAllergies: string[];
    temperamentAlert: string;
    client: {
      firstName: string;
      lastName: string;
      phoneE164: string;
    };
  };
  attendingVet: {
    fullName: string;
  };
  orders: {
    id: string;
    orderType: string;
    name: string;
    rateMlHr: any | null;
    frequencyHours: number | null;
    instructions: string | null;
    executions: {
      id: string;
      scheduledAt: Date | string;
      status: string;
      administeredAt?: Date | string | null;
    }[];
  }[];
}

interface UciFlowboardProps {
  branchCode: string;
  initialHospitalizations: FlowboardItem[];
}

export function UciFlowboard({
  branchCode,
  initialHospitalizations,
}: UciFlowboardProps) {
  const [hospitalizations, setHospitalizations] = useState<FlowboardItem[]>(initialHospitalizations);
  const [selectedHospId, setSelectedHospId] = useState<string>(
    initialHospitalizations[0]?.id || ""
  );

  const selectedHosp = hospitalizations.find((h) => h.id === selectedHospId);

  // Marcar dosis administrada
  const handleMarkAdministered = async (executionId: string) => {
    const res = await markExecutionAdministered(executionId, "Administrado por enfermería de UCI.", branchCode);
    if (res.success) {
      setHospitalizations((prev) =>
        prev.map((h) => ({
          ...h,
          orders: h.orders.map((o) => ({
            ...o,
            executions: o.executions.map((e) =>
              e.id === executionId
                ? { ...e, status: "ADMINISTERED", administeredAt: new Date().toISOString() }
                : e
            ),
          })),
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── CUADRÍCULA DE CANILES Y JAULAS DE HOSPITALIZACIÓN ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Caniles & Camas UCI Ocupadas ({hospitalizations.length} / 8 Disponibles)
            </h2>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Monitoreo 24 Horas en Tiempo Real
          </span>
        </div>

        {hospitalizations.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            <Bed className="h-10 w-10 mx-auto mb-2 text-slate-600" />
            <h3 className="text-sm font-bold text-white">No hay pacientes hospitalizados en este momento</h3>
            <p className="text-xs text-slate-400 mt-1">
              Todos los caniles y boxes de cuidados intensivos están libres y esterilizados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitalizations.map((hosp, idx) => {
              const isSelected = hosp.id === selectedHospId;
              const fluidOrder = hosp.orders.find((o) => o.orderType === "FLUIDS");
              const pWeight = Number(hosp.admissionWeightKg) || 10;

              return (
                <div
                  key={hosp.id}
                  onClick={() => setSelectedHospId(hosp.id)}
                  className={`rounded-2xl border p-5 backdrop-blur-md cursor-pointer transition-all ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-950/20 ring-2 ring-cyan-500 shadow-xl shadow-cyan-950/50"
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-lg font-bold shrink-0">
                        {hosp.patient.species === "CANINE" ? "🐶" : "🐱"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-sm text-white font-bold">
                            {hosp.patient.name}
                          </strong>
                          <span className="text-xs text-slate-400 font-mono font-semibold">
                            ({pWeight} kg)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Tutor: {hosp.patient.client.firstName} {hosp.patient.client.lastName}
                        </div>
                      </div>
                    </div>

                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-mono">
                      Box {idx + 1}
                    </Badge>
                  </div>

                  {/* Motivo de Ingreso */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    <strong>Ingreso:</strong> {hosp.admissionReason}
                  </p>

                  {/* Alertas de Alergias */}
                  {hosp.patient.knownAllergies.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-red-300 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded-md inline-block">
                        ⚠️ Alergia: {hosp.patient.knownAllergies.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Fluidoterapia Activa */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 mb-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Droplet className="h-3.5 w-3.5" />
                      <span className="font-semibold text-slate-300">Fluidoterapia:</span>
                    </div>
                    {fluidOrder ? (
                      <span className="font-mono font-bold text-cyan-300">
                        {Number(fluidOrder.rateMlHr)} ml/h
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Sin bomba</span>
                    )}
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <FluidsCalculatorModal
                      hospitalizationId={hosp.id}
                      patientName={hosp.patient.name}
                      defaultWeightKg={pWeight}
                      branchCode={branchCode}
                      onOrderAdded={() => {
                        window.location.reload();
                      }}
                    />

                    <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-0.5">
                      Ver Matriz 24h <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MATRIZ DE EJECUCIÓN HORARIA (FLOWBOARD 24 HORAS) ── */}
      {selectedHosp && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Hoja de Tratamiento 24 Horas (Flowboard)
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Activa
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Paciente: {selectedHosp.patient.name} ({selectedHosp.admissionWeightKg} kg) • Médico: {selectedHosp.attendingVet.fullName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <FluidsCalculatorModal
                hospitalizationId={selectedHosp.id}
                patientName={selectedHosp.patient.name}
                defaultWeightKg={Number(selectedHosp.admissionWeightKg)}
                branchCode={branchCode}
                onOrderAdded={() => {
                  window.location.reload();
                }}
              />
            </div>
          </div>

          {/* Lista de Órdenes y Chequeos de Enfermería */}
          {selectedHosp.orders.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              No hay órdenes médicas activas para este paciente. Usa el botón "Calculadora Fluidos" para programar infusiones.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedHosp.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 text-xs">
                        <Pill className="h-3.5 w-3.5" />
                      </span>
                      <strong className="text-sm font-bold text-white">{order.name}</strong>
                      {order.rateMlHr && (
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {Number(order.rateMlHr)} ml/h
                        </span>
                      )}
                    </div>
                    {order.instructions && (
                      <span className="text-xs text-slate-400 italic">
                        {order.instructions}
                      </span>
                    )}
                  </div>

                  {/* Matriz de Dosis Horarias Programadas */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.executions.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">
                        Infusión continua activa sin tomas fraccionadas.
                      </span>
                    ) : (
                      order.executions.map((exec) => {
                        const isDone = exec.status === "ADMINISTERED";
                        const timeStr = new Date(exec.scheduledAt).toLocaleTimeString("es-SV", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <button
                            key={exec.id}
                            type="button"
                            onClick={() => !isDone && handleMarkAdministered(exec.id)}
                            className={`px-3 py-2 rounded-xl text-center border transition-all shrink-0 ${
                              isDone
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500"
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {timeStr}
                            </span>
                            <div className="flex items-center justify-center gap-1 mt-0.5 font-bold text-xs">
                              {isDone ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Dado</span>
                                </>
                              ) : (
                                <span>Pendiente</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
