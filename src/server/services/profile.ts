import {
  DEVICE_CONNECTION_STATUS,
  HEALTH_DEVICE_LABELS,
  type HealthDeviceType,
} from "@/lib/constants";
import { prisma } from "../db";
import type { CurrentUser } from "../session";

const profileSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  streetAddress: true,
  addressLine2: true,
  city: true,
  state: true,
  zipCode: true,
  connectedDevices: { orderBy: { connectedAt: "desc" as const } },
  insurances: { orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }, { createdAt: "asc" as const }] },
};

export async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
}

export async function updateProfile(
  userId: string,
  data: {
    name: string;
    phone?: string;
    streetAddress?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone ?? null,
      streetAddress: data.streetAddress ?? null,
      addressLine2: data.addressLine2 ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zipCode: data.zipCode ?? null,
    },
    select: profileSelect,
  });
}

export async function createInsurance(
  userId: string,
  data: {
    providerName: string;
    planName?: string;
    memberId?: string;
    groupNumber?: string;
    isPrimary?: boolean;
  },
) {
  if (data.isPrimary) {
    await prisma.userInsurance.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });
  }
  const count = await prisma.userInsurance.count({ where: { userId } });
  return prisma.userInsurance.create({
    data: {
      userId,
      providerName: data.providerName,
      planName: data.planName ?? null,
      memberId: data.memberId ?? null,
      groupNumber: data.groupNumber ?? null,
      isPrimary: data.isPrimary ?? count === 0,
      sortOrder: count,
    },
  });
}

export async function deleteInsurance(userId: string, insuranceId: string) {
  const row = await prisma.userInsurance.findFirst({
    where: { id: insuranceId, userId },
  });
  if (!row) return null;
  await prisma.userInsurance.delete({ where: { id: insuranceId } });
  return { ok: true as const };
}

export async function setPrimaryInsurance(userId: string, insuranceId: string) {
  const row = await prisma.userInsurance.findFirst({
    where: { id: insuranceId, userId },
  });
  if (!row) return null;
  await prisma.$transaction([
    prisma.userInsurance.updateMany({ where: { userId }, data: { isPrimary: false } }),
    prisma.userInsurance.update({ where: { id: insuranceId }, data: { isPrimary: true } }),
  ]);
  return { ok: true as const };
}

export async function connectDevice(userId: string, deviceType: HealthDeviceType) {
  const displayName = HEALTH_DEVICE_LABELS[deviceType];
  const now = new Date();

  return prisma.connectedHealthDevice.upsert({
    where: {
      userId_deviceType: { userId, deviceType },
    },
    create: {
      userId,
      deviceType,
      displayName,
      status: DEVICE_CONNECTION_STATUS.CONNECTED,
      connectedAt: now,
      lastSyncAt: now,
    },
    update: {
      status: DEVICE_CONNECTION_STATUS.CONNECTED,
      displayName,
      connectedAt: now,
      lastSyncAt: now,
    },
  });
}

export async function disconnectDevice(user: CurrentUser, deviceId: string) {
  const device = await prisma.connectedHealthDevice.findFirst({
    where: { id: deviceId, userId: user.id },
  });
  if (!device) return null;

  return prisma.connectedHealthDevice.update({
    where: { id: deviceId },
    data: { status: DEVICE_CONNECTION_STATUS.DISCONNECTED, lastSyncAt: new Date() },
  });
}

export async function listActiveDevices(userId: string) {
  return prisma.connectedHealthDevice.findMany({
    where: {
      userId,
      status: DEVICE_CONNECTION_STATUS.CONNECTED,
    },
    orderBy: { displayName: "asc" },
  });
}