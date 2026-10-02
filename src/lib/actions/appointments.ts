"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

/**
 * Obtener listado de citas con filtros
 */
export async function getAppointments(params: {
  branchCode: string;
  doctorId?: string;
  date?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: AppointmentStatus | "ALL";
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: params.branchCode },
  });

  if (!branch) return [];

  const whereClause: any = {
    branchId: branch.id,
  };

  if (params.doctorId && params.doctorId !== "ALL") {
    whereClause.doctorId = params.doctorId;
  }

  if (params.status && params.status !== "ALL") {
    whereClause.status = params.status;
  }

  if (params.date) {
    const d = new Date(params.date + "T00:00:00.000Z");
    whereClause.appointmentDate = d;
  } else if (params.startDate && params.endDate) {
    whereClause.appointmentDate = {
      gte: new Date(params.startDate + "T00:00:00.000Z"),
      lte: new Date(params.endDate + "T23:59:59.999Z"),
    };
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      patient: {
        include: {
          breedRelation: true,
        },
      },
      client: true,
      doctor: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              professionalLicense: true,
            },
          },
        },
      },
      room: true,
      createdByUser: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [
      { appointmentDate: "asc" },
      { startTime: "asc" },
    ],
  });

  return appointments;
}

/**
 * Slot Engine: Cálculo Dinámico de Disponibilidad y Cupo Diario
 */
export async function getDoctorAvailability(params: {
  branchCode: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: params.branchCode },
  });

  if (!branch) {
    return {
      isAvailable: false,
      reason: "Sucursal no encontrada",
      slots: [],
      activeCount: 0,
      dailyLimit: 0,
      limitReached: true,
    };
  }

  const targetDate = new Date(params.date + "T00:00:00.000Z");
  const dayOfWeek = targetDate.getUTCDay(); // 0=Domingo, 6=Sábado

  // 1. Obtener horario semanal configurado para este día
  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      branchId: branch.id,
      doctorId: params.doctorId,
      dayOfWeek: dayOfWeek,
      isActive: true,
    },
  });

  if (!schedule) {
    return {
      isAvailable: false,
      reason: "El médico no atiende en esta sucursal en el día seleccionado.",
      slots: [],
      activeCount: 0,
      dailyLimit: 0,
      limitReached: true,
    };
  }

  // 2. Verificar bloqueos manuales / excepciones (vacaciones, ausencias)
  const override = await prisma.doctorScheduleOverride.findFirst({
    where: {
      doctorId: params.doctorId,
      overrideDate: targetDate,
    },
  });

  if (override?.isFullDayBlocked) {
    return {
      isAvailable: false,
      reason: `Día no disponible por excepción: ${override.reason}`,
      slots: [],
      activeCount: 0,
      dailyLimit: schedule.dailyConsultationLimit,
      limitReached: true,
    };
  }

  // 3. Contar citas activas del día para auditar límite diario estricto
  const activeStatuses: AppointmentStatus[] = [
    "SCHEDULED",
    "CONFIRMED",
    "IN_WAITING_ROOM",
    "IN_CONSULTATION",
    "COMPLETED",
  ];

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: params.doctorId,
      appointmentDate: targetDate,
      status: { in: activeStatuses },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
    },
  });

  const activeCount = existingAppointments.length;
  const limitReached = activeCount >= schedule.dailyConsultationLimit;

  // 4. Generar franjas horarias (slots)
  const slots: Array<{
    time: string;
    endTime: string;
    isAvailable: boolean;
    isOccupied: boolean;
    isBreak: boolean;
  }> = [];

  const parseMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const formatMinutes = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const startMins = parseMinutes(schedule.startTime);
  const endMins = parseMinutes(schedule.endTime);
  const slotDuration = schedule.slotDurationMinutes || 30;

  const breakStartMins = schedule.breakStartTime ? parseMinutes(schedule.breakStartTime) : null;
  const breakEndMins = schedule.breakEndTime ? parseMinutes(schedule.breakEndTime) : null;

  for (let m = startMins; m + slotDuration <= endMins; m += slotDuration) {
    const slotStartStr = formatMinutes(m);
    const slotEndStr = formatMinutes(m + slotDuration);

    // Verificar si cae en receso/almuerzo
    let isBreak = false;
    if (breakStartMins !== null && breakEndMins !== null) {
      if (m >= breakStartMins && m < breakEndMins) {
        isBreak = true;
      }
    }

    // Verificar si colisiona con cita ya agendada
    const isOccupied = existingAppointments.some((appt) => {
      return appt.startTime === slotStartStr;
    });

    const isAvailable = !isBreak && !isOccupied && !limitReached;

    slots.push({
      time: slotStartStr,
      endTime: slotEndStr,
      isAvailable,
      isOccupied,
      isBreak,
    });
  }

  return {
    isAvailable: true,
    schedule: {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakStartTime: schedule.breakStartTime,
      breakEndTime: schedule.breakEndTime,
      slotDurationMinutes: schedule.slotDurationMinutes,
      dailyConsultationLimit: schedule.dailyConsultationLimit,
    },
    slots,
    activeCount,
    dailyLimit: schedule.dailyConsultationLimit,
    limitReached,
  };
}

/**
 * Resumen de disponibilidad mensual para selector calendario con semáforo verde/rojo
 */
export async function getMonthAvailabilityMap(params: {
  branchCode: string;
  doctorId?: string;
  year: number;
  month: number; // 1-12
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: params.branchCode },
  });

  if (!branch) return {};

  const startDate = new Date(Date.UTC(params.year, params.month - 1, 1));
  const endDate = new Date(Date.UTC(params.year, params.month, 0));

  const whereClause: any = {
    branchId: branch.id,
    appointmentDate: {
      gte: startDate,
      lte: endDate,
    },
    status: {
      in: ["SCHEDULED", "CONFIRMED", "IN_WAITING_ROOM", "IN_CONSULTATION", "COMPLETED"],
    },
  };

  if (params.doctorId && params.doctorId !== "ALL") {
    whereClause.doctorId = params.doctorId;
  }

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    select: {
      appointmentDate: true,
      doctorId: true,
    },
  });

  // Agrupar conteos por fecha YYYY-MM-DD
  const dateCounts: Record<string, number> = {};
  for (const a of appointments) {
    const key = a.appointmentDate.toISOString().split("T")[0];
    dateCounts[key] = (dateCounts[key] || 0) + 1;
  }

  return dateCounts;
}

/**
 * Agendar nueva cita médica respetando límite diario estricto
 */
export async function createAppointment(data: {
  branchCode: string;
  doctorId: string;
  patientId: string;
  clientId: string;
  roomId?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime?: string;        // HH:mm
  serviceType?: string;
  reasonForVisit?: string;
  internalNotes?: string;
  isOverbooking?: boolean;
  overbookingAuthorizedByUserId?: string;
  createdByUserId?: string;
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: data.branchCode },
  });

  if (!branch) throw new Error("Sucursal no encontrada");

  const targetDate = new Date(data.appointmentDate + "T00:00:00.000Z");
  const dayOfWeek = targetDate.getUTCDay();

  // Validar horario y límite diario
  const schedule = await prisma.doctorSchedule.findFirst({
    where: {
      branchId: branch.id,
      doctorId: data.doctorId,
      dayOfWeek,
      isActive: true,
    },
  });

  const activeStatuses: AppointmentStatus[] = [
    "SCHEDULED",
    "CONFIRMED",
    "IN_WAITING_ROOM",
    "IN_CONSULTATION",
    "COMPLETED",
  ];

  // Contar citas existentes para este médico en esta fecha
  const existingCount = await prisma.appointment.count({
    where: {
      doctorId: data.doctorId,
      appointmentDate: targetDate,
      status: { in: activeStatuses },
    },
  });

  const dailyLimit = schedule?.dailyConsultationLimit || 12;

  // LÍMITE DIARIO ESTRICTO:
  if (existingCount >= dailyLimit && !data.isOverbooking) {
    throw new Error(
      `El médico ha alcanzado su límite máximo de ${dailyLimit} consultas para la fecha seleccionada. Se requiere autorización de Director Médico o Administrador para sobrecupo.`
    );
  }

  // Validar colisión de horario exacto si no es sobrecupo
  const collision = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate: targetDate,
      startTime: data.startTime,
      status: { in: activeStatuses },
    },
  });

  if (collision && !data.isOverbooking) {
    throw new Error(
      `El horario ${data.startTime} ya se encuentra ocupado por otra cita médica activa.`
    );
  }

  // Calcular endTime si no viene provisto
  let calculatedEnd = data.endTime;
  if (!calculatedEnd) {
    const [h, m] = data.startTime.split(":").map(Number);
    const duration = schedule?.slotDurationMinutes || 30;
    const totalEndMins = h * 60 + m + duration;
    const endH = Math.floor(totalEndMins / 60);
    const endM = totalEndMins % 60;
    calculatedEnd = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: branch.tenantId,
      branchId: branch.id,
      doctorId: data.doctorId,
      patientId: data.patientId,
      clientId: data.clientId,
      roomId: data.roomId || null,
      appointmentDate: targetDate,
      startTime: data.startTime,
      endTime: calculatedEnd,
      status: "SCHEDULED",
      serviceType: data.serviceType || "CONSULTA_GENERAL",
      reasonForVisit: data.reasonForVisit || null,
      internalNotes: data.internalNotes || null,
      isOverbooking: data.isOverbooking || false,
      overbookingAuthorizedByUserId: data.isOverbooking
        ? data.overbookingAuthorizedByUserId || null
        : null,
      createdByUserId: data.createdByUserId || null,
    },
  });

  revalidatePath(`/${data.branchCode}/citas`);
  return appointment;
}

/**
 * Transición de estado de la cita
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  branchCode: string,
  newStatus: AppointmentStatus
) {
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus },
  });

  revalidatePath(`/${branchCode}/citas`);
  return updated;
}

/**
 * Configurar o actualizar horario semanal de un médico
 */
export async function upsertDoctorSchedule(data: {
  branchCode: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  slotDurationMinutes?: number;
  dailyConsultationLimit?: number;
  isActive?: boolean;
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: data.branchCode },
  });

  if (!branch) throw new Error("Sucursal no encontrada");

  const existing = await prisma.doctorSchedule.findFirst({
    where: {
      branchId: branch.id,
      doctorId: data.doctorId,
      dayOfWeek: data.dayOfWeek,
    },
  });

  if (existing) {
    const updated = await prisma.doctorSchedule.update({
      where: { id: existing.id },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        breakStartTime: data.breakStartTime || null,
        breakEndTime: data.breakEndTime || null,
        slotDurationMinutes: data.slotDurationMinutes || 30,
        dailyConsultationLimit: data.dailyConsultationLimit || 12,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    revalidatePath(`/${data.branchCode}/citas`);
    revalidatePath(`/${data.branchCode}/citas/horarios`);
    return updated;
  } else {
    const created = await prisma.doctorSchedule.create({
      data: {
        tenantId: branch.tenantId,
        branchId: branch.id,
        doctorId: data.doctorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        breakStartTime: data.breakStartTime || null,
        breakEndTime: data.breakEndTime || null,
        slotDurationMinutes: data.slotDurationMinutes || 30,
        dailyConsultationLimit: data.dailyConsultationLimit || 12,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    revalidatePath(`/${data.branchCode}/citas`);
    revalidatePath(`/${data.branchCode}/citas/horarios`);
    return created;
  }
}

/**
 * Obtener todos los horarios semanales de los médicos en la sucursal
 */
export async function getBranchDoctorSchedules(branchCode: string) {
  const branch = await prisma.branch.findFirst({
    where: { code: branchCode },
  });

  if (!branch) return [];

  return prisma.doctorSchedule.findMany({
    where: { branchId: branch.id },
    include: {
      doctor: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [
      { doctorId: "asc" },
      { dayOfWeek: "asc" },
    ],
  });
}
