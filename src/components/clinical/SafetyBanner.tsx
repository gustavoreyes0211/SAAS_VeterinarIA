import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  HeartCrack,
  Info,
  CheckCircle2,
  Syringe,
  AlertOctagon,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TemperamentAlertType } from "@prisma/client";

interface SafetyBannerProps {
  temperamentAlert: TemperamentAlertType;
  knownAllergies: string[];
  chronicConditions: string[];
  bloodType?: string | null;
  microchipNumber?: string | null;
  className?: string;
}

export function SafetyBanner({
  temperamentAlert,
  knownAllergies,
  chronicConditions,
  bloodType,
  microchipNumber,
  className = "",
}: SafetyBannerProps) {
  const hasAllergies = knownAllergies && knownAllergies.length > 0;
  const hasChronic = chronicConditions && chronicConditions.length > 0;
  const isHighRisk =
    temperamentAlert === TemperamentAlertType.REQUIRES_MUZZLE ||
    temperamentAlert === TemperamentAlertType.FRACTIOUS_CAT ||
    temperamentAlert === TemperamentAlertType.FEARFUL_AGGRESSIVE ||
    temperamentAlert === TemperamentAlertType.HIGH_STRESS_CARDIOPATH ||
    hasAllergies;

  const getTemperamentBadge = () => {
    switch (temperamentAlert) {
      case TemperamentAlertType.REQUIRES_MUZZLE:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/30 text-red-200 border border-red-500/50 font-bold text-xs animate-pulse">
            <AlertOctagon className="h-4 w-4 text-red-400" />
            <span>BOZAL OBLIGATORIO</span>
          </div>
        );
      case TemperamentAlertType.FRACTIOUS_CAT:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>GATO FRACTIOSO (MANEJO CON TOALLA)</span>
          </div>
        );
      case TemperamentAlertType.FEARFUL_AGGRESSIVE:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>AGRESIVO POR MIEDO</span>
          </div>
        );
      case TemperamentAlertType.HIGH_STRESS_CARDIOPATH:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/30 text-purple-200 border border-purple-500/50 font-bold text-xs">
            <HeartCrack className="h-4 w-4 text-purple-400" />
            <span>CARDIÓPATA SEVERO (EVITAR ESTRÉS)</span>
          </div>
        );
      case TemperamentAlertType.NO_DOGS_COMPATIBLE:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/40 font-semibold text-xs">
            <Info className="h-4 w-4 text-blue-400" />
            <span>NO COMPATIBLE CON PERROS</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>TEMPERAMENTO DÓCIL / AMIGABLE</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border ${
        hasAllergies
          ? "border-red-500/60 bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 shadow-lg shadow-red-950/40"
          : isHighRisk
          ? "border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900"
          : "border-slate-800 bg-slate-900/60"
      } p-4 backdrop-blur-md transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lado Izquierdo: Temperamento y Alergias */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldAlert
              className={`h-5 w-5 ${
                hasAllergies ? "text-red-400 animate-bounce" : "text-amber-400"
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Seguridad Médica:
            </span>
          </div>

          {getTemperamentBadge()}

          {/* Alergias Médicas Críticas */}
          {hasAllergies ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-red-300">⚠️ ALERGIAS:</span>
              {knownAllergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-extrabold text-white shadow-sm font-mono tracking-wide"
                >
                  {allergy.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              Sin alergias conocidas reportadas
            </span>
          )}
        </div>

        {/* Lado Derecho: Condiciones Crónicas, Sangre y Microchip */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {hasChronic && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">Crónico:</span>
              {chronicConditions.map((cond, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="border-slate-700 bg-slate-800/80 text-cyan-300 text-[10px]"
                >
                  {cond}
                </Badge>
              ))}
            </div>
          )}

          {bloodType && (
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-mono">
              Grupo: {bloodType}
            </Badge>
          )}

          {microchipNumber && (
            <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono">
              CHIP: {microchipNumber}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
