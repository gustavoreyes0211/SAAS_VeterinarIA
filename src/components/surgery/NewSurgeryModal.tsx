"use client";

import React, { useState } from "react";
import { X, Scissors, AlertTriangle, ShieldCheck, Heart, User, Sparkles } from "lucide-react";
import { createSurgery } from "@/lib/actions/surgery";
import { useRouter } from "next/navigation";

interface NewSurgeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchCode: string;
  patients: Array<{
    id: string;
    name: string;
    species: string;
    breed: string;
    weightHistory?: Array<{ weightKg: number | string }>;
  }>;
  doctors: Array<{
    id: string;
    fullName: string;
    professionalLicense: string | null;
  }>;
  rooms: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export function NewSurgeryModal({
  isOpen,
  onClose,
  branchCode,
  patients,
  doctors,
  rooms,
}: NewSurgeryModalProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [leadSurgeonId, setLeadSurgeonId] = useState(doctors[0]?.id || "");
  const [anesthesiologistId, setAnesthesiologistId] = useState(doctors[0]?.id || "");
  const [roomId, setRoomId] = useState(rooms[0]?.id || "");
  const [surgeryName, setSurgeryName] = useState("");
  const [asaGrade, setAsaGrade] = useState<string>("ASA_I");
  const [isEmergency, setIsEmergency] = useState(false);
  const [preOpWeightKg, setPreOpWeightKg] = useState<number>(10);
  const [preMedicationProtocol, setPreMedicationProtocol] = useState("");
  const [inductionAgent, setInductionAgent] = useState("Propofol 4 mg/kg IV");
  const [maintenanceAgent, setMaintenanceAgent] = useState("Isoflurano en O2 al 100%");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al cambiar de paciente, actualizar el peso sugerido si existe en historial
  const handlePatientChange = (pid: string) => {
    setPatientId(pid);
    const selected = patients.find((p) => p.id === pid);
    if (selected?.weightHistory && selected.weightHistory.length > 0) {
      setPreOpWeightKg(Number(selected.weightHistory[0].weightKg));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surgeryName.trim()) {
      alert("Por favor indica el nombre del procedimiento quirúrgico");
      return;
    }
    if (!patientId || !leadSurgeonId) {
      alert("Por favor selecciona paciente y cirujano");
      return;
    }

    setIsSubmitting(true);
    try {
      const surgery = await createSurgery({
        branchCode,
        patientId,
        leadSurgeonId,
        anesthesiologistId: anesthesiologistId || undefined,
        roomId: roomId || undefined,
        surgeryName,
        asaGrade: asaGrade as any,
        preOpWeightKg,
        preMedicationProtocol: preMedicationProtocol || undefined,
        inductionAgent: inductionAgent || undefined,
        maintenanceAgent: maintenanceAgent || undefined,
        isEmergency,
      });

      onClose();
      router.push(`/${branchCode}/quirofano/${surgery.id}`);
    } catch (err) {
      console.error(err);
      alert("Error al programar cirugía");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Scissors className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Pabellón Quirúrgico
                </span>
                {isEmergency && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    URGENCIA INMEDIATA
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Programar Intervención Quirúrgica
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paciente */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Paciente (Mascota) *
              </label>
              <select
                value={patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species === "CANINE" ? "Canino" : "Felino"} - {p.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Peso Prequirúrgico */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Peso Pre-Quirúrgico (kg) *
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={preOpWeightKg}
                onChange={(e) => setPreOpWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-indigo-400 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Nombre de la Cirugía */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Procedimiento o Técnica Quirúrgica *
            </label>
            <input
              type="text"
              placeholder="Ej. Ovariohisterectomía preventiva, Laparotomía exploratoria..."
              value={surgeryName}
              onChange={(e) => setSurgeryName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-semibold"
              required
            />
          </div>

          {/* Clasificación de Riesgo Anestésico ASA */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Clasificación de Riesgo Anestésico (ASA) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { grade: "ASA_I", label: "ASA I", desc: "Sano normal, electivo" },
                { grade: "ASA_II", label: "ASA II", desc: "Enfermedad sistémica leve" },
                { grade: "ASA_III", label: "ASA III", desc: "Enfermedad sistémica grave" },
                { grade: "ASA_IV", label: "ASA IV", desc: "Amenaza constante a la vida" },
                { grade: "ASA_V", label: "ASA V", desc: "Moribundo sin cirugía" },
                { grade: "ASA_E", label: "ASA-E", desc: "Urgencia / Emergencia" },
              ].map((item) => (
                <button
                  key={item.grade}
                  type="button"
                  onClick={() => {
                    setAsaGrade(item.grade);
                    if (item.grade === "ASA_E") setIsEmergency(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    asaGrade === item.grade
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-black text-indigo-300">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cirujano, Anestesista y Pabellón */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Cirujano Titular *
              </label>
              <select
                value={leadSurgeonId}
                onChange={(e) => setLeadSurgeonId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.professionalLicense ? `(${d.professionalLicense})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Anestesiólogo
              </label>
              <select
                value={anesthesiologistId}
                onChange={(e) => setAnesthesiologistId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">(Sin anestesiólogo asignado)</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Quirófano / Sala
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Pabellón Estándar</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Protocolo Pre-anestésico y Fármacos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Pre-Medicación
              </label>
              <input
                type="text"
                placeholder="Ej. Dexmedetomidina + Metadona"
                value={preMedicationProtocol}
                onChange={(e) => setPreMedicationProtocol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Inducción Anestésica
              </label>
              <input
                type="text"
                placeholder="Ej. Propofol 4 mg/kg IV"
                value={inductionAgent}
                onChange={(e) => setInductionAgent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Mantenimiento
              </label>
              <input
                type="text"
                placeholder="Ej. Isoflurano al 1.5% en O2"
                value={maintenanceAgent}
                onChange={(e) => setMaintenanceAgent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Toggle de Urgencia */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-300">
                Marcar como <strong>Urgencia Inmediata</strong> (Inicia directamente en fase Pre-Quirófano)
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="p-4 -mx-6 -mb-6 mt-6 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Scissors className="h-4 w-4" />
              {isSubmitting ? "Programando..." : "Registrar Cirugía y Abrir Monitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
