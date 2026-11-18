import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getSessionTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          memberships: { include: { organization: true } },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
