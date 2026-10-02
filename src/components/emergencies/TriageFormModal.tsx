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
import { Badge } from "@/components/ui/badge";
import {
  Siren,
  AlertTriangle,
  Heart,
  Scale,
  Activity,
  Wind,
  Plus,
  Loader2,
  Zap,
} from "lucide-react";
import { EmergencyTriageColor } from "@prisma/client";
import { createEmergencyTriage } from "@/lib/actions/emergencies";

interface TriageFormModalProps {
  branchCode: string;
  patients: { id: string; name: string; species: string; client: { firstName: string; lastName: string } }[];
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

export function TriageFormModal({
  branchCode,
  patients,
  triggerButton,
  onSuccess,
}: TriageFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Campos del formulario
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [customPatientName, setCustomPatientName] = useState("");
  const [triageColor, setTriageColor] = useState<EmergencyTriageColor>(
    EmergencyTriageColor.ORANGE_VERY_URGENT
  );
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [weightKg, setWeightKg] = useState<number>(10);
  const [airwayStatus, setAirwayStatus] = useState("PATENT");
  const [breathingEffort, setBreathingEffort] = useState("DYSPNEIC");
  const [circulationPulse, setCirculationPulse] = useState("WEAK");
  const [mucousColor, setMucousColor] = useState("PALE");
  const [mentalStatus, setMentalStatus] = useState("DEPRESSED");
  const [heartRateBpm, setHeartRateBpm] = useState<number | undefined>(140);
  const [spo2Percent, setSpo2Percent] = useState<number | undefined>(92);
  const [assignedShockTable, setAssignedShockTable] = useState("Box de Choque 1");
  const [isCodeRed, setIsCodeRed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      setServerError("Indique el motivo principal de urgencia.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const payload = {
      patientId: selectedPatientId || undefined,
      triageColor,
      chiefComplaint: customPatientName
        ? `[Paciente no empadronado: ${customPatientName}] ${chiefComplaint}`
        : chiefComplaint,
      estimatedOrFastWeightKg: Number(weightKg) || 10,
      airwayStatus,
      breathingEffort,
      circulationPulse,
      mucousColor,
      mentalStatus,
      heartRateBpm: heartRateBpm ? Number(heartRateBpm) : undefined,
      spo2Percent: spo2Percent ? Number(spo2Percent) : undefined,
      assignedShockTable,
      isCodeRedBroadcasted: isCodeRed || triageColor === EmergencyTriageColor.RED_IMMEDIATE,
    };

    const res = await createEmergencyTriage(payload, branchCode);
    setIsSubmitting(false);

    if (res.success) {
      setOpen(false);
      setChiefComplaint("");
      if (onSuccess) onSuccess();
    } else {
      setServerError(res.error || "Error al registrar el triaje.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-10 gap-1.5 shadow-lg shadow-rose-600/30">
            <Siren className="h-4 w-4 animate-bounce" />
            Nuevo Triaje VECCS
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border-slate-800 text-white p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Siren className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Clasificación de Triaje de Emergencia (VECCS)
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Evaluación primaria ABC (Vía aérea, Respiración, Circulación) en &lt; 45 segundos.
              </p>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* ── 1. CLASIFICACIÓN DEL SEMÁFORO VECCS ── */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Nivel de Prioridad VECCS:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTriageColor(EmergencyTriageColor.RED_IMMEDIATE);
                  setIsCodeRed(true);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  triageColor === EmergencyTriageColor.RED_IMMEDIATE
                    ? "bg-red-600 text-white border-red-400 ring-2 ring-red-500/40 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="block font-bold text-sm">🔴 ROJO</span>
                <span className="text-[10px] block opacity-90 mt-0.5">Paro / Choque (0 min)</span>
              </button>

              <button
                type="button"
                onClick={() => setTriageColor(EmergencyTriageColor.ORANGE_VERY_URGENT)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  triageColor === EmergencyTriageColor.ORANGE_VERY_URGENT
                    ? "bg-amber-600 text-white border-amber-400 ring-2 ring-amber-500/40 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="block font-bold text-sm">🟠 NARANJA</span>
                <span className="text-[10px] block opacity-90 mt-0.5">Muy Urgente (&lt; 15 min)</span>
              </button>

              <button
                type="button"
                onClick={() => setTriageColor(EmergencyTriageColor.YELLOW_URGENT)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  triageColor === EmergencyTriageColor.YELLOW_URGENT
                    ? "bg-yellow-600 text-white border-yellow-400 ring-2 ring-yellow-500/40 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="block font-bold text-sm">🟡 AMARILLO</span>
                <span className="text-[10px] block opacity-90 mt-0.5">Urgente (&lt; 60 min)</span>
              </button>

              <button
                type="button"
                onClick={() => setTriageColor(EmergencyTriageColor.GREEN_STANDARD)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  triageColor === EmergencyTriageColor.GREEN_STANDARD
                    ? "bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/40 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="block font-bold text-sm">🟢 VERDE</span>
                <span className="text-[10px] block opacity-90 mt-0.5">Estándar (&lt; 120 min)</span>
              </button>

              <button
                type="button"
                onClick={() => setTriageColor(EmergencyTriageColor.BLUE_NON_URGENT)}
                className={`p-2.5 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 ${
                  triageColor === EmergencyTriageColor.BLUE_NON_URGENT
                    ? "bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/40 font-bold"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="block font-bold text-sm">🔵 AZUL</span>
                <span className="text-[10px] block opacity-90 mt-0.5">No Urgente (Programable)</span>
              </button>
            </div>
          </div>

          {/* ── 2. PACIENTE Y PESO RÁPIDO ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Paciente Empadronado:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                <option value="">-- Paciente no registrado (Urgencia de calle) --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.species === "CANINE" ? "🐶" : "🐱"} {p.name} • {p.client.firstName}{" "}
                    {p.client.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold flex items-center gap-1">
                <Scale className="h-3 w-3 text-emerald-400" />
                Peso Rápido / Estimado ($kg$) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max="100"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          {!selectedPatientId && (
            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-semibold">
                Identificación Temporal del Paciente:
              </label>
              <Input
                value={customPatientName}
                onChange={(e) => setCustomPatientName(e.target.value)}
                placeholder="Ej. Canino Atropellado sin collar, Mestizo Dorado..."
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>
          )}

          {/* ── 3. MOTIVO PRINCIPAL DE CONSULTA ── */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">
              Motivo Principal de Ingreso de Emergencia *
            </label>
            <Input
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Ej. Politraumatismo por atropello, taquipnea extrema, dolor agudo..."
              className="bg-slate-950 border-slate-800 text-xs text-white"
              required
            />
          </div>

          {/* ── 4. EVALUACIÓN PRIMARIA ABC (AIRWAY, BREATHING, CIRCULATION) ── */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Evaluación Primaria ABC & Triage Fisiológico:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Vía Aérea</label>
                <select
                  value={airwayStatus}
                  onChange={(e) => setAirwayStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
                >
                  <option value="PATENT">Permeable (Normal)</option>
                  <option value="STRIDOR">Estridor / Parcial</option>
                  <option value="OBSTRUCTED">Obstruida (Crítico)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Respiración</label>
                <select
                  value={breathingEffort}
                  onChange={(e) => setBreathingEffort(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
                >
                  <option value="NORMAL">Normal / Eupnéico</option>
                  <option value="TACHYPNEIC">Taquipneico</option>
                  <option value="DYSPNEIC">Disnea Severa</option>
                  <option value="AGONIC">Patrón Agónico</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Pulso</label>
                <select
                  value={circulationPulse}
                  onChange={(e) => setCirculationPulse(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
                >
                  <option value="STRONG">Fuerte / Sincrónico</option>
                  <option value="WEAK">Débil / Filiforme</option>
                  <option value="BOUNDING">Hipercinético</option>
                  <option value="ABSENT">Ausente (Paro)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Mucosas</label>
                <select
                  value={mucousColor}
                  onChange={(e) => setMucousColor(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-xs text-white"
                >
                  <option value="PINK">Rosadas</option>
                  <option value="PALE">Pálidas (Shock/Anemia)</option>
                  <option value="CYANOTIC">Cianóticas (Hipoxia)</option>
                  <option value="CONGESTED">Congestivas</option>
                </select>
              </div>
            </div>

            {/* FC y SpO2 Rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">FC (lpm)</label>
                <Input
                  type="number"
                  value={heartRateBpm || ""}
                  onChange={(e) => setHeartRateBpm(Number(e.target.value))}
                  placeholder="ej. 160"
                  className="bg-slate-900 border-slate-800 text-xs text-white font-mono h-8"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">SpO2 (%)</label>
                <Input
                  type="number"
                  value={spo2Percent || ""}
                  onChange={(e) => setSpo2Percent(Number(e.target.value))}
                  placeholder="ej. 94"
                  className="bg-slate-900 border-slate-800 text-xs text-white font-mono h-8"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Box Asignado</label>
                <select
                  value={assignedShockTable}
                  onChange={(e) => setAssignedShockTable(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white h-8"
                >
                  <option value="Box de Choque 1">Box de Choque 1</option>
                  <option value="Box de Choque 2">Box de Choque 2 (Felinos)</option>
                  <option value="Mesa de Urgencias">Mesa de Urgencias</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── 5. ACTIVACIÓN DE CÓDIGO ROJO ── */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-rose-400 animate-bounce" />
              <div>
                <span className="text-xs font-bold text-rose-300 block">
                  Difundir Alarma de Código Rojo Hospitalario
                </span>
                <span className="text-[10px] text-slate-400">
                  Emite notificación en cabecera y reproduce alerta en salas clínicas.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isCodeRed}
              onChange={(e) => setIsCodeRed(e.target.checked)}
              className="h-5 w-5 rounded text-rose-600 focus:ring-rose-500"
            />
          </div>

          {/* Botones de Envío */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-800 text-slate-300 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-10 px-5 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registrando...
                </>
              ) : (
                <>
                  <Siren className="h-4 w-4" /> Clasificar & Admitir a Urgencias
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
