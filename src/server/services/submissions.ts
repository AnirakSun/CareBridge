import { NOTIFICATION_TYPES, SUBMISSION_STATUSES } from "@/lib/constants";
import { prisma } from "../db";
import { adminOrganizationIds, canManageSubmission, canViewSubmission } from "../authz";
import type { CurrentUser } from "../session";
import { assertTransition } from "./status-transitions";
import { listActiveDevices } from "./profile";
import { deleteStoredFile, validateAndStoreFile } from "../storage";

async function nextReferenceId() {
  const count = await prisma.submission.count();
  return `CB-${String(count + 1).padStart(6, "0")}`;
}

export async function listSubmitterSubmissions(user: CurrentUser) {
  return prisma.submission.findMany({
    where: { submitterId: user.id },
    include: {
      organization: true,
      documents: true,
      messages: { select: { id: true, createdAt: true, senderId: true } },
      reads: { where: { userId: user.id } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAdminSubmissions(
  user: CurrentUser,
  params: { q?: string; status?: string },
) {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) return [];

  const where: {
    organizationId: { in: string[] };
    status?: string;
    OR?: Array<{ title: { contains: string } } | { referenceId: { contains: string } }>;
  } = {
    organizationId: { in: orgIds },
  };

  if (params.status) {
    where.status = params.status;
  }

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [{ title: { contains: q } }, { referenceId: { contains: q } }];
  }

  return prisma.submission.findMany({
    where,
    include: {
      submitter: { select: { id: true, name: true, email: true } },
      organization: true,
      documents: true,
      reads: { where: { userId: user.id } },
      messages: { select: { id: true, createdAt: true, senderId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubmissionForUser(user: CurrentUser, id: string) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      submitter: { select: { id: true, name: true, email: true } },
      organization: true,
      documents: { orderBy: { createdAt: "asc" } },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { changedBy: { select: { name: true, role: true } } },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!submission || !canViewSubmission(user, submission)) {
    return null;
  }

  return submission;
}

export async function createSubmissionWithFiles(
  user: CurrentUser,
  metadata: {
    title: string;
    category: string;
    description: string;
    recipientName: string;
    organizationId: string;
  },
  files: File[],
) {
  const org = await prisma.organization.findFirst({
    where: { id: metadata.organizationId, isActive: true },
  });
  if (!org) {
    throw new Error("Organization not found");
  }

  const stored: Awaited<ReturnType<typeof validateAndStoreFile>>[] = [];
  for (const file of files) {
    const result = await validateAndStoreFile(file);
    if (!result.ok) {
      for (const s of stored) {
        if (s.ok) await deleteStoredFile(s.storageKey);
      }
      throw new Error(result.message);
    }
    stored.push(result);
  }

  const devices = await listActiveDevices(user.id);
  const deviceContext =
    devices.length > 0
      ? `Linked wearables at upload: ${devices.map((d) => d.displayName).join(", ")}`
      : null;

  try {
    const referenceId = await nextReferenceId();
    const submission = await prisma.$transaction(async (tx) => {
      const created = await tx.submission.create({
        data: {
          referenceId,
          title: metadata.title,
          category: metadata.category,
          description: metadata.description,
          recipientName: metadata.recipientName,
          status: SUBMISSION_STATUSES.SUBMITTED,
          submitterId: user.id,
          organizationId: org.id,
          deviceContext,
        },
      });

      for (const doc of stored) {
        if (!doc.ok) continue;
        await tx.document.create({
          data: {
            submissionId: created.id,
            uploadedById: user.id,
            originalName: doc.originalName,
            storageKey: doc.storageKey,
            mimeType: doc.mimeType,
            sizeBytes: doc.sizeBytes,
            sha256: doc.sha256,
          },
        });
      }

      await tx.statusHistory.create({
        data: {
          submissionId: created.id,
          fromStatus: null,
          toStatus: SUBMISSION_STATUSES.SUBMITTED,
          note: "Submission received",
          changedById: user.id,
        },
      });

      const admins = await tx.organizationMembership.findMany({
        where: { organizationId: org.id },
        select: { userId: true },
      });

      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.userId,
            submissionId: created.id,
            type: NOTIFICATION_TYPES.NEW_SUBMISSION,
            text: `New submission ${referenceId}: ${metadata.title}`,
          },
        });
      }

      return created;
    });

    return submission;
  } catch (err) {
    for (const s of stored) {
      if (s.ok) await deleteStoredFile(s.storageKey);
    }
    throw err;
  }
}

export async function addDocumentsToSubmission(
  user: CurrentUser,
  submissionId: string,
  files: File[],
) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.submitterId !== user.id) {
    return null;
  }

  if (submission.status !== SUBMISSION_STATUSES.ADDITIONAL_INFO) {
    throw new Error("Additional documents can only be uploaded when more information is requested");
  }

  const stored: Awaited<ReturnType<typeof validateAndStoreFile>>[] = [];
  for (const file of files) {
    const result = await validateAndStoreFile(file);
    if (!result.ok) {
      for (const s of stored) {
        if (s.ok) await deleteStoredFile(s.storageKey);
      }
      throw new Error(result.message);
    }
    stored.push(result);
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const doc of stored) {
        if (!doc.ok) continue;
        await tx.document.create({
          data: {
            submissionId,
            uploadedById: user.id,
            originalName: doc.originalName,
            storageKey: doc.storageKey,
            mimeType: doc.mimeType,
            sizeBytes: doc.sizeBytes,
            sha256: doc.sha256,
          },
        });
      }
    });
    return true;
  } catch (err) {
    for (const s of stored) {
      if (s.ok) await deleteStoredFile(s.storageKey);
    }
    throw err;
  }
}

export async function updateSubmissionStatus(
  user: CurrentUser,
  submissionId: string,
  status: string,
  note?: string,
) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || !canManageSubmission(user, submission)) {
    return null;
  }

  assertTransition(submission.status, status as typeof SUBMISSION_STATUSES[keyof typeof SUBMISSION_STATUSES]);

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.submission.update({
      where: { id: submissionId },
      data: { status },
    });

    await tx.statusHistory.create({
      data: {
        submissionId,
        fromStatus: submission.status,
        toStatus: status,
        note: note ?? null,
        changedById: user.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: submission.submitterId,
        submissionId,
        type: NOTIFICATION_TYPES.STATUS_CHANGED,
        text: `Submission ${submission.referenceId} status updated to ${status}`,
      },
    });

    return row;
  });

  return updated;
}

export function countUnreadMessages(
  submission: {
    messages: { createdAt: Date; senderId: string }[];
    reads: { lastReadAt: Date }[];
  },
  userId: string,
) {
  const lastRead = submission.reads[0]?.lastReadAt ?? new Date(0);
  return submission.messages.filter(
    (m) => m.senderId !== userId && m.createdAt > lastRead,
  ).length;
}
