import { prisma } from "../db";
import { adminOrganizationIds } from "../authz";
import type { CurrentUser } from "../session";

export type PatientChatThread = {
  kind: "patient";
  submissionId: string;
  patientId: string;
  patientName: string;
  referenceId: string;
  title: string;
  status: string;
  organizationName: string;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
};

export type PhysicianChatThread = {
  kind: "physician";
  peerId: string;
  peerName: string;
  organizationId: string;
  organizationName: string;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
};

export async function listAdminChatOverview(user: CurrentUser) {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) {
    return { patientThreads: [] as PatientChatThread[], physicianThreads: [] as PhysicianChatThread[] };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      organizationId: { in: orgIds },
      messages: { some: {} },
    },
    include: {
      submitter: { select: { id: true, name: true } },
      organization: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const patientThreads: PatientChatThread[] = submissions.map((s) => {
    const last = s.messages[0];
    return {
      kind: "patient",
      submissionId: s.id,
      patientId: s.submitter.id,
      patientName: s.submitter.name,
      referenceId: s.referenceId,
      title: s.title,
      status: s.status,
      organizationName: s.organization.name,
      lastMessageAt: last?.createdAt ?? null,
      lastMessagePreview: last ? last.body.slice(0, 120) : null,
    };
  });

  const peerAdmins = await prisma.organizationMembership.findMany({
    where: {
      organizationId: { in: orgIds },
      userId: { not: user.id },
      user: { role: "ADMIN" },
    },
    include: {
      user: { select: { id: true, name: true } },
      organization: { select: { id: true, name: true } },
    },
  });

  const physicianThreads: PhysicianChatThread[] = [];
  const seen = new Set<string>();

  for (const m of peerAdmins) {
    const key = `${m.organizationId}:${m.userId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const lastStaff = await prisma.staffMessage.findFirst({
      where: {
        organizationId: m.organizationId,
        OR: [
          { senderId: user.id, recipientId: m.userId },
          { senderId: m.userId, recipientId: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lastStaff) continue;

    physicianThreads.push({
      kind: "physician",
      peerId: m.user.id,
      peerName: m.user.name,
      organizationId: m.organization.id,
      organizationName: m.organization.name,
      lastMessageAt: lastStaff.createdAt,
      lastMessagePreview: lastStaff.body.slice(0, 120),
    });
  }

  physicianThreads.sort((a, b) => {
    const ta = a.lastMessageAt?.getTime() ?? 0;
    const tb = b.lastMessageAt?.getTime() ?? 0;
    return tb - ta;
  });

  patientThreads.sort((a, b) => {
    const ta = a.lastMessageAt?.getTime() ?? 0;
    const tb = b.lastMessageAt?.getTime() ?? 0;
    return tb - ta;
  });

  return { patientThreads, physicianThreads };
}

export type CreatablePatientContact = {
  patientId: string;
  patientName: string;
  email: string;
  phone: string | null;
  submissionId: string;
  referenceId: string;
  organizationName: string;
};

export type CreatablePhysicianContact = {
  peerId: string;
  peerName: string;
  email: string;
  organizationId: string;
  organizationName: string;
};

export async function listCreatableChatContacts(user: CurrentUser) {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) {
    return {
      patients: [] as CreatablePatientContact[],
      physicians: [] as CreatablePhysicianContact[],
    };
  }

  const submissions = await prisma.submission.findMany({
    where: { organizationId: { in: orgIds } },
    include: {
      submitter: { select: { id: true, name: true, email: true, phone: true } },
      organization: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const patients: CreatablePatientContact[] = [];
  const seenPatients = new Set<string>();
  for (const s of submissions) {
    if (seenPatients.has(s.submitterId)) continue;
    seenPatients.add(s.submitterId);
    patients.push({
      patientId: s.submitter.id,
      patientName: s.submitter.name,
      email: s.submitter.email,
      phone: s.submitter.phone,
      submissionId: s.id,
      referenceId: s.referenceId,
      organizationName: s.organization.name,
    });
  }
  patients.sort((a, b) => a.patientName.localeCompare(b.patientName));

  const peerAdmins = await prisma.organizationMembership.findMany({
    where: {
      organizationId: { in: orgIds },
      userId: { not: user.id },
      user: { role: "ADMIN" },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  const physicians: CreatablePhysicianContact[] = [];
  const seenPhysicians = new Set<string>();
  for (const m of peerAdmins) {
    const key = `${m.organizationId}:${m.userId}`;
    if (seenPhysicians.has(key)) continue;
    seenPhysicians.add(key);
    physicians.push({
      peerId: m.user.id,
      peerName: m.user.name,
      email: m.user.email,
      organizationId: m.organization.id,
      organizationName: m.organization.name,
    });
  }

  return { patients, physicians };
}

export async function resolveChatParticipant(
  user: CurrentUser,
  input: { name: string; email?: string; phone?: string },
) {
  const orgIds = adminOrganizationIds(user);
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase();
  const phoneRaw = input.phone?.trim();
  if (!name) return { error: "Name is required" as const };
  if (!email && !phoneRaw) return { error: "Enter an email or phone number" as const };

  const candidates = await prisma.user.findMany({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phoneRaw ? [{ phone: phoneRaw }] : []),
      ],
    },
  });

  if (candidates.length === 0) {
    return { error: "No person found with that email or phone" as const };
  }

  const nameLower = name.toLowerCase();
  const match =
    candidates.find(
      (u) =>
        u.name.toLowerCase() === nameLower ||
        u.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(u.name.toLowerCase()),
    ) ?? candidates[0];

  if (match.role === "SUBMITTER") {
    const submission = await prisma.submission.findFirst({
      where: { submitterId: match.id, organizationId: { in: orgIds } },
      orderBy: { updatedAt: "desc" },
      include: { organization: { select: { name: true } } },
    });
    if (!submission) {
      return { error: "Patient has no submissions to your organizations" as const };
    }
    return {
      kind: "patient" as const,
      patientName: match.name,
      submissionId: submission.id,
      referenceId: submission.referenceId,
      organizationName: submission.organization.name,
    };
  }

  if (match.role === "ADMIN" && match.id !== user.id) {
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: match.id, organizationId: { in: orgIds } },
      include: { organization: { select: { id: true, name: true } } },
    });
    if (!membership) {
      return { error: "Physician is not assigned to your organizations" as const };
    }
    return {
      kind: "physician" as const,
      peerName: match.name,
      peerId: match.id,
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
    };
  }

  return { error: "Cannot start a chat with this person" as const };
}

export async function listStaffMessagesWithPeer(
  user: CurrentUser,
  peerId: string,
  organizationId: string,
) {
  const orgIds = adminOrganizationIds(user);
  if (!orgIds.includes(organizationId)) return null;

  const peerMember = await prisma.organizationMembership.findFirst({
    where: { userId: peerId, organizationId, user: { role: "ADMIN" } },
  });
  if (!peerMember) return null;

  return prisma.staffMessage.findMany({
    where: {
      organizationId,
      OR: [
        { senderId: user.id, recipientId: peerId },
        { senderId: peerId, recipientId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
    },
  });
}

export async function sendStaffMessage(
  user: CurrentUser,
  data: { peerId: string; organizationId: string; body: string },
) {
  const orgIds = adminOrganizationIds(user);
  if (!orgIds.includes(data.organizationId)) return { error: "Organization not assigned" as const };

  const peerMember = await prisma.organizationMembership.findFirst({
    where: { userId: data.peerId, organizationId: data.organizationId, user: { role: "ADMIN" } },
  });
  if (!peerMember) return { error: "Physician not found" as const };

  const body = data.body.trim();
  if (!body) return { error: "Message cannot be empty" as const };

  const message = await prisma.staffMessage.create({
    data: {
      organizationId: data.organizationId,
      senderId: user.id,
      recipientId: data.peerId,
      body,
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  return { message };
}