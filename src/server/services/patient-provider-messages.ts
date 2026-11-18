import { NOTIFICATION_TYPES, ROLES } from "@/lib/constants";
import { prisma } from "../db";
import { adminOrganizationIds } from "../authz";
import type { CurrentUser } from "../session";

export async function patientLinkedToProvider(userId: string, careProviderId: string) {
  const link = await prisma.userCareProvider.findUnique({
    where: { userId_careProviderId: { userId, careProviderId } },
  });
  return !!link;
}

export type CareTeamChatThread = {
  patientId: string;
  patientName: string;
  careProviderId: string;
  physicianName: string;
  specialty: string;
  organizationName: string;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
};

export type CreatableCareTeamContact = {
  patientId: string;
  patientName: string;
  careProviderId: string;
  physicianName: string;
  organizationName: string;
};

export async function listAdminCareTeamThreads(user: CurrentUser): Promise<CareTeamChatThread[]> {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) return [];

  const rows = await prisma.patientProviderMessage.findMany({
    where: { careProvider: { organizationId: { in: orgIds } } },
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { id: true, name: true } },
      careProvider: {
        select: {
          id: true,
          name: true,
          specialty: true,
          organization: { select: { name: true } },
        },
      },
    },
  });

  const byKey = new Map<string, CareTeamChatThread>();
  for (const row of rows) {
    const key = `${row.patientId}:${row.careProviderId}`;
    if (byKey.has(key)) continue;
    byKey.set(key, {
      patientId: row.patient.id,
      patientName: row.patient.name,
      careProviderId: row.careProvider.id,
      physicianName: row.careProvider.name,
      specialty: row.careProvider.specialty,
      organizationName: row.careProvider.organization.name,
      lastMessageAt: row.createdAt,
      lastMessagePreview: row.body.slice(0, 120),
    });
  }

  const threads = [...byKey.values()];
  threads.sort((a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0));
  return threads;
}

export async function listCreatableCareTeamContacts(user: CurrentUser): Promise<CreatableCareTeamContact[]> {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) return [];

  const links = await prisma.userCareProvider.findMany({
    where: { careProvider: { organizationId: { in: orgIds } } },
    include: {
      user: { select: { id: true, name: true } },
      careProvider: {
        select: { id: true, name: true, organization: { select: { name: true } } },
      },
    },
    orderBy: [{ user: { name: "asc" } }, { careProvider: { name: "asc" } }],
  });

  return links.map((l) => ({
    patientId: l.user.id,
    patientName: l.user.name,
    careProviderId: l.careProvider.id,
    physicianName: l.careProvider.name,
    organizationName: l.careProvider.organization.name,
  }));
}

export async function listPatientProviderMessages(
  user: CurrentUser,
  careProviderId: string,
  patientId?: string,
) {
  const provider = await prisma.careProvider.findUnique({
    where: { id: careProviderId },
    select: { id: true, name: true, organizationId: true },
  });
  if (!provider) return null;

  if (user.role === ROLES.SUBMITTER) {
    if (!(await patientLinkedToProvider(user.id, careProviderId))) return null;
    const messages = await prisma.patientProviderMessage.findMany({
      where: { patientId: user.id, careProviderId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    return messages.map((m) => ({
      ...m,
      displayName: m.senderId === user.id ? user.name : provider.name,
    }));
  }

  if (user.role === ROLES.ADMIN) {
    const orgIds = adminOrganizationIds(user);
    if (!orgIds.includes(provider.organizationId) || !patientId) return null;

    const linked = await patientLinkedToProvider(patientId, careProviderId);
    if (!linked) return null;

    const messages = await prisma.patientProviderMessage.findMany({
      where: { patientId, careProviderId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        patient: { select: { id: true, name: true } },
      },
    });
    return messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      sender: m.sender,
      displayName: m.sender.role === ROLES.SUBMITTER ? m.patient.name : provider.name,
    }));
  }

  return null;
}

export async function sendPatientProviderMessage(
  user: CurrentUser,
  careProviderId: string,
  body: string,
  patientIdForAdmin?: string,
) {
  const text = body.trim();
  if (!text) return { error: "Message cannot be empty" as const };

  const provider = await prisma.careProvider.findUnique({
    where: { id: careProviderId },
    select: { id: true, name: true, organizationId: true },
  });
  if (!provider) return { error: "Physician not found" as const };

  if (user.role === ROLES.SUBMITTER) {
    if (!(await patientLinkedToProvider(user.id, careProviderId))) {
      return { error: "Physician is not on your care team" as const };
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.patientProviderMessage.create({
        data: {
          patientId: user.id,
          careProviderId,
          senderId: user.id,
          body: text,
        },
        include: { sender: { select: { id: true, name: true, role: true } } },
      });

      const admins = await tx.organizationMembership.findMany({
        where: { organizationId: provider.organizationId },
        select: { userId: true },
      });
      for (const admin of admins) {
        if (admin.userId === user.id) continue;
        await tx.notification.create({
          data: {
            userId: admin.userId,
            type: NOTIFICATION_TYPES.NEW_MESSAGE,
            text: `New message from ${user.name} to ${provider.name}`,
            careProviderId,
            patientId: user.id,
          },
        });
      }

      return created;
    });

    return {
      message: {
        ...message,
        displayName: user.name,
      },
    };
  }

  if (user.role === ROLES.ADMIN) {
    const orgIds = adminOrganizationIds(user);
    if (!orgIds.includes(provider.organizationId)) {
      return { error: "Organization not assigned" as const };
    }

    const patientId = patientIdForAdmin?.trim();
    if (!patientId) {
      return { error: "patientId is required" as const };
    }
    if (!(await patientLinkedToProvider(patientId, careProviderId))) {
      return { error: "Patient is not linked to this physician" as const };
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.patientProviderMessage.create({
        data: {
          patientId,
          careProviderId,
          senderId: user.id,
          body: text,
        },
        include: { sender: { select: { id: true, name: true, role: true } } },
      });

      await tx.notification.create({
        data: {
          userId: patientId,
          type: NOTIFICATION_TYPES.NEW_MESSAGE,
          text: `New message from ${provider.name}`,
          careProviderId,
          patientId,
        },
      });

      return created;
    });

    return {
      message: {
        ...message,
        displayName: provider.name,
      },
    };
  }

  return { error: "Cannot send message" as const };
}