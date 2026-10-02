"use client";

import React, { useState } from "react";
import { X, Clock, Calendar, Check, AlertTriangle, Save, ShieldCheck, User } from "lucide-react";
import { upsertDoctorSchedule } from "@/lib/actions/appointments";

interface DoctorScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchCode: string;
  doctors: Array<{
    id: string; // doctorProfileId
    fullName: string;
    specialties: string[];
  }>;
  existingSchedules: Array<{
    doctorId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStartTime: string | null;
    breakEndTime: string | null;
    slotDurationMinutes: number;
    dailyConsultationLimit: number;
    isActive: boolean;
  }>;
}

const DAYS = [
  { day: 1, name: "Lunes" },
  { day: 2, name: "Martes" },
  { day: 3, name: "Miércoles" },
  { day: 4, name: "Jueves" },
  { day: 5, name: "Viernes" },
  { day: 6, name: "Sábado" },
  { day: 0, name: "Domingo" },
];

export function DoctorScheduleSettingsModal({
  isOpen,
  onClose,
  branchCode,
  doctors,
  existingSchedules,
}: DoctorScheduleSettingsModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors[0]?.id || ""
  );

  // Generar estado inicial para cada día de la semana para el doctor seleccionado
  const getDayConfig = (day: number) => {
    const found = existingSchedules.find(
      (s) => s.doctorId === selectedDoctorId && s.dayOfWeek === day
    );
    return {
      isActive: found ? found.isActive : day >= 1 && day <= 5, // Lunes a Viernes por defecto
      startTime: found ? found.startTime : "08:00",
      endTime: found ? found.endTime : "17:00",
      breakStartTime: found?.breakStartTime || "12:00",
      breakEndTime: found?.breakEndTime || "13:00",
      slotDurationMinutes: found ? found.slotDurationMinutes : 30,
      dailyConsultationLimit: found ? found.dailyConsultationLimit : 12,
    };
  };

  const [scheduleState, setScheduleState] = useState<Record<number, any>>(() => {
    const init: Record<number, any> = {};
    DAYS.forEach((d) => {
      init[d.day] = getDayConfig(d.day);
    });
    return init;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Al cambiar de médico, recargar su configuración
  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const updated: Record<number, any> = {};
    DAYS.forEach((d) => {
      const found = existingSchedules.find(
        (s) => s.doctorId === docId && s.dayOfWeek === d.day
      );
      updated[d.day] = {
        isActive: found ? found.isActive : d.day >= 1 && d.day <= 5,
        startTime: found ? found.startTime : "08:00",
        endTime: found ? found.endTime : "17:00",
        breakStartTime: found?.breakStartTime || "12:00",
        breakEndTime: found?.breakEndTime || "13:00",
        slotDurationMinutes: found ? found.slotDurationMinutes : 30,
        dailyConsultationLimit: found ? found.dailyConsultationLimit : 12,
      };
    });
    setScheduleState(updated);
  };

  if (!isOpen) return null;

  const handleDayFieldChange = (day: number, field: string, value: any) => {
    setScheduleState((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleCopyMondayToAll = () => {
    const monday = scheduleState[1];
    setScheduleState((prev) => ({
      ...prev,
      2: { ...monday },
      3: { ...monday },
      4: { ...monday },
      5: { ...monday },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage(false);
    try {
      for (const d of DAYS) {
        const config = scheduleState[d.day];
        await upsertDoctorSchedule({
          branchCode,
          doctorId: selectedDoctorId,
          dayOfWeek: d.day,
          startTime: config.startTime,
          endTime: config.endTime,
          breakStartTime: config.breakStartTime || undefined,
          breakEndTime: config.breakEndTime || undefined,
          slotDurationMinutes: Number(config.slotDurationMinutes),
          dailyConsultationLimit: Number(config.dailyConsultationLimit),
          isActive: config.isActive,
        });
      }
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
      alert("Error al guardar la distribución laboral del médico.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Capacidad & Límite Diario
                </span>
                <span className="text-xs text-slate-400">Sucursal: {branchCode}</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Configuración de Horarios Médicos Semanales
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

        {/* Doctor Selector & Quick Actions */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">Médico:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopyMondayToAll}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors"
          >
            Copiar horario de Lunes a toda la semana laboral (L-V)
          </button>
        </div>

        {/* Body Table */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-3">
          <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-3 py-1 border-b border-slate-800">
            <div className="col-span-2">Día</div>
            <div className="col-span-2">Atención</div>
            <div className="col-span-2">Jornada (Inicio - Fin)</div>
            <div className="col-span-2">Almuerzo / Receso</div>
            <div className="col-span-2">Duración Cita</div>
            <div className="col-span-2">Límite Diario</div>
          </div>

          {DAYS.map((d) => {
            const config = scheduleState[d.day];
            return (
              <div
                key={d.day}
                className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition-all ${
                  config.isActive
                    ? "bg-slate-950/60 border-slate-800"
                    : "bg-slate-950/20 border-slate-900 opacity-60"
                }`}
              >
                {/* Día */}
                <div className="col-span-2">
                  <span className="text-xs font-bold text-white">{d.name}</span>
                </div>

                {/* Switch Atiende */}
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isActive}
                      onChange={(e) =>
                        handleDayFieldChange(d.day, "isActive", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-300">
                      {config.isActive ? "Atiende" : "Libre"}
                    </span>
                  </label>
                </div>

                {/* Jornada Inicio - Fin */}
                <div className="col-span-2 flex items-center gap-1 font-mono">
                  <input
                    type="time"
                    disabled={!config.isActive}
                    value={config.startTime}
                    onChange={(e) =>
                      handleDayFieldChange(d.day, "startTime", e.target.value)
                    }
                    className="w-16 px-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="time"
                    disabled={!config.isActive}
                    value={config.endTime}
                    onChange={(e) =>
                      handleDayFieldChange(d.day, "endTime", e.target.value)
                    }
                    className="w-16 px-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                {/* Almuerzo / Receso */}
                <div className="col-span-2 flex items-center gap-1 font-mono">
                  <input
                    type="time"
                    disabled={!config.isActive}
                    value={config.breakStartTime}
                    onChange={(e) =>
                      handleDayFieldChange(d.day, "breakStartTime", e.target.value)
                    }
                    className="w-16 px-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="time"
                    disabled={!config.isActive}
                    value={config.breakEndTime}
                    onChange={(e) =>
                      handleDayFieldChange(d.day, "breakEndTime", e.target.value)
                    }
                    className="w-16 px-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300"
                  />
                </div>

                {/* Duración Cita */}
                <div className="col-span-2">
                  <select
                    disabled={!config.isActive}
                    value={config.slotDurationMinutes}
                    onChange={(e) =>
                      handleDayFieldChange(
                        d.day,
                        "slotDurationMinutes",
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value={15}>15 min</option>
                    <option value={20}>20 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>

                {/* Límite Máximo Diario */}
                <div className="col-span-2 flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={40}
                    disabled={!config.isActive}
                    value={config.dailyConsultationLimit}
                    onChange={(e) =>
                      handleDayFieldChange(
                        d.day,
                        "dailyConsultationLimit",
                        Number(e.target.value)
                      )
                    }
                    className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-indigo-400 font-bold font-mono text-center"
                  />
                  <span className="text-[10px] text-slate-500">citas/día</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {successMessage && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="h-4 w-4" />
                ¡Horarios y límites actualizados correctamente!
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar Horarios Semanales"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
