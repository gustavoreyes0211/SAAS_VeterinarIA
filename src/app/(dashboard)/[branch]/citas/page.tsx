import React from "react";
import { prisma } from "@/lib/prisma";
import { getAppointments, getBranchDoctorSchedules } from "@/lib/actions/appointments";
import { getPatients } from "@/lib/actions/patients";
import { serializeData } from "@/lib/utils";
import { ReceptionCalendarView } from "@/components/appointments/ReceptionCalendarView";
import {
  CalendarDays,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface CitasPageProps {
  params: Promise<{
    branch: string;
  }>;
}

export default async function CitasPage({ params }: CitasPageProps) {
  const { branch } = await params;

  const branchEntity = await prisma.branch.findFirst({
    where: { code: branch },
    select: { id: true, name: true, tenantId: true },
  });

  const appointments = await getAppointments({ branchCode: branch });
  const patients = await getPatients({ branchCode: branch });

  const rawDoctors = await prisma.doctorProfile.findMany({
    where: {
      tenantId: branchEntity?.tenantId,
      user: { isActive: true },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  const doctors = rawDoctors.map((d) => ({
    id: d.id,
    fullName: d.user.fullName,
    specialties: d.specialties,
  }));

  const doctorSchedules = await getBranchDoctorSchedules(branch);

  // KPIs del día
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => {
    return new Date(a.appointmentDate).toISOString().split("T")[0] === todayStr;
  });

  const inWaitingRoom = todayAppointments.filter((a) => a.status === "IN_WAITING_ROOM").length;
  const inConsultation = todayAppointments.filter((a) => a.status === "IN_CONSULTATION").length;
  const confirmed = todayAppointments.filter((a) => a.status === "CONFIRMED").length;
  const totalToday = todayAppointments.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── HEADER DE SECCIÓN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>RECEPCIÓN & CITAS</span>
            <span>•</span>
            <span className="text-slate-400 uppercase tracking-wider">
              {branchEntity?.name || branch}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-indigo-500" />
            Agenda de Citas & Calendario de Recepción
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión visual de turnos, slot engine con límite diario estricto por médico y control de flujo de sala de espera.
          </p>
        </div>
      </div>

      {/* ── KPIS DE RECEPCIÓN DEL DÍA ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Citas de Hoy */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold text-slate-300">Citas de Hoy</span>
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2 font-mono">
            {totalToday}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Programadas para atención</p>
        </div>

        {/* En Sala de Espera */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-amber-300">En Sala de Espera</span>
            <Clock className="h-4 w-4 animate-spin text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
            {inWaitingRoom}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Listos para llamado a consultorio</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/40" />
        </div>

        {/* En Consulta Médica */}
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold text-purple-300">En Atención Médica</span>
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 mt-2 font-mono">
            {inConsultation}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consulta SOAP en curso</p>
        </div>

        {/* Confirmadas */}
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-emerald-300">Confirmadas</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            {confirmed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Asistencia reconfirmada</p>
        </div>
      </div>

      {/* ── CALENDARIO INTERACTIVO DE RECEPCIÓN ── */}
      <ReceptionCalendarView
        branchCode={branch}
        initialAppointments={serializeData(appointments) as any}
        doctors={serializeData(doctors) as any}
        patients={serializeData(patients) as any}
        doctorSchedules={serializeData(doctorSchedules) as any}
      />
    </div>
  );
}
