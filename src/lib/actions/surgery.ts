"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AsaRiskClassification, SurgeryStatus } from "@prisma/client";

/**
 * Obtener listado de cirugías por sucursal con filtros de estado
 */
export async function getSurgeries(params: {
  branchCode: string;
  status?: SurgeryStatus;
  date?: string; // YYYY-MM-DD
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: params.branchCode },
  });

  if (!branch) {
    throw new Error(`Sucursal con código ${params.branchCode} no encontrada.`);
  }

  const whereClause: any = {
    branchId: branch.id,
  };

  if (params.status) {
    whereClause.status = params.status;
  }

  const surgeries = await prisma.surgery.findMany({
    where: whereClause,
    include: {
      patient: {
        include: {
          client: true,
          breedRelation: true,
        },
      },
      leadSurgeon: {
        select: {
          id: true,
          fullName: true,
          professionalLicense: true,
          email: true,
        },
      },
      anesthesiologist: {
        select: {
          id: true,
          fullName: true,
          professionalLicense: true,
          email: true,
        },
      },
      room: true,
      anesthesiaLogs: {
        orderBy: {
          recordedAt: "desc",
        },
        take: 1, // Último registro de signos vitales para badge de estado
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  return surgeries;
}

/**
 * Obtener detalle completo de una cirugía y su hoja anestésica intraoperatoria
 */
export async function getSurgeryById(surgeryId: string) {
  const surgery = await prisma.surgery.findUnique({
    where: { id: surgeryId },
    include: {
      patient: {
        include: {
          client: true,
          breedRelation: true,
          weightHistories: {
            orderBy: { recordedAt: "desc" },
            take: 3,
          },
        },
      },
      leadSurgeon: {
        select: {
          id: true,
          fullName: true,
          professionalLicense: true,
          email: true,
        },
      },
      anesthesiologist: {
        select: {
          id: true,
          fullName: true,
          professionalLicense: true,
          email: true,
        },
      },
      room: true,
      anesthesiaLogs: {
        orderBy: {
          recordedAt: "asc", // Cronológico para graficar o tabular la hoja anestésica
        },
      },
      consentForm: true,
      consultation: true,
      emergencyTriage: true,
    },
  });

  return surgery;
}

/**
 * Registrar o agendar una nueva intervención quirúrgica
 */
export async function createSurgery(data: {
  branchCode: string;
  patientId: string;
  leadSurgeonId: string;
  anesthesiologistId?: string;
  roomId?: string;
  surgeryName: string;
  asaGrade: AsaRiskClassification;
  preOpWeightKg: number;
  preMedicationProtocol?: string;
  inductionAgent?: string;
  maintenanceAgent?: string;
  isEmergency?: boolean;
}) {
  const branch = await prisma.branch.findFirst({
    where: { code: data.branchCode },
  });

  if (!branch) {
    throw new Error(`Sucursal con código ${data.branchCode} no encontrada.`);
  }

  const surgery = await prisma.surgery.create({
    data: {
      tenantId: branch.tenantId,
      branchId: branch.id,
      patientId: data.patientId,
      leadSurgeonId: data.leadSurgeonId,
      anesthesiologistId: data.anesthesiologistId || null,
      roomId: data.roomId || null,
      surgeryName: data.surgeryName,
      asaGrade: data.asaGrade,
      status: data.isEmergency ? "PRE_OP" : "SCHEDULED",
      preOpWeightKg: data.preOpWeightKg,
      preMedicationProtocol: data.preMedicationProtocol || null,
      inductionAgent: data.inductionAgent || null,
      maintenanceAgent: data.maintenanceAgent || "ISOFLURANE",
    },
  });

  revalidatePath(`/${data.branchCode}/quirofano`);
  return surgery;
}

/**
 * Transición de fase quirúrgica
 */
export async function updateSurgeryStatus(
  surgeryId: string,
  branchCode: string,
  newStatus: SurgeryStatus
) {
  const updateData: any = { status: newStatus };

  if (newStatus === "IN_SURGERY") {
    updateData.surgeryStartTime = new Date();
  } else if (newStatus === "COMPLETED" || newStatus === "RECOVERY") {
    updateData.surgeryEndTime = new Date();
  }

  const updated = await prisma.surgery.update({
    where: { id: surgeryId },
    data: updateData,
  });

  revalidatePath(`/${branchCode}/quirofano`);
  revalidatePath(`/${branchCode}/quirofano/${surgeryId}`);
  return updated;
}

/**
 * Validar y firmar checklist de seguridad quirúrgica OMS
 */
export async function updateSurgeryChecklist(
  surgeryId: string,
  branchCode: string,
  stage: "sign_in" | "time_out" | "sign_out",
  passed: boolean
) {
  const updatePayload: any = {};
  if (stage === "sign_in") updatePayload.checklistSignInPassed = passed;
  if (stage === "time_out") updatePayload.checklistTimeOutPassed = passed;
  if (stage === "sign_out") updatePayload.checklistSignOutPassed = passed;

  const updated = await prisma.surgery.update({
    where: { id: surgeryId },
    data: updatePayload,
  });

  revalidatePath(`/${branchCode}/quirofano/${surgeryId}`);
  return updated;
}

/**
 * Añadir registro temporal de signos vitales a la Hoja Anestésica
 */
export async function addAnesthesiaLog(
  surgeryId: string,
  branchCode: string,
  data: {
    heartRateBpm?: number;
    respiratoryRateBpm?: number;
    spo2Percent?: number;
    etco2Mmhg?: number;
    systolicBp?: number;
    diastolicBp?: number;
    meanBp?: number;
    tempCelsius?: number;
    vaporizerPct?: number;
    fluidRateMlHr?: number;
    administeredBolus?: string;
    notes?: string;
  }
) {
  const surgery = await prisma.surgery.findUnique({
    where: { id: surgeryId },
    select: { tenantId: true },
  });

  if (!surgery) throw new Error("Cirugía no encontrada");

  // Si no se proporcionó Presión Arterial Media (PAM), se calcula con la fórmula estándar:
  // PAM = Diastólica + 1/3 * (Sistólica - Diastólica)
  let calculatedMap = data.meanBp;
  if (!calculatedMap && data.systolicBp && data.diastolicBp) {
    calculatedMap = Math.round(
      data.diastolicBp + (data.systolicBp - data.diastolicBp) / 3
    );
  }

  const log = await prisma.surgeryAnesthesiaLog.create({
    data: {
      tenantId: surgery.tenantId,
      surgeryId,
      heartRateBpm: data.heartRateBpm ?? null,
      respiratoryRateBpm: data.respiratoryRateBpm ?? null,
      spo2Percent: data.spo2Percent ?? null,
      etco2Mmhg: data.etco2Mmhg ?? null,
      systolicBp: data.systolicBp ?? null,
      diastolicBp: data.diastolicBp ?? null,
      meanBp: calculatedMap ?? null,
      tempCelsius: data.tempCelsius ?? null,
      vaporizerPct: data.vaporizerPct ?? null,
      fluidRateMlHr: data.fluidRateMlHr ?? null,
      administeredBolus: data.administeredBolus ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath(`/${branchCode}/quirofano/${surgeryId}`);
  return log;
}

/**
 * Guardar informe y protocolo operatorio de hallazgos
 */
export async function updateSurgicalReport(
  surgeryId: string,
  branchCode: string,
  surgicalFindingsReport: string
) {
  const updated = await prisma.surgery.update({
    where: { id: surgeryId },
    data: {
      surgicalFindingsReport,
    },
  });

  revalidatePath(`/${branchCode}/quirofano/${surgeryId}`);
  return updated;
}
