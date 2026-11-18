import { describe, expect, it } from "vitest";
import { SUBMISSION_STATUSES } from "@/lib/constants";
import {
  listPatientProviderMessages,
  sendPatientProviderMessage,
} from "@/server/services/patient-provider-messages";
import { listSubmitterSubmissions, updateSubmissionStatus } from "@/server/services/submissions";
import { prisma } from "@/server/db";
import type { CurrentUser } from "@/server/session";

async function loadUser(email: string): Promise<CurrentUser> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { include: { organization: true } } },
  });
  if (!user) throw new Error(`Missing seeded user: ${email}`);
  return user;
}

describe("demo patient ↔ provider flows (live DB)", () => {
  it("syncs care-team chat both ways", async () => {
    const patient = await loadUser("submitter.a@carebridge.demo");
    const admin = await loadUser("admin.riverside@carebridge.demo");

    const provider = await prisma.careProvider.findFirst({
      where: {
        organization: { slug: "riverside-general" },
        name: { contains: "Morgan Ellis" },
      },
    });
    expect(provider).toBeTruthy();

    const stamp = Date.now();
    const patientBody = `Integration round-trip (patient) ${stamp}`;
    const adminBody = `Integration round-trip (provider) ${stamp}`;

    const sentPatient = await sendPatientProviderMessage(patient, provider!.id, patientBody);
    expect("error" in sentPatient).toBe(false);

    const sentAdmin = await sendPatientProviderMessage(
      admin,
      provider!.id,
      adminBody,
      patient.id,
    );
    expect("error" in sentAdmin).toBe(false);

    const patientView = await listPatientProviderMessages(patient, provider!.id);
    const adminView = await listPatientProviderMessages(admin, provider!.id, patient.id);

    expect(patientView?.some((m) => m.body === patientBody)).toBe(true);
    expect(patientView?.some((m) => m.body === adminBody)).toBe(true);
    expect(adminView?.length).toBe(patientView?.length);

    const providerNamedReply = patientView?.find((m) => m.body === adminBody);
    expect(providerNamedReply?.displayName).toContain("Morgan Ellis");
  });

  it("admin sets CB-000005 to Under review and patient sees it", async () => {
    const patient = await loadUser("submitter.a@carebridge.demo");
    const admin = await loadUser("admin.riverside@carebridge.demo");

    const submission = await prisma.submission.findFirst({
      where: { referenceId: "CB-000005", submitterId: patient.id },
    });
    expect(submission).toBeTruthy();

    if (submission!.status !== SUBMISSION_STATUSES.SUBMITTED) {
      await prisma.submission.update({
        where: { id: submission!.id },
        data: { status: SUBMISSION_STATUSES.SUBMITTED },
      });
    }

    const updated = await updateSubmissionStatus(
      admin,
      submission!.id,
      SUBMISSION_STATUSES.UNDER_REVIEW,
      "Integration test: assigned for review",
    );
    expect(updated?.status).toBe(SUBMISSION_STATUSES.UNDER_REVIEW);

    const patientRows = await listSubmitterSubmissions(patient);
    const row = patientRows.find((s) => s.referenceId === "CB-000005");
    expect(row?.status).toBe(SUBMISSION_STATUSES.UNDER_REVIEW);
  });
});