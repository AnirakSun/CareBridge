import { prisma } from "../db";
import type { CurrentUser } from "../session";

export async function listNotifications(user: CurrentUser, limit = 20) {
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function unreadNotificationCount(user: CurrentUser) {
  return prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });
}

export async function markNotificationsRead(user: CurrentUser, ids?: string[]) {
  if (ids?.length) {
    await prisma.notification.updateMany({
      where: { userId: user.id, id: { in: ids } },
      data: { readAt: new Date() },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
