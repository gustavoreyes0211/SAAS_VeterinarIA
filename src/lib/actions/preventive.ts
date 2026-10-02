"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultTenantAndBranch } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { VaccineStatus } from "@prisma/client";

const vaccineSchema = z.object({
  patientId: z.string().uuid(),
  vaccineName: z.string().min(2, "Nombre de vacuna requerido"),
  lotNumber: z.string().optional().nullable(),
  administeredAt: z.string(),
  nextDueDate: z.string(),
  notes: z.string().optional().nullable(),
});

const dewormingSchema = z.object({
  patientId: z.string().uuid(),
  productName: z.string().min(2, "Nombre de producto requerido"),
  activeIngredient: z.string().optional().nullable(),
  dosageAdministered: z.string().min(1, "Dosis requerida"),
  weightAtAdministrationKg: z.coerce.number().positive(),
  administeredAt: z.string(),
  nextDueDate: z.string(),
});

const weightSchema = z.object({
  patientId: z.string().uuid(),
  weightKg: z.coerce.number().positive("El peso debe ser mayor a 0"),
});

export async function recordVaccine(
  data: z.infer<typeof vaccineSchema>,
  branchCode: string = "central"
) {
  try {
    const validated = vaccineSchema.parse(data);
    const { tenant, branch } = await getDefaultTenantAndBranch(branchCode);
    if (!tenant || !branch) return { success: false, error: "Sede no encontrada." };

    await prisma.vaccinationRecord.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: validated.patientId,
        vaccineName: validated.vaccineName,
        lotNumber: validated.lotNumber || null,
        administeredAt: new Date(validated.administeredAt),
        nextDueDate: new Date(validated.nextDueDate),
        status: VaccineStatus.APPLIED,
        notes: validated.notes || null,
      },
    });

    revalidatePath(`/${branchCode}/pacientes/${validated.patientId}`);
    return { success: true };
  } catch (e: any) {
    console.error("Error al registrar vacuna:", e);
    return { success: false, error: "Error al guardar vacuna." };
  }
}

export async function recordDeworming(
  data: z.infer<typeof dewormingSchema>,
  branchCode: string = "central"
) {
  try {
    const validated = dewormingSchema.parse(data);
    const { tenant, branch } = await getDefaultTenantAndBranch(branchCode);
    if (!tenant || !branch) return { success: false, error: "Sede no encontrada." };

    const fullName = validated.activeIngredient
      ? `${validated.productName} (${validated.activeIngredient})`
      : validated.productName;

    await prisma.dewormingRecord.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: validated.patientId,
        productName: fullName,
        type: "INTERNAL",
        administeredAt: new Date(validated.administeredAt),
        nextDueDate: new Date(validated.nextDueDate),
      },
    });

    revalidatePath(`/${branchCode}/pacientes/${validated.patientId}`);
    return { success: true };
  } catch (e: any) {
    console.error("Error al registrar desparasitación:", e);
    return { success: false, error: "Error al guardar desparasitación." };
  }
}

export async function recordWeight(
  data: z.infer<typeof weightSchema>,
  branchCode: string = "central"
) {
  try {
    const validated = weightSchema.parse(data);
    const { tenant, branch } = await getDefaultTenantAndBranch(branchCode);
    if (!tenant) return { success: false, error: "Tenant no encontrado." };

    await prisma.patientWeightHistory.create({
      data: {
        tenantId: tenant.id,
        branchId: branch?.id || null,
        patientId: validated.patientId,
        weightKg: validated.weightKg,
      },
    });

    revalidatePath(`/${branchCode}/pacientes/${validated.patientId}`);
    return { success: true };
  } catch (e: any) {
    console.error("Error al registrar peso:", e);
    return { success: false, error: "Error al guardar peso." };
  }
}
