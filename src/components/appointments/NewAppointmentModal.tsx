"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  PawPrint,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { createAppointment, getDoctorAvailability } from "@/lib/actions/appointments";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchCode: string;
  doctors: Array<{
    id: string; // doctorProfileId
    fullName: string;
    specialties: string[];
  }>;
  patients: Array<{
    id: string;
    name: string;
    species: string;
    breed: string;
    clientId: string;
    client?: {
      firstName: string;
      lastName: string;
      phoneE164: string;
    };
  }>;
  initialDate?: string;
  initialDoctorId?: string;
  currentUserId?: string;
  isUserAdminOrDirector?: boolean;
}

export function NewAppointmentModal({
  isOpen,
  onClose,
  branchCode,
  doctors,
  patients,
  initialDate,
  initialDoctorId,
  currentUserId,
  isUserAdminOrDirector = true,
}: NewAppointmentModalProps) {
  const todayStr = initialDate || new Date().toISOString().split("T")[0];

  const [doctorId, setDoctorId] = useState<string>(
    initialDoctorId || doctors[0]?.id || ""
  );
  const [patientId, setPatientId] = useState<string>(patients[0]?.id || "");
  const [appointmentDate, setAppointmentDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("CONSULTA_GENERAL");
  const [reasonForVisit, setReasonForVisit] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");

  // Sobrecupo
  const [isOverbooking, setIsOverbooking] = useState<boolean>(false);

  // Estado del Slot Engine
  const [availability, setAvailability] = useState<any>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtener disponibilidad al cambiar de médico o fecha
  useEffect(() => {
    if (!isOpen || !doctorId || !appointmentDate) return;

    let isMounted = true;
    setIsLoadingAvailability(true);
    setErrorMessage(null);
    setSelectedTime("");

    getDoctorAvailability({
      branchCode,
      doctorId,
      date: appointmentDate,
    })
      .then((res) => {
        if (isMounted) {
          setAvailability(res);
          setIsLoadingAvailability(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setErrorMessage("Error al consultar disponibilidad médica");
          setIsLoadingAvailability(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, doctorId, appointmentDate, branchCode]);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      alert("Selecciona un médico veterinario");
      return;
    }
    if (!patientId || !selectedPatient) {
      alert("Selecciona un paciente");
      return;
    }
    if (!selectedTime) {
      alert("Por favor selecciona un horario de la lista");
      return;
    }

    if (availability?.limitReached && !isOverbooking) {
      alert(
        `Límite diario alcanzado (${availability.dailyLimit} consultas). Marca sobrecupo si tienes autorización.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createAppointment({
        branchCode,
        doctorId,
        patientId,
        clientId: selectedPatient.clientId,
        appointmentDate,
        startTime: selectedTime,
        serviceType,
        reasonForVisit: reasonForVisit || undefined,
        internalNotes: internalNotes || undefined,
        isOverbooking,
        overbookingAuthorizedByUserId: isOverbooking ? currentUserId : undefined,
        createdByUserId: currentUserId,
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Error al agendar la cita médica");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Recepción & Agenda
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Sede: {branchCode}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Agendar Nueva Cita Médica
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

        {/* Error alert if any */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {/* Fila 1: Médico y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Médico Veterinario *
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Fecha de la Cita *
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Fila 2: Indicador de Capacidad y Límite Diario Estricto */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" />
                Capacidad y Cupos del Día
              </span>

              {isLoadingAvailability ? (
                <span className="text-xs text-slate-400 animate-pulse">
                  Calculando disponibilidad de franjas horarias...
                </span>
              ) : availability?.isAvailable ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      availability.limitReached
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {availability.activeCount} / {availability.dailyLimit} Citas Ocupadas
                  </span>
                  {!availability.limitReached && (
                    <span className="text-xs text-emerald-400 font-semibold">
                      ({availability.dailyLimit - availability.activeCount} disponibles)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-rose-400 font-semibold">
                  {availability?.reason || "Sin atención"}
                </span>
              )}
            </div>

            {/* Alerta de Límite Diario Alcanzado */}
            {availability?.limitReached && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>Cupo diario completo:</strong> El médico ha alcanzado su límite de {availability.dailyLimit} consultas.
                  </span>
                </div>
                {isUserAdminOrDirector && (
                  <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer ml-4 shrink-0">
                    <input
                      type="checkbox"
                      checked={isOverbooking}
                      onChange={(e) => setIsOverbooking(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Autorizar Sobrecupo</span>
                  </label>
                )}
              </div>
            )}

            {/* Grilla de Franjas Horarias (Slots) */}
            {availability?.isAvailable && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">
                  Selecciona una franja horaria ({availability.schedule?.slotDurationMinutes} min por cita):
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-44 overflow-y-auto pr-1">
                  {availability.slots?.map((slot: any) => {
                    const isSelected = selectedTime === slot.time;
                    const canSelect = slot.isAvailable || (isOverbooking && !slot.isBreak);

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!canSelect}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-2 rounded-xl text-xs font-mono font-bold transition-all text-center border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400"
                            : slot.isOccupied
                            ? "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed line-through"
                            : slot.isBreak
                            ? "bg-amber-950/20 border-amber-900/30 text-amber-500/60 cursor-not-allowed text-[10px]"
                            : canSelect
                            ? "bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500"
                            : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                        {slot.isBreak && <div className="text-[9px] text-amber-400 font-sans">Receso</div>}
                        {slot.isOccupied && <div className="text-[9px] text-slate-500 font-sans">Ocupado</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fila 3: Paciente y Tutor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Paciente (Mascota) *
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
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

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Tipo de Servicio *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="CONSULTA_GENERAL">Consulta Médica General</option>
                <option value="VACUNACION">Plan de Vacunación</option>
                <option value="DESPARASITACION">Desparasitación / Control</option>
                <option value="REVISION_POST_OP">Revisión Post-Quirúrgica</option>
                <option value="ESPECIALIDAD_DERMATOLOGIA">Dermatología Veterinaria</option>
                <option value="ESPECIALIDAD_TRAUMATOLOGIA">Ortopedia & Traumatología</option>
                <option value="CIRUGIA_MENOR">Procedimiento / Cirugía Menor</option>
              </select>
            </div>
          </div>

          {/* Fila 4: Motivo de la Cita */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Motivo de Consulta o Anamnesis Breve
            </label>
            <input
              type="text"
              placeholder="Ej. Vacuna de refuerzo anual, vómitos de 24h, control de sutura..."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Fila 5: Notas Internas para Recepción/Médico */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Notas Internas de Recepción (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Tutor solicita puntualidad, paciente agresivo con otros perros..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="p-4 -mx-6 -mb-6 mt-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {selectedTime ? (
                <span>
                  Horario: <strong className="text-white font-mono">{selectedTime}</strong> ({appointmentDate})
                </span>
              ) : (
                <span className="text-slate-500">Ningún horario seleccionado</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedTime || (availability?.limitReached && !isOverbooking)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? "Agendando..." : "Confirmar y Agendar Cita"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
