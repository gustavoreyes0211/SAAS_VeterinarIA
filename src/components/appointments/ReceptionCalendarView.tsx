"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Stethoscope,
  AlertCircle,
  XCircle,
  Eye,
  Building2,
  Sparkles,
  ArrowRight,
  Users,
} from "lucide-react";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { DoctorScheduleSettingsModal } from "./DoctorScheduleSettingsModal";
import { AppointmentStatus } from "@prisma/client";

interface AppointmentItem {
  id: string;
  doctorId: string;
  patientId: string;
  clientId: string;
  appointmentDate: string | Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  serviceType: string;
  reasonForVisit: string | null;
  internalNotes: string | null;
  isOverbooking: boolean;
  patient: {
    id: string;
    name: string;
    species: string;
    breed: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phoneE164: string;
  };
  doctor: {
    id: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  room?: {
    name: string;
    code: string;
  } | null;
}

interface ReceptionCalendarViewProps {
  branchCode: string;
  initialAppointments: AppointmentItem[];
  doctors: Array<{
    id: string;
    fullName: string;
    specialties: string[];
  }>;
  patients: any[];
  doctorSchedules: any[];
  currentUserId?: string;
}

type CalendarViewMode = "DAY" | "WEEK" | "MONTH" | "MULTI_DOCTOR";

export function ReceptionCalendarView({
  branchCode,
  initialAppointments,
  doctors,
  patients,
  doctorSchedules,
  currentUserId,
}: ReceptionCalendarViewProps) {
  // Fecha seleccionada (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [viewMode, setViewMode] = useState<CalendarViewMode>("DAY");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isScheduleSettingsOpen, setIsScheduleSettingsOpen] = useState(false);

  // Lista local reactiva de citas
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);

  // Manejo de cambio de estado de cita en 1-click
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, branchCode, newStatus);
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
      );
    } catch (e) {
      console.error(e);
      alert("Error al actualizar estado de la cita");
    }
  };

  // Navegación de fechas
  const handlePrevDate = () => {
    const d = new Date(selectedDate + "T00:00:00");
    if (viewMode === "MONTH") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "WEEK") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate + "T00:00:00");
    if (viewMode === "MONTH") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "WEEK") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Filtrado de citas
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // Filtro doctor
      if (selectedDoctorId !== "ALL" && a.doctorId !== selectedDoctorId) {
        return false;
      }
      // Filtro estado
      if (selectedStatus !== "ALL" && a.status !== selectedStatus) {
        return false;
      }
      // Búsqueda
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const petMatch = a.patient.name.toLowerCase().includes(query);
        const clientMatch = `${a.client.firstName} ${a.client.lastName}`
          .toLowerCase()
          .includes(query);
        const reasonMatch = a.reasonForVisit?.toLowerCase().includes(query);
        if (!petMatch && !clientMatch && !reasonMatch) return false;
      }
      return true;
    });
  }, [appointments, selectedDoctorId, selectedStatus, searchTerm]);

  // Citas para la fecha seleccionada (Vista Día y Multi-Doctor)
  const dayAppointments = useMemo(() => {
    return filteredAppointments.filter((a) => {
      const apptDateStr = new Date(a.appointmentDate).toISOString().split("T")[0];
      return apptDateStr === selectedDate;
    });
  }, [filteredAppointments, selectedDate]);

  // Status badges & styling
  const statusConfig: Record<
    AppointmentStatus,
    { label: string; bg: string; text: string; border: string; badge: string }
  > = {
    SCHEDULED: {
      label: "Agendada",
      bg: "bg-slate-900/80",
      text: "text-indigo-300",
      border: "border-slate-800",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    CONFIRMED: {
      label: "Confirmada",
      bg: "bg-emerald-950/20",
      text: "text-emerald-300",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    IN_WAITING_ROOM: {
      label: "En Sala de Espera",
      bg: "bg-amber-950/20",
      text: "text-amber-300",
      border: "border-amber-500/40",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
    },
    IN_CONSULTATION: {
      label: "En Atención Médica",
      bg: "bg-purple-950/20",
      text: "text-purple-300",
      border: "border-purple-500/40",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse",
    },
    COMPLETED: {
      label: "Finalizada",
      bg: "bg-slate-900/40",
      text: "text-slate-400",
      border: "border-slate-800",
      badge: "bg-slate-800 text-slate-400 border-slate-700",
    },
    CANCELLED: {
      label: "Cancelada",
      bg: "bg-rose-950/10",
      text: "text-rose-400",
      border: "border-rose-900/30",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    NO_SHOW: {
      label: "No se presentó",
      bg: "bg-orange-950/10",
      text: "text-orange-400",
      border: "border-orange-900/30",
      badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    },
  };

  const serviceLabels: Record<string, string> = {
    CONSULTA_GENERAL: "Consulta General",
    VACUNACION: "Vacunación",
    DESPARASITACION: "Desparasitación",
    REVISION_POST_OP: "Control Post-Quirúrgico",
    ESPECIALIDAD_DERMATOLOGIA: "Dermatología",
    ESPECIALIDAD_TRAUMATOLOGIA: "Ortopedia",
    CIRUGIA_MENOR: "Cirugía Menor",
  };

  // Formato legible de la fecha seleccionada
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return dateObj.toLocaleDateString("es-SV", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* ── BARRA PRINCIPAL DE CONTROL DE RECEPCIÓN ── */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navegación de Fecha */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevDate}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNextDate}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="ml-2">
              <div className="text-base font-extrabold text-white capitalize">
                {formattedSelectedDate}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {dayAppointments.length} citas programadas para este día
              </div>
            </div>
          </div>

          {/* Selector de Modo de Vista */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start lg:self-auto">
            {[
              { id: "DAY", label: "Día" },
              { id: "MULTI_DOCTOR", label: "Multi-Médico", badge: "Recepción" },
              { id: "WEEK", label: "Semana" },
              { id: "MONTH", label: "Mes" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as CalendarViewMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === v.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <span>{v.label}</span>
                {v.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300">
                    {v.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsScheduleSettingsOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
              title="Configurar horarios y límites diarios de cada médico"
            >
              <Settings className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Horarios Médicos</span>
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              Nueva Cita
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, tutor o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro Médico */}
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Médicos</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.fullName}
                </option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="SCHEDULED">Agendada / Pendiente</option>
              <option value="CONFIRMED">Confirmada</option>
              <option value="IN_WAITING_ROOM">En Sala de Espera</option>
              <option value="IN_CONSULTATION">En Consulta</option>
              <option value="COMPLETED">Finalizada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="NO_SHOW">No se presentó</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── VISTAS MODULARES ── */}

      {/* 1. VISTA MULTI-MÉDICO (COLUMNAS PARALELAS POR DOCTOR) */}
      {viewMode === "MULTI_DOCTOR" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctors
            .filter((d) => selectedDoctorId === "ALL" || d.id === selectedDoctorId)
            .map((doc) => {
              const docAppts = dayAppointments
                .filter((a) => a.doctorId === doc.id)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              // Buscar límite configurado para hoy
              const targetDayOfWeek = new Date(selectedDate + "T00:00:00").getDay();
              const scheduleForToday = doctorSchedules.find(
                (s) => s.doctorId === doc.id && s.dayOfWeek === targetDayOfWeek
              );
              const limit = scheduleForToday?.dailyConsultationLimit || 12;
              const isFull = docAppts.length >= limit;

              return (
                <div
                  key={doc.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col justify-between backdrop-blur-md shadow-xl"
                >
                  {/* Col Header */}
                  <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white truncate">
                        Dr. {doc.fullName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          isFull
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {docAppts.length} / {limit} cupos
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {scheduleForToday?.isActive
                        ? `Horario: ${scheduleForToday.startTime} - ${scheduleForToday.endTime} (${scheduleForToday.slotDurationMinutes} min/cita)`
                        : "Sin turno regular hoy"}
                    </div>
                  </div>

                  {/* Col Body (Citas) */}
                  <div className="p-3 space-y-2.5 flex-1 min-h-[300px] max-h-[600px] overflow-y-auto">
                    {docAppts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                        <Clock className="h-8 w-8 text-slate-700 mb-2" />
                        <span>Sin citas agendadas para este médico hoy</span>
                      </div>
                    ) : (
                      docAppts.map((appt) => {
                        const cfg = statusConfig[appt.status] || statusConfig.SCHEDULED;

                        return (
                          <div
                            key={appt.id}
                            className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${cfg.bg} ${cfg.border}`}
                          >
                            {/* Card Top: Horario y Estado */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black text-white flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                                {appt.startTime} - {appt.endTime}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}
                              >
                                {cfg.label}
                              </span>
                            </div>

                            {/* Paciente y Tutor */}
                            <div>
                              <div className="text-xs font-extrabold text-white flex items-center justify-between">
                                <span>{appt.patient.name}</span>
                                <span className="text-[10px] text-indigo-400 font-normal">
                                  {appt.patient.breed}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                Tutor: {appt.client.firstName} {appt.client.lastName} ({appt.client.phoneE164})
                              </div>
                            </div>

                            {/* Motivo */}
                            {appt.reasonForVisit && (
                              <div className="text-[11px] text-slate-300 italic line-clamp-2">
                                "{appt.reasonForVisit}"
                              </div>
                            )}

                            {/* Acciones Rápidas en 1-click */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                              {appt.status === "SCHEDULED" && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold"
                                >
                                  Confirmar
                                </button>
                              )}

                              {appt.status !== "IN_WAITING_ROOM" &&
                                appt.status !== "IN_CONSULTATION" &&
                                appt.status !== "COMPLETED" && (
                                  <button
                                    onClick={() =>
                                      handleStatusChange(appt.id, "IN_WAITING_ROOM")
                                    }
                                    className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold"
                                  >
                                    Llegó (Sala Espera)
                                  </button>
                                )}

                              {appt.status === "IN_WAITING_ROOM" && (
                                <Link
                                  href={`/${branchCode}/consultas/nueva?patientId=${appt.patient.id}&appointmentId=${appt.id}`}
                                  onClick={() =>
                                    handleStatusChange(appt.id, "IN_CONSULTATION")
                                  }
                                  className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-md shadow-indigo-600/30"
                                >
                                  <Stethoscope className="h-3 w-3" />
                                  Iniciar SOAP
                                </Link>
                              )}

                              {appt.status === "IN_CONSULTATION" && (
                                <button
                                  onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                                >
                                  Finalizar Cita
                                </button>
                              )}

                              {appt.status !== "COMPLETED" &&
                                appt.status !== "CANCELLED" && (
                                  <button
                                    onClick={() => handleStatusChange(appt.id, "NO_SHOW")}
                                    className="text-[10px] text-slate-500 hover:text-orange-400"
                                    title="Marcar que no se presentó"
                                  >
                                    No-Show
                                  </button>
                                )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* 2. VISTA DÍA (TIMELINE DETALLADO) */}
      {viewMode === "DAY" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-400" />
              Timeline de Citas del Día
            </h3>
            <span className="text-xs text-slate-400">
              {dayAppointments.length} citas registradas
            </span>
          </div>

          <div className="p-6 divide-y divide-slate-800">
            {dayAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No hay citas agendadas para esta fecha. Usa el botón "Nueva Cita" para programar.
              </div>
            ) : (
              dayAppointments
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((appt) => {
                  const cfg = statusConfig[appt.status] || statusConfig.SCHEDULED;

                  return (
                    <div
                      key={appt.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 px-3 rounded-2xl transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Franja horaria */}
                        <div className="w-24 shrink-0 font-mono text-sm font-extrabold text-white bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
                          {appt.startTime}
                          <div className="text-[10px] text-slate-400 font-sans font-normal">
                            {appt.endTime}
                          </div>
                        </div>

                        {/* Paciente, Tutor y Doctor */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-white">
                              {appt.patient.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({appt.patient.species === "CANINE" ? "Canino" : "Felino"} - {appt.patient.breed})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}
                            >
                              {cfg.label}
                            </span>
                            {appt.isOverbooking && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Sobrecupo Autorizado
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-300">
                            Tutor: <strong className="text-white">{appt.client.firstName} {appt.client.lastName}</strong> • Tel: {appt.client.phoneE164}
                          </div>

                          <div className="text-xs text-slate-400 flex items-center gap-3">
                            <span>Médico: <strong className="text-indigo-300">Dr. {appt.doctor.user.fullName}</strong></span>
                            <span>•</span>
                            <span>Servicio: <strong className="text-slate-300">{serviceLabels[appt.serviceType] || appt.serviceType}</strong></span>
                          </div>

                          {appt.reasonForVisit && (
                            <p className="text-xs text-slate-400 italic">
                              Motivo: "{appt.reasonForVisit}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {appt.status !== "IN_WAITING_ROOM" &&
                          appt.status !== "IN_CONSULTATION" &&
                          appt.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleStatusChange(appt.id, "IN_WAITING_ROOM")}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold"
                            >
                              Llegó a Recepción
                            </button>
                          )}

                        {appt.status === "IN_WAITING_ROOM" && (
                          <Link
                            href={`/${branchCode}/consultas/nueva?patientId=${appt.patient.id}&appointmentId=${appt.id}`}
                            onClick={() => handleStatusChange(appt.id, "IN_CONSULTATION")}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                          >
                            <Stethoscope className="h-4 w-4" />
                            Iniciar Consulta SOAP
                          </Link>
                        )}

                        {appt.status === "IN_CONSULTATION" && (
                          <button
                            onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold"
                          >
                            Finalizar Cita
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 3. VISTA SEMANA */}
      {viewMode === "WEEK" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="text-sm font-bold text-white mb-2">
            Vista Semanal de Citas
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
              // Calcular fechas de la semana actual (empezando en Lunes)
              const curr = new Date(selectedDate + "T00:00:00");
              const dayIndex = curr.getDay(); // 0 Dom, 1 Lun...
              const mondayDiff = dayIndex === 0 ? -6 : 1 - dayIndex;
              const monday = new Date(curr);
              monday.setDate(curr.getDate() + mondayDiff + offset);
              const dateStr = monday.toISOString().split("T")[0];

              const weekDayAppts = filteredAppointments.filter((a) => {
                return new Date(a.appointmentDate).toISOString().split("T")[0] === dateStr;
              });

              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/30"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold text-white capitalize">
                    {monday.toLocaleDateString("es-SV", { weekday: "short", day: "numeric" })}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {weekDayAppts.length} citas
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {weekDayAppts.slice(0, 4).map((a) => (
                      <div
                        key={a.id}
                        className="text-[10px] p-1.5 rounded-lg bg-slate-900 border border-slate-800 truncate text-slate-300"
                      >
                        <strong className="text-indigo-400">{a.startTime}</strong> {a.patient.name}
                      </div>
                    ))}
                    {weekDayAppts.length > 4 && (
                      <div className="text-[9px] text-slate-500 text-center">
                        +{weekDayAppts.length - 4} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VISTA MES */}
      {viewMode === "MONTH" && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md shadow-xl space-y-4">
          <div className="text-sm font-bold text-white mb-2">
            Vista Mensual y Semáforo de Capacidad
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold text-slate-400 py-1"
              >
                {d}
              </div>
            ))}

            {/* Cuadrícula de 35 días */}
            {Array.from({ length: 35 }).map((_, i) => {
              const baseDate = new Date(selectedDate + "T00:00:00");
              const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
              const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
              const cellDate = new Date(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                i - startDay + 1
              );
              const cellStr = cellDate.toISOString().split("T")[0];

              const count = appointments.filter((a) => {
                return new Date(a.appointmentDate).toISOString().split("T")[0] === cellStr;
              }).length;

              const isSelected = cellStr === selectedDate;
              const isCurrentMonth = cellDate.getMonth() === baseDate.getMonth();

              return (
                <div
                  key={cellStr}
                  onClick={() => setSelectedDate(cellStr)}
                  className={`min-h-[70px] p-2 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/40"
                      : isCurrentMonth
                      ? "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                      : "bg-slate-950/20 border-slate-900/50 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-indigo-400" : "text-white"
                      }`}
                    >
                      {cellDate.getDate()}
                    </span>
                    {count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>

                  <div className="text-[10px] text-right font-mono">
                    {count > 0 ? (
                      <span className="text-emerald-400 font-bold">{count} citas</span>
                    ) : (
                      <span className="text-slate-600">Libre</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODALES ── */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        branchCode={branchCode}
        doctors={doctors}
        patients={patients}
        initialDate={selectedDate}
        initialDoctorId={selectedDoctorId !== "ALL" ? selectedDoctorId : undefined}
        currentUserId={currentUserId}
      />

      <DoctorScheduleSettingsModal
        isOpen={isScheduleSettingsOpen}
        onClose={() => setIsScheduleSettingsOpen(false)}
        branchCode={branchCode}
        doctors={doctors}
        existingSchedules={doctorSchedules}
      />
    </div>
  );
}
