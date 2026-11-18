import { prisma } from "../db";
import type { CurrentUser } from "../session";

export async function getLinkedOrganizationIds(userId: string) {
  const [memberships, submissionOrgs] = await Promise.all([
    prisma.organizationMembership.findMany({
      where: { userId },
      select: { organizationId: true },
    }),
    prisma.submission.findMany({
      where: { submitterId: userId },
      distinct: ["organizationId"],
      select: { organizationId: true },
    }),
  ]);

  return [...new Set([...memberships.map((m) => m.organizationId), ...submissionOrgs.map((s) => s.organizationId)])];
}

async function userCanLinkToOrganization(userId: string, organizationId: string) {
  const linked = await getLinkedOrganizationIds(userId);
  return linked.includes(organizationId);
}

export async function getMyOrganizationsView(userId: string) {
  const [memberships, physicians, allOrgs, linkedOrgIds] = await Promise.all([
    prisma.organizationMembership.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { organization: { name: "asc" } },
    }),
    prisma.userCareProvider.findMany({
      where: { userId },
      include: {
        careProvider: {
          include: {
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, city: true, state: true },
      orderBy: { name: "asc" },
    }),
    getLinkedOrganizationIds(userId),
  ]);

  const membershipByOrgId = new Map(memberships.map((m) => [m.organizationId, m]));
  const linkedIdSet = new Set(linkedOrgIds);
  const linkedOrgs = await prisma.organization.findMany({
    where: { id: { in: linkedOrgIds }, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      city: true,
      state: true,
    },
    orderBy: { name: "asc" },
  });

  return {
    organizations: linkedOrgs.map((organization) => {
      const membership = membershipByOrgId.get(organization.id);
      return {
        membershipId: membership?.id ?? null,
        viaSubmissionOnly: !membership,
        organization,
      };
    }),
    physicians: physicians.map((p) => ({
      id: p.id,
      provider: {
        id: p.careProvider.id,
        name: p.careProvider.name,
        title: p.careProvider.title,
        specialty: p.careProvider.specialty,
        email: p.careProvider.email,
        phone: p.careProvider.phone,
        department: p.careProvider.department,
        organization: p.careProvider.organization,
      },
    })),
    availableOrganizations: allOrgs.filter((o) => !linkedIdSet.has(o.id)),
    linkedOrganizationIds: linkedOrgIds,
  };
}

export async function getProvidersForOrganization(user: CurrentUser, organizationId: string) {
  const canAccess = await userCanLinkToOrganization(user.id, organizationId);
  const isMember = await prisma.organizationMembership.findFirst({
    where: { userId: user.id, organizationId },
  });
  if (!canAccess && !isMember) {
    return null;
  }

  return prisma.careProvider.findMany({
    where: { organizationId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      title: true,
      specialty: true,
      email: true,
      phone: true,
      department: true,
    },
  });
}

export async function addOrganizationLink(userId: string, organizationId: string) {
  const org = await prisma.organization.findFirst({ where: { id: organizationId, isActive: true } });
  if (!org) return { error: "Organization not found" as const };

  await prisma.organizationMembership.upsert({
    where: { userId_organizationId: { userId, organizationId } },
    create: { userId, organizationId },
    update: {},
  });

  return { ok: true as const };
}

export async function removeOrganizationLink(userId: string, organizationId: string) {
  await prisma.organizationMembership.deleteMany({ where: { userId, organizationId } });
  const teamIds = await prisma.userCareProvider.findMany({
    where: { userId, careProvider: { organizationId } },
    select: { id: true },
  });
  if (teamIds.length > 0) {
    await prisma.userCareProvider.deleteMany({
      where: { id: { in: teamIds.map((t) => t.id) } },
    });
  }
  return { ok: true as const };
}

export async function addPhysicianLink(userId: string, careProviderId: string) {
  const provider = await prisma.careProvider.findUnique({
    where: { id: careProviderId },
    include: { organization: true },
  });
  if (!provider) return { error: "Physician not found" as const };

  const isLinked = await userCanLinkToOrganization(userId, provider.organizationId);
  const isMember = await prisma.organizationMembership.findFirst({
    where: { userId, organizationId: provider.organizationId },
  });
  if (!isLinked && !isMember) {
    return { error: "Link this organization before adding physicians from it" as const };
  }

  await prisma.userCareProvider.upsert({
    where: { userId_careProviderId: { userId, careProviderId } },
    create: { userId, careProviderId },
    update: {},
  });

  return { ok: true as const };
}

export async function removePhysicianLink(userId: string, careProviderId: string) {
  await prisma.userCareProvider.deleteMany({ where: { userId, careProviderId } });
  return { ok: true as const };
}