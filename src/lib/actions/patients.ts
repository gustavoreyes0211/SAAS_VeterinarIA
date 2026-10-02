"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultTenantAndBranch } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AnimalGender, TemperamentAlertType } from "@prisma/client";

const patientSchema = z.object({
  clientId: z.string().uuid("Seleccione un tutor válido"),
  name: z.string().min(1, "El nombre de la mascota es obligatorio"),
  species: z.string().default("CANINE"),
  breedId: z.string().optional().nullable(),
  breed: z.string().optional().nullable(),
  gender: z.nativeEnum(AnimalGender).default(AnimalGender.UNKNOWN),
  birthDate: z.string().optional().nullable(),
  estimatedAgeMonths: z.coerce.number().optional().nullable(),
  microchipNumber: z.string().optional().nullable(),
  tattooNumber: z.string().optional().nullable(),
  coatColor: z.string().optional().nullable(),
  distinctiveMarkings: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  temperamentAlert: z.nativeEnum(TemperamentAlertType).default(TemperamentAlertType.FRIENDLY),
  knownAllergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  initialWeightKg: z.coerce.number().positive("El peso debe ser mayor a 0").optional().nullable(),
});

export type CreatePatientInput = z.infer<typeof patientSchema>;

export async function getBreeds(species?: string) {
  return await prisma.breed.findMany({
    where: species ? { species } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getPatients(params?: {
  search?: string;
  species?: string;
  branchCode?: string;
}) {
  const { tenant } = await getDefaultTenantAndBranch(params?.branchCode);
  if (!tenant) return [];

  const whereClause: any = {
    tenantId: tenant.id,
    isActive: true,
  };

  if (params?.species && params.species !== "ALL") {
    whereClause.species = params.species;
  }

  if (params?.search && params.search.trim().length > 0) {
    const q = params.search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { microchipNumber: { contains: q } },
      { breed: { contains: q, mode: "insensitive" } },
      {
        client: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phoneE164: { contains: q } },
          ],
        },
      },
    ];
  }

  return await prisma.patient.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneE164: true,
          email: true,
        },
      },
      breedRelation: true,
      weightHistories: {
        orderBy: { recordedAt: "desc" },
        take: 2,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPatientById(id: string) {
  return await prisma.patient.findUnique({
    where: { id },
    include: {
      client: true,
      breedRelation: true,
      coOwners: {
        include: {
          client: true,
        },
      },
      weightHistories: {
        orderBy: { recordedAt: "desc" },
      },
      vaccinations: {
        orderBy: { administeredAt: "desc" },
      },
      dewormings: {
        orderBy: { administeredAt: "desc" },
      },
      antiparasitics: {
        orderBy: { administeredAt: "desc" },
      },
      consultations: {
        include: {
          veterinarian: {
            select: { id: true, fullName: true, professionalLicense: true },
          },
          room: true,
          addendums: true,
        },
        orderBy: { consultationDate: "desc" },
      },
      prescriptions: {
        include: {
          items: true,
          veterinarian: {
            select: { id: true, fullName: true, professionalLicense: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      hospitalizations: {
        orderBy: { admissionDate: "desc" },
        take: 3,
      },
    },
  });
}

export async function createPatient(data: CreatePatientInput, branchCode: string = "central") {
  try {
    const validated = patientSchema.parse(data);
    const { tenant, branch } = await getDefaultTenantAndBranch(branchCode);

    if (!tenant) {
      return { success: false, error: "Inquilino no encontrado." };
    }

    // Verificar si el microchip ya existe
    if (validated.microchipNumber && validated.microchipNumber.trim().length > 0) {
      const existingChip = await prisma.patient.findFirst({
        where: {
          tenantId: tenant.id,
          microchipNumber: validated.microchipNumber.trim(),
        },
      });
      if (existingChip) {
        return {
          success: false,
          error: `Ya existe un paciente con el Microchip ${validated.microchipNumber}.`,
        };
      }
    }

    const birthDateObj = validated.birthDate ? new Date(validated.birthDate) : null;

    const patient = await prisma.$transaction(async (tx) => {
      const newPatient = await tx.patient.create({
        data: {
          tenantId: tenant.id,
          clientId: validated.clientId,
          breedId: validated.breedId || null,
          name: validated.name.trim(),
          species: validated.species,
          breed: validated.breed?.trim() || null,
          gender: validated.gender,
          birthDate: birthDateObj,
          estimatedAgeMonths: validated.estimatedAgeMonths || null,
          microchipNumber: validated.microchipNumber?.trim() || null,
          tattooNumber: validated.tattooNumber?.trim() || null,
          coatColor: validated.coatColor?.trim() || null,
          distinctiveMarkings: validated.distinctiveMarkings?.trim() || null,
          bloodType: validated.bloodType?.trim() || null,
          temperamentAlert: validated.temperamentAlert,
          knownAllergies: validated.knownAllergies,
          chronicConditions: validated.chronicConditions,
        },
      });

      // Si se ingresó peso inicial, registrar en el historial de peso
      if (validated.initialWeightKg && validated.initialWeightKg > 0) {
        await tx.patientWeightHistory.create({
          data: {
            tenantId: tenant.id,
            patientId: newPatient.id,
            branchId: branch?.id || null,
            weightKg: validated.initialWeightKg,
          },
        });
      }

      return newPatient;
    });

    revalidatePath(`/${branchCode}/pacientes`);
    revalidatePath(`/${branchCode}/clientes/${validated.clientId}`);

    return { success: true, patient };
  } catch (error: any) {
    console.error("Error al registrar paciente:", error);
    if (error instanceof z.ZodError) {
      const msg = (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Datos no válidos.";
      return { success: false, error: msg };
    }
    return { success: false, error: "Error de servidor al guardar paciente." };
  }
}
