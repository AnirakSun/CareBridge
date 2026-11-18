import { prisma } from "../db";
import type { CurrentUser } from "../session";

export type PatientPhysicianThread = {
  careProviderId: string;
  physicianName: string;
  specialty: string;
  organizationName: string;
  lastMessagePreview: string | null;
  lastMessageAt: Date | null;
};

export async function listPatientChatOverview(user: CurrentUser) {
  const physicians = await prisma.userCareProvider.findMany({
    where: { userId: user.id },
    include: {
      careProvider: {
        include: {
          organization: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const dmRows = await prisma.patientProviderMessage.findMany({
    where: { patientId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      careProvider: {
        select: { id: true, name: true, specialty: true, organization: { select: { name: true } } },
      },
    },
  });

  const physicianThreads: PatientPhysicianThread[] = [];
  const seenProviders = new Set<string>();
  for (const row of dmRows) {
    if (seenProviders.has(row.careProviderId)) continue;
    seenProviders.add(row.careProviderId);
    physicianThreads.push({
      careProviderId: row.careProviderId,
      physicianName: row.careProvider.name,
      specialty: row.careProvider.specialty,
      organizationName: row.careProvider.organization.name,
      lastMessagePreview: row.body.slice(0, 120),
      lastMessageAt: row.createdAt,
    });
  }

  const submissionThreads = await prisma.submission.findMany({
    where: { submitterId: user.id, messages: { some: {} } },
    include: {
      organization: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    physicians: physicians.map((p) => ({
      careProviderId: p.careProviderId,
      name: p.careProvider.name,
      title: p.careProvider.title,
      specialty: p.careProvider.specialty,
      email: p.careProvider.email,
      phone: p.careProvider.phone,
      photoUrl: p.careProvider.photoUrl,
      organization: p.careProvider.organization,
    })),
    physicianThreads,
    submissionThreads: submissionThreads.map((s) => {
      const last = s.messages[0];
      return {
        submissionId: s.id,
        referenceId: s.referenceId,
        title: s.title,
        status: s.status,
        organizationName: s.organization.name,
        lastMessagePreview: last ? last.body.slice(0, 120) : null,
        lastMessageAt: last?.createdAt ?? null,
      };
    }),
  };
}