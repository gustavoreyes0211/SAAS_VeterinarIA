"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplet, Activity, CheckCircle2, Scale, Calculator } from "lucide-react";
import { calculateFluidTherapy, addHospitalizationOrder } from "@/lib/actions/hospitalization";

interface FluidsCalculatorModalProps {
  hospitalizationId?: string;
  patientName?: string;
  defaultWeightKg?: number;
  branchCode: string;
  onOrderAdded?: () => void;
  triggerButton?: React.ReactNode;
}

export function FluidsCalculatorModal({
  hospitalizationId,
  patientName = "Paciente Hospitalizado",
  defaultWeightKg = 10,
  branchCode,
  onOrderAdded,
  triggerButton,
}: FluidsCalculatorModalProps) {
  const [open, setOpen] = useState(false);
  const [weightKg, setWeightKg] = useState<number>(defaultWeightKg);
  const [dehydrationPercent, setDehydrationPercent] = useState<number>(5);
  const [maintenanceRate, setMaintenanceRate] = useState<number>(50); // ml/kg/día
  const [ongoingLosses, setOngoingLosses] = useState<number>(100); // ml/día
  const [isSaving, setIsSaving] = useState(false);

  // Cálculos en vivo
  const w = Math.max(0.1, Number(weightKg) || 1);
  const dehy = Math.max(0, Math.min(15, Number(dehydrationPercent) || 0));
  const maintVol = w * maintenanceRate;
  const deficitVol = w * (dehy / 100) * 1000;
  const total24h = maintVol + deficitVol + ongoingLosses;
  const rateMlHr = total24h / 24;
  const dropsNormo = (rateMlHr * 20) / 60; // 20 gotas / ml
  const dropsMicro = (rateMlHr * 60) / 60; // 60 gotas / ml

  const handleApplyOrder = async () => {
    if (!hospitalizationId) return;
    setIsSaving(true);

    await addHospitalizationOrder(
      {
        hospitalizationId,
        orderType: "FLUIDS",
        name: `Fluidoterapia Cristaloides (${dehy}% deshidratación)`,
        rateMlHr: Number(rateMlHr.toFixed(1)),
        frequencyHours: 24,
        instructions: `Solución Hartmann a ${rateMlHr.toFixed(1)} ml/h (${Math.round(dropsNormo)} gotas/min normogotero). Volumen 24h: ${Math.round(total24h)} ml.`,
      },
      branchCode
    );

    setIsSaving(false);
    setOpen(false);
    if (onOrderAdded) onOrderAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="outline"
            size="sm"
            className="border-cyan-800/80 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 text-xs h-9 gap-1.5"
          >
            <Droplet className="h-4 w-4 text-cyan-400" />
            Calculadora Fluidos
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-white p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Droplet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Calculadora de Fluidoterapia Hospitalaria
              </DialogTitle>
              <p className="text-xs text-slate-400">
                {patientName} • Mantenimiento + Déficit de Deshidratación + Pérdidas Continuas
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Parámetros de Entrada */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <Scale className="h-3 w-3 text-emerald-400" /> Peso ($kg$)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">% Deshidratación</label>
              <select
                value={dehydrationPercent}
                onChange={(e) => setDehydrationPercent(Number(e.target.value))}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-white"
              >
                <option value={0}>0% (Normovolémico)</option>
                <option value={5}>5% (TLLC levemente prolongado)</option>
                <option value={7}>7% (Pliegue cutáneo retrasado)</option>
                <option value={10}>10% (Ojos hundidos, shock leve)</option>
                <option value={12}>12% (Shock hipovolémico severo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Tasa Mantenimiento</label>
              <select
                value={maintenanceRate}
                onChange={(e) => setMaintenanceRate(Number(e.target.value))}
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-white"
              >
                <option value={40}>40 ml/kg/d (Gato / Cardiópata)</option>
                <option value={50}>50 ml/kg/d (Estándar)</option>
                <option value={60}>60 ml/kg/d (Perro joven / Activo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Pérdidas 24h ($ml$)</label>
              <Input
                type="number"
                step="10"
                value={ongoingLosses}
                onChange={(e) => setOngoingLosses(Number(e.target.value))}
                placeholder="ej. 100"
                className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* Desglose de Volúmenes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Desglose de Volumen Requerido en 24 Horas:
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Mantenimiento</span>
                <span className="text-base font-bold text-white font-mono mt-0.5 block">
                  {Math.round(maintVol)} <span className="text-xs font-normal text-slate-400">ml</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Déficit Deshidratación</span>
                <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">
                  {Math.round(deficitVol)} <span className="text-xs font-normal text-slate-400">ml</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pérdidas Proyectadas</span>
                <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">
                  {ongoingLosses} <span className="text-xs font-normal text-slate-400">ml</span>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Volumen Total en 24 Horas:</span>
              <span className="text-lg font-extrabold text-white font-mono">
                {Math.round(total24h)} ml / día
              </span>
            </div>
          </div>

          {/* Tarjetas de Programación de Bomba y Gotero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
            {/* Bomba de Infusión */}
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-4">
              <span className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider block">
                Bomba de Infusión Continua
              </span>
              <div className="text-3xl font-extrabold text-white font-mono mt-1">
                {rateMlHr.toFixed(1)} <span className="text-sm font-normal text-cyan-300">ml/h</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Tasa horaria constante</span>
            </div>

            {/* Normogotero */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Goteo Gravitacional (20 gtt/ml)
              </span>
              <div className="text-3xl font-extrabold text-white font-mono mt-1">
                {Math.round(dropsNormo)}{" "}
                <span className="text-sm font-normal text-slate-400">gotas/min</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Aprox. 1 gota cada {(60 / Math.max(1, dropsNormo)).toFixed(1)} segundos
              </span>
            </div>
          </div>

          {/* Botón de Aplicar a Orden Hospitalaria */}
          {hospitalizationId && (
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleApplyOrder}
                disabled={isSaving}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-10 px-5 gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Asignar Orden a Flowboard de Paciente"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
