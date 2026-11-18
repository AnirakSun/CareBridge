"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLES, SESSION_COOKIE, SESSION_DAYS } from "@/lib/constants";
import { loginSchema, registerSchema } from "@/lib/validation";
import { prisma } from "./db";
import { createSession, deleteSessionByToken, getSessionTokenFromCookies } from "./session";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return null;
  }
  entry.count += 1;
  if (entry.count > 10) {
    return "Too many login attempts. Try again later.";
  }
  return null;
}

async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: ROLES.SUBMITTER,
    },
  });

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);
  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase();
  const limited = checkRateLimit(email);
  if (limited) return { error: limited };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  const accountType = formData.get("accountType");
  if (accountType === "patient" && user.role !== ROLES.SUBMITTER) {
    return {
      error:
        "This account is for providers. Please use the Provider / physician sign-in section.",
    };
  }
  if (accountType === "provider" && user.role !== ROLES.ADMIN) {
    return {
      error: "This account is for patients. Please use the Patient / user sign-in section.",
    };
  }

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);

  if (user.role === ROLES.ADMIN) {
    redirect("/admin");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const token = await getSessionTokenFromCookies();
  if (token) {
    await deleteSessionByToken(token);
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
