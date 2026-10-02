"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultTenantAndBranch } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ConsultationType } from "@prisma/client";

const prescriptionItemSchema = z.object({
  medicationName: z.string().min(1, "Nombre del fármaco requerido"),
  activeIngredient: z.string().optional().nullable(),
  dosageText: z.string().min(1, "Dosis requerida (ej. 10 mg/kg)"),
  routeOfAdministration: z.string().default("ORAL"),
  frequencyHours: z.coerce.number().min(1).default(12),
  durationDays: z.coerce.number().min(1).default(7),
  quantityToDispense: z.string().min(1, "Cantidad requerida"),
  specialInstructions: z.string().optional().nullable(),
});

const consultationSchema = z.object({
  patientId: z.string().uuid("Seleccione un paciente"),
  consultationType: z.nativeEnum(ConsultationType).default(ConsultationType.GENERAL),
  anamnesisReason: z.string().min(3, "El motivo de consulta es obligatorio"),
  currentDiet: z.string().optional().nullable(),
  currentMedications: z.string().optional().nullable(),
  weightKg: z.coerce.number().positive("El peso debe ser mayor a 0"),
  tempCelsius: z.coerce.number().optional().nullable(),
  heartRateBpm: z.coerce.number().optional().nullable(),
  respiratoryRateBpm: z.coerce.number().optional().nullable(),
  systolicBp: z.coerce.number().optional().nullable(),
  capillaryRefillSeconds: z.coerce.number().optional().nullable(),
  mucousMembraneStatus: z.string().default("PINK"),
  hydrationPercentage: z.coerce.number().default(0),
  bodyConditionScore: z.coerce.number().min(1).max(9).default(5),
  painScaleScore: z.coerce.number().min(0).max(4).default(0),
  physicalExamSystems: z.record(z.string(), z.any()).default({}),
  subjective: z.string().min(2, "Subjetivo (Anamnesis) requerido"),
  objective: z.string().min(2, "Objetivo (Examen físico) requerido"),
  assessmentDiagnosis: z.string().min(2, "Diagnóstico requerido"),
  differentialDiagnoses: z.array(z.string()).default([]),
  planTherapeuticSummary: z.string().min(2, "Plan terapéutico requerido"),
  requiresHospitalization: z.boolean().default(false),
  requiresSurgery: z.boolean().default(false),
  requiresLabTests: z.boolean().default(false),
  requiresImaging: z.boolean().default(false),
  isClosed: z.boolean().default(false),
  prescriptionItems: z.array(prescriptionItemSchema).default([]),
});

export type CreateConsultationInput = z.infer<typeof consultationSchema>;

export async function getConsultations(params?: {
  branchCode?: string;
  patientId?: string;
  search?: string;
}) {
  const { tenant } = await getDefaultTenantAndBranch(params?.branchCode);
  if (!tenant) return [];

  const whereClause: any = {
    tenantId: tenant.id,
  };

  if (params?.patientId) {
    whereClause.patientId = params.patientId;
  }

  if (params?.search && params.search.trim().length > 0) {
    const q = params.search.trim();
    whereClause.OR = [
      { assessmentDiagnosis: { contains: q, mode: "insensitive" } },
      { anamnesisReason: { contains: q, mode: "insensitive" } },
      {
        patient: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { microchipNumber: { contains: q } },
          ],
        },
      },
    ];
  }

  return await prisma.consultation.findMany({
    where: whereClause,
    include: {
      patient: {
        include: {
          client: true,
          breedRelation: true,
        },
      },
      veterinarian: {
        select: {
          id: true,
          fullName: true,
          professionalLicense: true,
        },
      },
      room: true,
      addendums: true,
      prescriptions: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      consultationDate: "desc",
    },
  });
}

export async function getConsultationById(id: string) {
  return await prisma.consultation.findUnique({
    where: { id },
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
      veterinarian: {
        select: {
          id: true,
          fullName: true,
          professionalLicense: true,
        },
      },
      room: true,
      addendums: {
        include: {
          veterinarian: {
            select: { id: true, fullName: true, professionalLicense: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      prescriptions: {
        include: {
          items: true,
          veterinarian: {
            select: { id: true, fullName: true, professionalLicense: true },
          },
        },
      },
    },
  });
}

export async function createConsultation(
  data: CreateConsultationInput,
  branchCode: string = "central"
) {
  try {
    const validated = consultationSchema.parse(data);
    const { tenant, branch } = await getDefaultTenantAndBranch(branchCode);

    if (!tenant || !branch) {
      return { success: false, error: "Sede o inquilino no encontrado." };
    }

    // Obtener un veterinario activo para asociarlo
    const doctor = await prisma.user.findFirst({
      where: {
        userTenants: { some: { tenantId: tenant.id } },
        isActive: true,
      },
    });

    if (!doctor) {
      return { success: false, error: "No hay un médico veterinario disponible." };
    }

    const consultation = await prisma.$transaction(async (tx) => {
      // 1. Crear Consulta SOAP
      const newConsultation = await tx.consultation.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          patientId: validated.patientId,
          veterinarianId: doctor.id,
          consultationType: validated.consultationType,
          anamnesisReason: validated.anamnesisReason.trim(),
          currentDiet: validated.currentDiet?.trim() || null,
          currentMedications: validated.currentMedications?.trim() || null,
          weightKg: validated.weightKg,
          tempCelsius: validated.tempCelsius || null,
          heartRateBpm: validated.heartRateBpm || null,
          respiratoryRateBpm: validated.respiratoryRateBpm || null,
          systolicBp: validated.systolicBp || null,
          capillaryRefillSeconds: validated.capillaryRefillSeconds || null,
          mucousMembraneStatus: validated.mucousMembraneStatus,
          hydrationPercentage: validated.hydrationPercentage,
          bodyConditionScore: validated.bodyConditionScore,
          painScaleScore: validated.painScaleScore,
          physicalExamSystems: validated.physicalExamSystems as any,
          subjective: validated.subjective.trim(),
          objective: validated.objective.trim(),
          assessmentDiagnosis: validated.assessmentDiagnosis.trim(),
          differentialDiagnoses: validated.differentialDiagnoses,
          planTherapeuticSummary: validated.planTherapeuticSummary.trim(),
          requiresHospitalization: validated.requiresHospitalization,
          requiresSurgery: validated.requiresSurgery,
          requiresLabTests: validated.requiresLabTests,
          requiresImaging: validated.requiresImaging,
          isClosed: validated.isClosed,
          closedAt: validated.isClosed ? new Date() : null,
        },
      });

      // 2. Registrar el nuevo peso en el historial
      await tx.patientWeightHistory.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          patientId: validated.patientId,
          weightKg: validated.weightKg,
          recordedByUserId: doctor.id,
        },
      });

      // 3. Si hay prescripciones farmacológicas, crear la Receta Médica
      if (validated.prescriptionItems && validated.prescriptionItems.length > 0) {
        const prescriptionCode = `REC-${Date.now().toString().slice(-6)}`;
        const prescription = await tx.prescription.create({
          data: {
            tenantId: tenant.id,
            branchId: branch.id,
            patientId: validated.patientId,
            veterinarianId: doctor.id,
            consultationId: newConsultation.id,
            prescriptionCode,
            generalIndications: validated.planTherapeuticSummary,
          },
        });

        for (const item of validated.prescriptionItems) {
          await tx.prescriptionItem.create({
            data: {
              tenantId: tenant.id,
              prescriptionId: prescription.id,
              medicationName: item.medicationName,
              activeIngredient: item.activeIngredient || null,
              dosageText: item.dosageText,
              routeOfAdministration: item.routeOfAdministration,
              frequencyHours: item.frequencyHours,
              durationDays: item.durationDays,
              quantityToDispense: item.quantityToDispense,
              specialInstructions: item.specialInstructions || null,
            },
          });
        }
      }

      return newConsultation;
    });

    revalidatePath(`/${branchCode}/consultas`);
    revalidatePath(`/${branchCode}/pacientes/${validated.patientId}`);

    return { success: true, consultation };
  } catch (error: any) {
    console.error("Error al registrar consulta SOAP:", error);
    if (error instanceof z.ZodError) {
      const msg = (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Datos incompletos.";
      return { success: false, error: msg };
    }
    return { success: false, error: "Error de servidor al guardar la consulta." };
  }
}

export async function addConsultationAddendum(
  consultationId: string,
  addendumText: string,
  branchCode: string = "central"
) {
  try {
    if (!addendumText || addendumText.trim().length === 0) {
      return { success: false, error: "El texto de la adenda no puede estar vacío." };
    }

    const { tenant } = await getDefaultTenantAndBranch(branchCode);
    if (!tenant) return { success: false, error: "Tenant no encontrado." };

    const doctor = await prisma.user.findFirst({
      where: { userTenants: { some: { tenantId: tenant.id } } },
    });
    if (!doctor) return { success: false, error: "Médico no autorizado." };

    await prisma.consultationAddendum.create({
      data: {
        tenantId: tenant.id,
        consultationId,
        veterinarianId: doctor.id,
        addendumText: addendumText.trim(),
      },
    });

    revalidatePath(`/${branchCode}/consultas/${consultationId}`);
    return { success: true };
  } catch (e: any) {
    console.error("Error al agregar adenda:", e);
    return { success: false, error: "Error al registrar la adenda médica." };
  }
}

export async function closeConsultation(consultationId: string, branchCode: string = "central") {
  try {
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        isClosed: true,
        closedAt: new Date(),
      },
    });

    revalidatePath(`/${branchCode}/consultas/${consultationId}`);
    return { success: true };
  } catch (e: any) {
    console.error("Error al cerrar consulta:", e);
    return { success: false, error: "Error al cerrar la consulta." };
  }
}
