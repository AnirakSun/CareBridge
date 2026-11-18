import { SUBMISSION_STATUSES } from "@/lib/constants";
import { prisma } from "../db";
import { adminOrganizationIds } from "../authz";
import type { CurrentUser } from "../session";

export type AdminPatientSummary = {
  id: string;
  name: string;
  email: string;
  total: number;
  inQueue: number;
  submitted: number;
  underReview: number;
  needsInfo: number;
};

function tallyStatus(status: string) {
  return {
    inQueue: status !== SUBMISSION_STATUSES.COMPLETED,
    submitted: status === SUBMISSION_STATUSES.SUBMITTED,
    underReview: status === SUBMISSION_STATUSES.UNDER_REVIEW,
    needsInfo: status === SUBMISSION_STATUSES.ADDITIONAL_INFO,
  };
}

export async function listAdminPatients(user: CurrentUser): Promise<AdminPatientSummary[]> {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) return [];

  const submissions = await prisma.submission.findMany({
    where: { organizationId: { in: orgIds } },
    select: {
      status: true,
      submitter: { select: { id: true, name: true, email: true } },
    },
  });

  const map = new Map<string, AdminPatientSummary>();

  for (const s of submissions) {
    const p = s.submitter;
    const existing = map.get(p.id) ?? {
      id: p.id,
      name: p.name,
      email: p.email,
      total: 0,
      inQueue: 0,
      submitted: 0,
      underReview: 0,
      needsInfo: 0,
    };
    const flags = tallyStatus(s.status);
    existing.total += 1;
    if (flags.inQueue) existing.inQueue += 1;
    if (flags.submitted) existing.submitted += 1;
    if (flags.underReview) existing.underReview += 1;
    if (flags.needsInfo) existing.needsInfo += 1;
    map.set(p.id, existing);
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAdminPatientDetail(user: CurrentUser, patientId: string) {
  const orgIds = adminOrganizationIds(user);
  if (orgIds.length === 0) return null;

  const patient = await prisma.user.findFirst({
    where: { id: patientId, role: "SUBMITTER" },
    select: { id: true, name: true, email: true, phone: true, city: true, state: true },
  });
  if (!patient) return null;

  const submissions = await prisma.submission.findMany({
    where: { submitterId: patientId, organizationId: { in: orgIds } },
    include: { organization: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  if (submissions.length === 0) return null;

  const inQueue = submissions.filter((s) => s.status !== SUBMISSION_STATUSES.COMPLETED);
  const submitted = submissions.filter((s) => s.status === SUBMISSION_STATUSES.SUBMITTED);
  const underReview = submissions.filter((s) => s.status === SUBMISSION_STATUSES.UNDER_REVIEW);
  const needsInfo = submissions.filter((s) => s.status === SUBMISSION_STATUSES.ADDITIONAL_INFO);

  return { patient, inQueue, submitted, underReview, needsInfo };
}