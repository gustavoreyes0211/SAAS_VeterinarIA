"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EmergencyTriageColor, EmergencyClinicalStatus } from "@prisma/client";

/**
 * Calculadora de Fármacos de Reanimación Cardiopulmonar (CPR RECOVER 2.0)
 * Calcula dosis exactas en mg y volumen en ml basado en concentraciones comerciales estándar
 */
export async function calculateRecoverDosages(weightKg: number) {
  const w = Math.max(0.1, Number(weightKg) || 1);

  return {
    weightKg: w,
    compressions: {
      rateBpm: "100 - 120 cpm",
      cycleDurationMinutes: 2,
      depth: "1/3 a 1/2 del diámetro torácico",
      positionCanine: w > 15 ? "Decúbito lateral con compresión en el punto más ancho" : "Decúbito lateral sobre el corazón",
      positionFeline: "Compresión circunferencial o con dos manos sobre el corazón",
    },
    defibrillation: {
      biphasicJoules: {
        initial: (w * 2).toFixed(1) + " J (2 J/kg)",
        escalation: (w * 4).toFixed(1) + " J (4 J/kg)",
      },
      indication: "Fibrilación Ventricular (FV) o Taquicardia Ventricular sin Pulso (TVSP)",
    },
    drugs: [
      {
        name: "Epinefrina (Adrenalina) - Dosis Baja",
        indication: "Asistolia / AESP - Administrar cada 4 min (ciclos alternos)",
        concentration: "1 mg / ml (1:1,000)",
        doseMgKg: 0.01,
        doseMg: (w * 0.01).toFixed(3),
        volumeMl: (w * 0.01).toFixed(2) + " ml",
        route: "IV / IO (o x2 vía intratraqueal)",
        priority: "CRITICAL",
      },
      {
        name: "Epinefrina (Adrenalina) - Dosis Alta",
        indication: "Paro prolongado (> 10 min de RCP)",
        concentration: "1 mg / ml (1:1,000)",
        doseMgKg: 0.1,
        doseMg: (w * 0.1).toFixed(3),
        volumeMl: (w * 0.1).toFixed(2) + " ml",
        route: "IV / IO",
        priority: "SECONDARY",
      },
      {
        name: "Atropina",
        indication: "Asistolia / AESP con tono vagal elevado pre-paro",
        concentration: "0.5 mg / ml",
        doseMgKg: 0.04,
        doseMg: (w * 0.04).toFixed(3),
        volumeMl: ((w * 0.04) / 0.5).toFixed(2) + " ml",
        route: "IV / IO",
        priority: "CRITICAL",
      },
      {
        name: "Naloxona (Reversor de Opioides)",
        indication: "Paro asociado a sobredosis o anestesia con opioides",
        concentration: "0.4 mg / ml",
        doseMgKg: 0.04,
        doseMg: (w * 0.04).toFixed(3),
        volumeMl: ((w * 0.04) / 0.4).toFixed(2) + " ml",
        route: "IV / IO",
        priority: "REVERSAL",
      },
      {
        name: "Atipamezol (Reversor Alfa-2)",
        indication: "Reversión de Dexmedetomidina / Medetomidina",
        concentration: "5 mg / ml",
        doseMgKg: 0.25,
        doseMg: (w * 0.25).toFixed(3),
        volumeMl: ((w * 0.25) / 5.0).toFixed(2) + " ml",
        route: "IV / IM",
        priority: "REVERSAL",
      },
      {
        name: "Flumazenil (Reversor Benzodiacepinas)",
        indication: "Reversión de Midazolam / Diazepam",
        concentration: "0.1 mg / ml",
        doseMgKg: 0.01,
        doseMg: (w * 0.01).toFixed(3),
        volumeMl: ((w * 0.01) / 0.1).toFixed(2) + " ml",
        route: "IV / IO",
        priority: "REVERSAL",
      },
      {
        name: "Lidocaína 2% (Sin Epinefrina)",
        indication: "Taquicardia Ventricular Maligna / Extrasístoles refractarias",
        concentration: "20 mg / ml (2%)",
        doseMgKg: 2.0,
        doseMg: (w * 2.0).toFixed(2),
        volumeMl: ((w * 2.0) / 20.0).toFixed(2) + " ml",
        route: "IV lento (Caninos)",
        priority: "ANTIARRHYTHMIC",
      },
      {
        name: "Gluconato de Calcio 10%",
        indication: "Hiperpotasemia severa / Hipocalcemia / Bloqueadores de canales de Ca",
        concentration: "100 mg / ml (10%)",
        doseMgKg: 100,
        doseMg: (w * 100).toFixed(1),
        volumeMl: (w * 1.0).toFixed(2) + " ml",
        route: "IV muy lento con monitoreo ECG",
        priority: "SPECIAL",
      },
    ],
  };
}

/**
 * Obtener todos los triajes de emergencia de una sede con filtros
 */
export async function getEmergencyTriages(params?: {
  branchCode?: string;
  triageColor?: EmergencyTriageColor | "ALL";
  clinicalStatus?: EmergencyClinicalStatus | "ALL";
}) {
  try {
    const branch = await prisma.branch.findFirst({
      where: { code: params?.branchCode || "ESC-01" },
    });

    if (!branch) return [];

    const whereClause: any = {
      branchId: branch.id,
    };

    if (params?.triageColor && params.triageColor !== "ALL") {
      whereClause.triageColor = params.triageColor;
    }

    if (params?.clinicalStatus && params.clinicalStatus !== "ALL") {
      whereClause.clinicalStatus = params.clinicalStatus;
    }

    const triages = await prisma.emergencyTriage.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            client: true,
            breedRelation: true,
          },
        },
        client: true,
        evaluatedBy: true,
        attendingVet: true,
        assignedRoom: true,
      },
      orderBy: [
        { isCodeRedBroadcasted: "desc" },
        { admittedAt: "desc" },
      ],
    });

    return triages;
  } catch (error) {
    console.error("Error al obtener triajes de emergencia:", error);
    return [];
  }
}

/**
 * Obtener un triaje específico por su UUID
 */
export async function getEmergencyTriageById(id: string) {
  try {
    const triage = await prisma.emergencyTriage.findUnique({
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
        client: true,
        evaluatedBy: true,
        attendingVet: true,
        assignedRoom: true,
        consultations: true,
        hospitalizations: true,
        surgeries: true,
      },
    });

    return triage;
  } catch (error) {
    console.error("Error al obtener detalle de triaje:", error);
    return null;
  }
}

/**
 * Crear un nuevo registro de Triaje de Emergencia (VECCS)
 */
export async function createEmergencyTriage(
  data: {
    patientId?: string;
    clientId?: string;
    triageColor: EmergencyTriageColor;
    chiefComplaint: string;
    estimatedOrFastWeightKg: number;
    airwayStatus?: string;
    breathingEffort?: string;
    circulationPulse?: string;
    capillaryRefillSeconds?: number;
    mucousColor?: string;
    mentalStatus?: string;
    tempCelsius?: number;
    heartRateBpm?: number;
    respiratoryRateBpm?: number;
    spo2Percent?: number;
    systolicBp?: number;
    glucoseMgDl?: number;
    lactateMmolL?: number;
    assignedShockTable?: string;
    assignedRoomId?: string;
    isCodeRedBroadcasted?: boolean;
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

    // Identificar médico evaluador (admin por defecto en demo)
    const evaluator = await prisma.user.findFirst({
      where: { email: "admin@veterinaria.com" },
    });

    if (!evaluator) {
      return { success: false, error: "Usuario evaluador no registrado." };
    }

    // Pre-calcular dosis de paro RECOVER si es rojo o naranja
    const recoverDosages = await calculateRecoverDosages(data.estimatedOrFastWeightKg);

    const triage = await prisma.emergencyTriage.create({
      data: {
        tenantId: branch.tenantId,
        branchId: branch.id,
        patientId: data.patientId || null,
        clientId: data.clientId || null,
        evaluatedByUserId: evaluator.id,
        attendingVetId: evaluator.id,
        triageColor: data.triageColor,
        clinicalStatus:
          data.triageColor === EmergencyTriageColor.RED_IMMEDIATE
            ? EmergencyClinicalStatus.IN_CRASH_ROOM
            : EmergencyClinicalStatus.TRIAGED,
        chiefComplaint: data.chiefComplaint,
        estimatedOrFastWeightKg: data.estimatedOrFastWeightKg,
        airwayStatus: data.airwayStatus || "PATENT",
        breathingEffort: data.breathingEffort || "NORMAL",
        circulationPulse: data.circulationPulse || "STRONG",
        capillaryRefillSeconds: data.capillaryRefillSeconds || 1.5,
        mucousColor: data.mucousColor || "PINK",
        mentalStatus: data.mentalStatus || "ALERT",
        tempCelsius: data.tempCelsius || null,
        heartRateBpm: data.heartRateBpm || null,
        respiratoryRateBpm: data.respiratoryRateBpm || null,
        spo2Percent: data.spo2Percent || null,
        systolicBp: data.systolicBp || null,
        glucoseMgDl: data.glucoseMgDl || null,
        lactateMmolL: data.lactateMmolL || null,
        crashCartDosagesJson: recoverDosages as any,
        assignedShockTable: data.assignedShockTable || (data.triageColor === EmergencyTriageColor.RED_IMMEDIATE ? "Box de Choque 1" : null),
        assignedRoomId: data.assignedRoomId || null,
        isCodeRedBroadcasted: data.isCodeRedBroadcasted || data.triageColor === EmergencyTriageColor.RED_IMMEDIATE,
        admittedAt: new Date(),
      },
      include: {
        patient: true,
      },
    });

    revalidatePath(`/${branchCode}/emergencias`);
    revalidatePath(`/${branchCode}/dashboard`);

    return { success: true, triage };
  } catch (error: any) {
    console.error("Error al registrar triaje:", error);
    return { success: false, error: error.message || "Error al registrar triaje." };
  }
}

/**
 * Actualizar el estado clínico de un paciente en emergencias
 */
export async function updateTriageStatus(
  triageId: string,
  clinicalStatus: EmergencyClinicalStatus,
  branchCode = "ESC-01"
) {
  try {
    const updateData: any = { clinicalStatus };

    if (clinicalStatus === EmergencyClinicalStatus.STABILIZING) {
      updateData.attendedAt = new Date();
    } else if (clinicalStatus === EmergencyClinicalStatus.RECOVERED_TO_CONSULT || clinicalStatus === EmergencyClinicalStatus.DISCHARGED) {
      updateData.stabilizedAt = new Date();
      updateData.isCodeRedBroadcasted = false;
    }

    const triage = await prisma.emergencyTriage.update({
      where: { id: triageId },
      data: updateData,
    });

    revalidatePath(`/${branchCode}/emergencias`);
    revalidatePath(`/${branchCode}/dashboard`);

    return { success: true, triage };
  } catch (error: any) {
    console.error("Error al actualizar estado del triaje:", error);
    return { success: false, error: error.message || "Error al actualizar estado." };
  }
}

/**
 * Activar o silenciar la difusión de Código Rojo para un triaje
 */
export async function toggleCodeRedBroadcast(
  triageId: string,
  isActive: boolean,
  branchCode = "ESC-01"
) {
  try {
    const triage = await prisma.emergencyTriage.update({
      where: { id: triageId },
      data: { isCodeRedBroadcasted: isActive },
    });

    revalidatePath(`/${branchCode}/emergencias`);
    revalidatePath(`/${branchCode}/dashboard`);

    return { success: true, triage };
  } catch (error: any) {
    console.error("Error al alternar código rojo:", error);
    return { success: false, error: error.message };
  }
}
