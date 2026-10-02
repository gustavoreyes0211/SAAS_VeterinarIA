import { prisma } from "@/lib/prisma";

export async function getDefaultTenantAndBranch(branchCodeOrSubdomain?: string) {
  let tenant = null;
  let branch = null;

  if (branchCodeOrSubdomain && branchCodeOrSubdomain !== "central") {
    // Intentar buscar por código de branch
    branch = await prisma.branch.findFirst({
      where: { code: branchCodeOrSubdomain },
      include: { tenant: true },
    });
    if (branch) {
      tenant = branch.tenant;
    }
  }

  if (!tenant) {
    tenant = await prisma.tenant.findUnique({
      where: { subdomain: "central" },
    });
  }

  if (!tenant) {
    tenant = await prisma.tenant.findFirst({
      orderBy: { createdAt: "asc" },
    });
  }

  if (!branch && tenant) {
    branch = await prisma.branch.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "asc" },
    });
  }

  return { tenant, branch };
}
