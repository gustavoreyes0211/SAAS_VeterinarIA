"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultTenantAndBranch } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ClientCategoryTag, ClientTaxType } from "@prisma/client";

const clientSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  taxType: z.nativeEnum(ClientTaxType).default(ClientTaxType.CONSUMIDOR_FINAL),
  category: z.nativeEnum(ClientCategoryTag).default(ClientCategoryTag.STANDARD),
  dui: z.string().optional().nullable(),
  nit: z.string().optional().nullable(),
  nrc: z.string().optional().nullable(),
  tradeName: z.string().optional().nullable(),
  economicActivityCode: z.string().optional().nullable(),
  phoneE164: z.string().min(8, "El teléfono debe tener un formato válido (ej. +503 7000-0000)"),
  secondaryPhone: z.string().optional().nullable(),
  email: z.string().email("Correo electrónico no válido"),
  address: z.string().min(5, "La dirección debe ser detallada"),
  departmentCode: z.string().default("06"),
  municipalityCode: z.string().default("14"),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelationship: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().default(0),
  internalNotes: z.string().optional().nullable(),
});

export type CreateClientInput = z.infer<typeof clientSchema>;

export async function getClients(params?: {
  search?: string;
  category?: ClientCategoryTag;
  branchCode?: string;
}) {
  const { tenant } = await getDefaultTenantAndBranch(params?.branchCode);
  if (!tenant) return [];

  const whereClause: any = {
    tenantId: tenant.id,
    isActive: true,
  };

  if (params?.category) {
    whereClause.category = params.category;
  }

  if (params?.search && params.search.trim().length > 0) {
    const q = params.search.trim();
    whereClause.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phoneE164: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { dui: { contains: q } },
      { nit: { contains: q } },
      { nrc: { contains: q } },
    ];
  }

  const clients = await prisma.client.findMany({
    where: whereClause,
    include: {
      patients: {
        select: {
          id: true,
          name: true,
          species: true,
          breed: true,
          temperamentAlert: true,
          isDeceased: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return clients;
}

export async function getClientById(id: string) {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      patients: {
        include: {
          breedRelation: true,
          weightHistories: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
        },
      },
      dteInvoices: {
        orderBy: { issuedAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function createClient(data: CreateClientInput, branchCode: string = "central") {
  try {
    const validated = clientSchema.parse(data);
    const { tenant } = await getDefaultTenantAndBranch(branchCode);

    if (!tenant) {
      return { success: false, error: "No se encontró el inquilino del hospital." };
    }

    // Verificar si el DUI ya está registrado en este tenant
    if (validated.dui && validated.dui.trim().length > 0) {
      const existingDui = await prisma.client.findFirst({
        where: { tenantId: tenant.id, dui: validated.dui.trim() },
      });
      if (existingDui) {
        return { success: false, error: `Ya existe un cliente con el DUI ${validated.dui}.` };
      }
    }

    const client = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        firstName: validated.firstName.trim(),
        lastName: validated.lastName.trim(),
        taxType: validated.taxType,
        category: validated.category,
        dui: validated.dui?.trim() || null,
        nit: validated.nit?.trim() || null,
        nrc: validated.nrc?.trim() || null,
        tradeName: validated.tradeName?.trim() || null,
        economicActivityCode: validated.economicActivityCode?.trim() || null,
        phoneE164: validated.phoneE164.trim(),
        secondaryPhone: validated.secondaryPhone?.trim() || null,
        email: validated.email.trim().toLowerCase(),
        address: validated.address.trim(),
        departmentCode: validated.departmentCode,
        municipalityCode: validated.municipalityCode,
        emergencyContactName: validated.emergencyContactName?.trim() || null,
        emergencyContactPhone: validated.emergencyContactPhone?.trim() || null,
        emergencyContactRelationship: validated.emergencyContactRelationship?.trim() || null,
        creditLimit: validated.creditLimit,
        internalNotes: validated.internalNotes?.trim() || null,
      },
    });

    revalidatePath(`/${branchCode}/clientes`);
    return { success: true, client };
  } catch (error: any) {
    console.error("Error al crear cliente:", error);
    if (error instanceof z.ZodError) {
      const msg = (error as any).issues?.[0]?.message || (error as any).errors?.[0]?.message || "Datos no válidos.";
      return { success: false, error: msg };
    }
    return { success: false, error: "Error de servidor al guardar cliente." };
  }
}
