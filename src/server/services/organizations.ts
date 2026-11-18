import { prisma } from "../db";

export async function listActiveOrganizations(search?: string) {
  const q = search?.trim();
  return prisma.organization.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { city: { contains: q } },
              { state: { contains: q } },
              { type: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getOrganizationById(id: string) {
  return prisma.organization.findFirst({ where: { id, isActive: true } });
}

export type OrganizationWithProfile = NonNullable<
  Awaited<ReturnType<typeof getOrganizationBySlug>>
>;

export async function getOrganizationBySlug(slug: string) {
  const normalized = decodeURIComponent(slug).trim();

  try {
    return await prisma.organization.findFirst({
      where: { slug: normalized, isActive: true },
      include: {
        facilities: { orderBy: { sortOrder: "asc" } },
        specialties: { orderBy: { sortOrder: "asc" } },
        providers: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch (error) {
    console.error("[getOrganizationBySlug]", error);
    const org = await prisma.organization.findFirst({
      where: { slug: normalized, isActive: true },
    });
    if (!org) return null;
    return {
      ...org,
      facilities: [],
      specialties: [],
      providers: [],
    };
  }
}
