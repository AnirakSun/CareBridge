import { MESSAGE_KINDS, NOTIFICATION_TYPES } from "@/lib/constants";
import { prisma } from "../db";
import { canMessage } from "../authz";
import type { CurrentUser } from "../session";

export async function listMessages(user: CurrentUser, submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!submission || !canMessage(user, submission)) {
    return null;
  }

  return submission.messages;
}

export async function createMessage(
  user: CurrentUser,
  submissionId: string,
  body: string,
  kind: string = MESSAGE_KINDS.MESSAGE,
) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || !canMessage(user, submission)) {
    return null;
  }

  if (user.role === "SUBMITTER" && kind !== MESSAGE_KINDS.MESSAGE) {
    kind = MESSAGE_KINDS.MESSAGE;
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        submissionId,
        senderId: user.id,
        body,
        kind,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });

    if (user.id === submission.submitterId) {
      const admins = await tx.organizationMembership.findMany({
        where: { organizationId: submission.organizationId },
        select: { userId: true },
      });
      for (const admin of admins) {
        if (admin.userId === user.id) continue;
        await tx.notification.create({
          data: {
            userId: admin.userId,
            submissionId,
            type: NOTIFICATION_TYPES.NEW_MESSAGE,
            text: `New message on submission ${submission.referenceId}`,
          },
        });
      }
    } else {
      await tx.notification.create({
        data: {
          userId: submission.submitterId,
          submissionId,
          type: NOTIFICATION_TYPES.NEW_MESSAGE,
          text: `New message on submission ${submission.referenceId}`,
        },
      });
    }

    return created;
  });

  return message;
}

export async function markSubmissionRead(user: CurrentUser, submissionId: string) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission || !canMessage(user, submission)) {
    return null;
  }

  await prisma.submissionRead.upsert({
    where: {
      userId_submissionId: { userId: user.id, submissionId },
    },
    create: { userId: user.id, submissionId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });

  return true;
}
