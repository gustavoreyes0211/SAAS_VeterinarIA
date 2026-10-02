"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Calculadora de Fluidoterapia Hospitalaria de Alta Precisión
 * Fórmula: Tasa Total = Mantenimiento + Reposición de Déficit por Deshidratación + Pérdidas Continuas
 */
export async function calculateFluidTherapy(params: {
  weightKg: number;
  dehydrationPercent?: number; // Ej. 5%, 7%, 10%
  hoursToRehydrate?: number;   // Ej. 12h, 24h
  ongoingLossesMlDay?: number; // Pérdidas estimadas por vómitos/diarreas en 24h
  maintenanceRateMlKgDay?: number; // Estándar canino: 50-60 ml/kg/d; felino: 40-50 ml/kg/d
}) {
  const w = Math.max(0.1, Number(params.weightKg) || 1);
  const dehy = Math.max(0, Math.min(15, Number(params.dehydrationPercent) || 0));
  const rehydrateHours = Math.max(1, Number(params.hoursToRehydrate) || 24);
  const ongoing = Math.max(0, Number(params.ongoingLossesMlDay) || 0);
  const maintPerKg = Number(params.maintenanceRateMlKgDay) || 50;

  // 1. Volumen de Mantenimiento (ml / 24h)
  const maintenance24h = w * maintPerKg;

  // 2. Volumen de Déficit por Deshidratación (ml): Peso (kg) x % Deshidratación x 10
  // Ej. 10 kg x 7% x 10 = 700 ml
  const deficitMl = w * (dehy / 100) * 1000;

  // 3. Pérdidas en 24h
  const total24h = maintenance24h + deficitMl + ongoing;

  // Tasa de Infusión Continua por Hora
  const rateMlHr = total24h / 24;

  // Tasa de Gotas por Minuto
  // Normogotero (20 gotas/ml): (rateMlHr * 20) / 60
  // Microgotero (60 gotas/ml): (rateMlHr * 60) / 60 = rateMlHr
  const dropsPerMinNormo = (rateMlHr * 20) / 60;
  const dropsPerMinMicro = (rateMlHr * 60) / 60;

  return {
    weightKg: w,
    dehydrationPercent: dehy,
    maintenance24hMl: Math.round(maintenance24h),
    deficitMl: Math.round(deficitMl),
    ongoingLossesMl: Math.round(ongoing),
    totalVolume24hMl: Math.round(total24h),
    rateMlHr: Number(rateMlHr.toFixed(1)),
    dropsPerMinuteNormo: Math.round(dropsPerMinNormo),
    dropsPerMinuteMicro: Math.round(dropsPerMinMicro),
  };
}

/**
 * Obtener todos los pacientes hospitalizados en una sede
 */
export async function getHospitalizations(params?: {
  branchCode?: string;
  status?: string;
}) {
  try {
    const branch = await prisma.branch.findFirst({
      where: { code: params?.branchCode || "ESC-01" },
    });

    if (!branch) return [];

    const whereClause: any = {
      branchId: branch.id,
    };

    if (params?.status && params.status !== "ALL") {
      whereClause.status = params.status;
    }

    const hospitalizations = await prisma.hospitalization.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            client: true,
            breedRelation: true,
          },
        },
        attendingVet: true,
        orders: {
          where: { isActive: true },
          include: {
            executions: {
              orderBy: { scheduledAt: "asc" },
              take: 24,
            },
          },
        },
      },
      orderBy: { admissionDate: "desc" },
    });

    return hospitalizations;
  } catch (error) {
    console.error("Error al obtener hospitalizaciones:", error);
    return [];
  }
}

/**
 * Obtener detalle de una hospitalización específica
 */
export async function getHospitalizationById(id: string) {
  try {
    const hosp = await prisma.hospitalization.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            client: true,
            breedRelation: true,
            weightHistories: {
              orderBy: { recordedAt: "desc" },
              take: 5,
            },
          },
        },
        attendingVet: true,
        consultation: true,
        emergencyTriage: true,
        orders: {
          include: {
            executions: {
              include: {
                administeredBy: true,
              },
              orderBy: { scheduledAt: "asc" },
            },
          },
        },
      },
    });

    return hosp;
  } catch (error) {
    console.error("Error al obtener hospitalización:", error);
    return null;
  }
}

/**
 * Registrar un nuevo ingreso a hospitalización UCI
 */
export async function createHospitalization(
  data: {
    patientId: string;
    admissionWeightKg: number;
    admissionReason: string;
    consultationId?: string;
    emergencyTriageId?: string;
    initialFluidRateMlHr?: number;
    cageName?: string;
  },
  branchCode = "ESC-01"
) {
  try {
    const branch = await prisma.branch.findFirst({
      where: { code: branchCode },
    });

    if (!branch) {
      return { success: false, error: "Sucursal hospitalaria no encontrada." };
    }

    const vet = await prisma.user.findFirst({
      where: { email: "admin@veterinaria.com" },
    });

    if (!vet) {
      return { success: false, error: "Médico veterinario no registrado." };
    }

    const hosp = await prisma.hospitalization.create({
      data: {
        tenantId: branch.tenantId,
        branchId: branch.id,
        patientId: data.patientId,
        attendingVetId: vet.id,
        consultationId: data.consultationId || null,
        emergencyTriageId: data.emergencyTriageId || null,
        admissionWeightKg: data.admissionWeightKg,
        status: "ADMITTED",
        admissionReason: data.admissionReason,
        admissionDate: new Date(),
      },
      include: {
        patient: true,
      },
    });

    // Si se especificó tasa de fluidos, crear orden de fluidoterapia inicial
    if (data.initialFluidRateMlHr && data.initialFluidRateMlHr > 0) {
      await prisma.hospitalizationOrder.create({
        data: {
          tenantId: branch.tenantId,
          hospitalizationId: hosp.id,
          orderType: "FLUIDS",
          name: "Fluidoterapia Cristaloides (Hartmann / Ringer Lactato)",
          rateMlHr: data.initialFluidRateMlHr,
          frequencyHours: 24,
          instructions: `Infusión continua a ${data.initialFluidRateMlHr} ml/h en bomba de infusión. Monitorear volemia y auscultar campos pulmonares cada 4h.`,
        },
      });
    }

    revalidatePath(`/${branchCode}/uci`);
    revalidatePath(`/${branchCode}/dashboard`);

    return { success: true, hospitalization: hosp };
  } catch (error: any) {
    console.error("Error al ingresar paciente a UCI:", error);
    return { success: false, error: error.message || "Error al crear hospitalización." };
  }
}

/**
 * Agregar una nueva orden médica a un paciente hospitalizado (Fármaco, Fluido, Monitoreo)
 */
export async function addHospitalizationOrder(
  data: {
    hospitalizationId: string;
    orderType: string;
    name: string;
    dosage?: string;
    rateMlHr?: number;
    frequencyHours?: number;
    instructions?: string;
  },
  branchCode = "ESC-01"
) {
  try {
    const hosp = await prisma.hospitalization.findUnique({
      where: { id: data.hospitalizationId },
      include: { branch: true },
    });

    if (!hosp) return { success: false, error: "Hospitalización no encontrada." };

    const order = await prisma.hospitalizationOrder.create({
      data: {
        tenantId: hosp.tenantId,
        hospitalizationId: hosp.id,
        orderType: data.orderType,
        name: data.name,
        dosage: data.dosage || null,
        rateMlHr: data.rateMlHr || null,
        frequencyHours: data.frequencyHours || 8,
        instructions: data.instructions || null,
        isActive: true,
      },
    });

    // Generar las próximas ejecuciones horarias para las próximas 24 horas
    const now = new Date();
    const freq = data.frequencyHours || 8;
    const executionsData: any[] = [];

    for (let h = 0; h < 24; h += freq) {
      const scheduled = new Date(now.getTime() + h * 3600 * 1000);
      executionsData.push({
        tenantId: hosp.tenantId,
        orderId: order.id,
        scheduledAt: scheduled,
        status: "PENDING",
      });
    }

    if (executionsData.length > 0) {
      await prisma.flowboardExecution.createMany({
        data: executionsData,
      });
    }

    revalidatePath(`/${branchCode}/uci`);

    return { success: true, order };
  } catch (error: any) {
    console.error("Error al agregar orden hospitalaria:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Marcar una ejecución de Flowboard como administrada
 */
export async function markExecutionAdministered(
  executionId: string,
  notes?: string,
  branchCode = "ESC-01"
) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "admin@veterinaria.com" },
    });

    const execution = await prisma.flowboardExecution.update({
      where: { id: executionId },
      data: {
        status: "ADMINISTERED",
        administeredAt: new Date(),
        administeredByUserId: user?.id,
        notes: notes || "Administrado según indicación médica.",
      },
    });

    revalidatePath(`/${branchCode}/uci`);

    return { success: true, execution };
  } catch (error: any) {
    console.error("Error al marcar ejecución:", error);
    return { success: false, error: error.message };
  }
}
