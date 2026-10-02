"use client";

import React, { useState } from "react";
import {
  Zap,
  Heart,
  Pill,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Flame,
  FileText,
  Clock,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CprMetronome } from "./CprMetronome";

interface CrashCartCalculatorProps {
  initialWeightKg?: number;
  patientName?: string;
  species?: "CANINE" | "FELINE";
}

export function CrashCartCalculator({
  initialWeightKg = 12,
  patientName = "Paciente Crítico",
  species = "CANINE",
}: CrashCartCalculatorProps) {
  const [weight, setWeight] = useState<number>(initialWeightKg);
  const [selectedSpecies, setSelectedSpecies] = useState<"CANINE" | "FELINE">(species);
  const [cprLog, setCprLog] = useState<{ id: string; time: string; event: string }[]>([]);

  const addLogEvent = (event: string) => {
    const time = new Date().toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setCprLog((prev) => [{ id: Math.random().toString(), time, event }, ...prev]);
  };

  const w = Math.max(0.1, Number(weight) || 1);

  // Fármacos calculados
  const drugs = [
    {
      category: "VASOPRESORES & PARASIMPATICOLÍTICOS",
      items: [
        {
          name: "Epinefrina (Adrenalina) - Dosis Baja",
          indication: "Asistolia / AESP. Repetir cada 4 min (ciclos alternos).",
          concentration: "1 mg/ml (1:1,000)",
          doseMgKg: 0.01,
          doseMg: (w * 0.01).toFixed(3),
          volumeMl: (w * 0.01).toFixed(2),
          route: "IV / IO (o x2 Vía Endotraqueal)",
          badge: "PRIORIDAD 1",
          badgeColor: "bg-rose-600 text-white",
        },
        {
          name: "Epinefrina (Adrenalina) - Dosis Alta",
          indication: "Paro prolongado > 10 min de RCP no responsivo.",
          concentration: "1 mg/ml (1:1,000)",
          doseMgKg: 0.1,
          doseMg: (w * 0.1).toFixed(3),
          volumeMl: (w * 0.1).toFixed(2),
          route: "IV / IO",
          badge: "PARO > 10 MIN",
          badgeColor: "bg-amber-600 text-white",
        },
        {
          name: "Atropina Sulfato",
          indication: "Asistolia o AESP con tono vagal elevado pre-paro.",
          concentration: "0.5 mg/ml",
          doseMgKg: 0.04,
          doseMg: (w * 0.04).toFixed(3),
          volumeMl: ((w * 0.04) / 0.5).toFixed(2),
          route: "IV / IO",
          badge: "TONO VAGAL",
          badgeColor: "bg-purple-600 text-white",
        },
      ],
    },
    {
      category: "AGENTES DE REVERSIÓN ANESTÉSICA",
      items: [
        {
          name: "Naloxona",
          indication: "Reversión específica de opioides (Fentanilo, Morfina, Metadona, Buprenorfina).",
          concentration: "0.4 mg/ml",
          doseMgKg: 0.04,
          doseMg: (w * 0.04).toFixed(3),
          volumeMl: ((w * 0.04) / 0.4).toFixed(2),
          route: "IV / IO",
          badge: "ANTÍDOTO OPIOIDE",
          badgeColor: "bg-cyan-600 text-white",
        },
        {
          name: "Atipamezol (Antisedan)",
          indication: "Reversión de agonistas alfa-2 (Dexmedetomidina / Medetomidina).",
          concentration: "5 mg/ml",
          doseMgKg: 0.25,
          doseMg: (w * 0.25).toFixed(3),
          volumeMl: ((w * 0.25) / 5.0).toFixed(2),
          route: "IV / IM",
          badge: "ANTÍDOTO ALFA-2",
          badgeColor: "bg-teal-600 text-white",
        },
        {
          name: "Flumazenil",
          indication: "Reversión de benzodiacepinas (Midazolam / Diazepam).",
          concentration: "0.1 mg/ml",
          doseMgKg: 0.01,
          doseMg: (w * 0.01).toFixed(3),
          volumeMl: ((w * 0.01) / 0.1).toFixed(2),
          route: "IV / IO",
          badge: "ANTÍDOTO BZD",
          badgeColor: "bg-indigo-600 text-white",
        },
      ],
    },
    {
      category: "ANTIARRÍTMICOS & METABÓLICOS",
      items: [
        {
          name: "Lidocaína 2% (Sin epinefrina)",
          indication: "Taquicardia Ventricular (TV) maligna o FV recurrente tras desfibrilación.",
          concentration: "20 mg/ml (2%)",
          doseMgKg: selectedSpecies === "CANINE" ? 2.0 : 0.2,
          doseMg: (w * (selectedSpecies === "CANINE" ? 2.0 : 0.2)).toFixed(2),
          volumeMl: ((w * (selectedSpecies === "CANINE" ? 2.0 : 0.2)) / 20.0).toFixed(2),
          route: selectedSpecies === "CANINE" ? "IV lento (Caninos)" : "IV muy lento con extrema precaución (Felinos)",
          badge: "ANTIARRÍTMICO",
          badgeColor: "bg-emerald-600 text-white",
        },
        {
          name: "Gluconato de Calcio 10%",
          indication: "Hiperpotasemia severa o toxicidad por bloqueadores de canales de Ca.",
          concentration: "100 mg/ml (10%)",
          doseMgKg: 100,
          doseMg: (w * 100).toFixed(1),
          volumeMl: (w * 1.0).toFixed(2),
          route: "IV muy lento (vigilar ECG por bradicardia)",
          badge: "ELECTROLITO",
          badgeColor: "bg-amber-700 text-white",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── BARRA SUPERIOR DE PARÁMETROS DEL PACIENTE ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                Calculadora RECOVER 2.0 de Paro Cardio-Respiratorio
              </span>
              <h1 className="text-xl font-extrabold text-white">
                Fármacos de Emergencia & Dosis por Peso
              </h1>
            </div>
          </div>

          {/* Ajuste Rápido de Peso y Especie */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Especie */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setSelectedSpecies("CANINE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSpecies === "CANINE"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🐶 Canino
              </button>
              <button
                type="button"
                onClick={() => setSelectedSpecies("FELINE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSpecies === "FELINE"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🐱 Felino
              </button>
            </div>

            {/* Input de Peso Exacto */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Scale className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Peso:</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="100"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-16 bg-transparent text-sm font-bold text-white font-mono focus:outline-none"
              />
              <span className="text-xs font-bold text-rose-400">kg</span>
            </div>

            {/* Presets Rápidos */}
            <div className="hidden lg:flex items-center gap-1">
              {[3, 5, 10, 15, 25, 35].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWeight(preset)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    weight === preset
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {preset}kg
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── METRÓNOMO AUDIBLE Y VISUAL ── */}
      <CprMetronome
        patientName={patientName}
        weightKg={w}
        onLogEvent={addLogEvent}
      />

      {/* ── GUÍA DE DESFIBRILACIÓN ELÉCTRICA RECOVER ── */}
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Desfibrilador Eléctrico (Ritmos Desfibrilables: FV / TV sin Pulso)
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                Cargar desfibrilador durante los últimos 15s del ciclo. Descargar e iniciar inmediatamente compresiones sin pausar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/40 bg-slate-950/80 px-4 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">1ª Descarga (2 J/kg)</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                {(w * 2).toFixed(0)} Joules
              </span>
            </div>

            <div className="rounded-xl border border-rose-500/40 bg-slate-950/80 px-4 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Descargas Subsecuentes (4 J/kg)</span>
              <span className="text-xl font-extrabold text-rose-400 font-mono">
                {(w * 4).toFixed(0)} Joules
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => addLogEvent(`Descarga eléctrica administrada: ${(w * 2).toFixed(0)} Joules.`)}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-10 font-bold"
            >
              Registrar Choque
            </Button>
          </div>
        </div>
      </div>

      {/* ── TABLA MAESTRA DE FÁRMACOS DE PARO ── */}
      <div className="space-y-4">
        {drugs.map((category, catIdx) => (
          <div
            key={catIdx}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden"
          >
            <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-400" />
                {category.category}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Cálculo para {w} kg ({selectedSpecies === "CANINE" ? "Perro" : "Gato"})
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-bold text-white">{item.name}</strong>
                      <span className="text-xs text-slate-400">({item.concentration})</span>
                      <Badge className={`text-[10px] font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300">{item.indication}</p>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      Vía: {item.route}
                    </span>
                  </div>

                  {/* Dosis Calculada & Botón de Registro */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-mono font-extrabold text-emerald-400">
                        {item.volumeMl} <span className="text-sm font-normal text-slate-400">ml</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ({item.doseMg} mg)
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        addLogEvent(`Bolo administrado: ${item.name} -> ${item.volumeMl} ml (${item.doseMg} mg).`)
                      }
                      className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs h-9 font-semibold shrink-0 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Administrado
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── BITÁCORA DE REANIMACIÓN EN TIEMPO REAL ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Bitácora de Reanimación (Timeline de Actos RCP)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {cprLog.length} eventos registrados
          </span>
        </div>

        {cprLog.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No se han registrado eventos todavía. Al iniciar el metrónomo, cambiar de ciclo o marcar fármacos administrados, aparecerán cronológicamente aquí para la historia clínica legal.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {cprLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-mono"
              >
                <span className="text-emerald-400 font-bold shrink-0">[{log.time}]</span>
                <span className="text-slate-200">{log.event}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
