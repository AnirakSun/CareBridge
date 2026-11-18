import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  MESSAGE_KINDS,
  NOTIFICATION_TYPES,
  ROLES,
  SUBMISSION_STATUSES,
} from "../src/lib/constants";
import { applyOrganizationProfiles } from "./organization-profiles";
import { seedRegionalHealthSystems } from "./regional-health-systems";

const prisma = new PrismaClient();

const SYNTHETIC_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 68 >> stream
BT /F1 14 Tf 72 720 Td (SYNTHETIC - NOT REAL PATIENT DATA) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000391 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
472
%%EOF`,
);

async function storeFile(buffer: Buffer, mimeType: string) {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "storage/uploads");
  await mkdir(uploadDir, { recursive: true });
  const storageKey = randomUUID();
  await writeFile(path.join(uploadDir, storageKey), buffer);
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  return { storageKey, sha256, sizeBytes: buffer.length, mimeType };
}

async function main() {
  await prisma.patientProviderMessage.deleteMany();
  await prisma.staffMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.document.deleteMany();
  await prisma.submissionRead.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.connectedHealthDevice.deleteMany();
  await prisma.userInsurance.deleteMany();
  await prisma.userCareProvider.deleteMany();
  await prisma.organizationMembership.deleteMany();
  await prisma.careProvider.deleteMany();
  await prisma.organizationSpecialty.deleteMany();
  await prisma.organizationFacility.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: "Riverside General Hospital",
        slug: "riverside-general",
        type: "hospital",
        city: "Riverton",
        state: "CA",
        description: "Fictional community hospital for CareBridge demos.",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Northlake Diagnostics Lab",
        slug: "northlake-diagnostics",
        type: "lab",
        city: "Northlake",
        state: "WA",
        description: "Fictional reference laboratory accepting synthetic lab reports.",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Summit Care Clinic",
        slug: "summit-care",
        type: "clinic",
        city: "Denver",
        state: "CO",
        description: "Fictional outpatient clinic for document intake demos.",
      },
    }),
    prisma.organization.create({
      data: {
        name: "Harborview Medical Center",
        slug: "harborview-medical",
        type: "hospital",
        city: "Seattle",
        state: "WA",
        description: "Fictional tertiary hospital in the demo directory.",
      },
    }),
    prisma.organization.create({
      data: {
        name: "ClearPath Imaging",
        slug: "clearpath-imaging",
        type: "lab",
        city: "Austin",
        state: "TX",
        description: "Fictional imaging center for synthetic imaging uploads.",
      },
    }),
  ]);

  await applyOrganizationProfiles(prisma);
  await seedRegionalHealthSystems(prisma);

  const adminRiverside = await prisma.user.create({
    data: {
      email: "admin.riverside@carebridge.demo",
      name: "Riverside Admin",
      passwordHash,
      role: ROLES.ADMIN,
    },
  });
  const adminNorthlake = await prisma.user.create({
    data: {
      email: "admin.northlake@carebridge.demo",
      name: "Northlake Admin",
      passwordHash,
      role: ROLES.ADMIN,
    },
  });
  const adminMulti = await prisma.user.create({
    data: {
      email: "admin.multi@carebridge.demo",
      name: "Regional Admin",
      passwordHash,
      role: ROLES.ADMIN,
    },
  });
  const adminRiverside2 = await prisma.user.create({
    data: {
      email: "admin.riverside2@carebridge.demo",
      name: "Dr. Morgan Nguyen",
      passwordHash,
      role: ROLES.ADMIN,
    },
  });

  await prisma.organizationMembership.createMany({
    data: [
      { userId: adminRiverside.id, organizationId: orgs[0].id },
      { userId: adminNorthlake.id, organizationId: orgs[1].id },
      { userId: adminMulti.id, organizationId: orgs[0].id },
      { userId: adminMulti.id, organizationId: orgs[2].id },
      { userId: adminRiverside2.id, organizationId: orgs[0].id },
    ],
  });

  const submitterA = await prisma.user.create({
    data: {
      email: "submitter.a@carebridge.demo",
      name: "Alex Submitter",
      phone: "(555) 100-2001",
      passwordHash,
      role: ROLES.SUBMITTER,
    },
  });
  const submitterB = await prisma.user.create({
    data: {
      email: "submitter.b@carebridge.demo",
      name: "Blake Submitter",
      passwordHash,
      role: ROLES.SUBMITTER,
    },
  });
  const submitterC = await prisma.user.create({
    data: {
      email: "submitter.c@carebridge.demo",
      name: "Casey Patient",
      phone: "(555) 100-2003",
      passwordHash,
      role: ROLES.SUBMITTER,
    },
  });
  const submitterD = await prisma.user.create({
    data: {
      email: "submitter.d@carebridge.demo",
      name: "Dana Patient",
      phone: "(555) 100-2004",
      passwordHash,
      role: ROLES.SUBMITTER,
    },
  });

  await prisma.organizationMembership.create({
    data: { userId: submitterA.id, organizationId: orgs[0].id },
  });

  await prisma.user.update({
    where: { id: submitterA.id },
    data: {
      streetAddress: "456 Synthetic Ave",
      city: "Riverton",
      state: "CA",
      zipCode: "90210",
    },
  });

  await prisma.userInsurance.create({
    data: {
      userId: submitterA.id,
      providerName: "Demo Health Plan",
      planName: "PPO Standard (Synthetic)",
      memberId: "DEMO-MBR-0001",
      groupNumber: "GRP-RIVER-01",
      isPrimary: true,
    },
  });

  const riversideProviders = await prisma.careProvider.findMany({
    where: { organizationId: orgs[0].id },
    orderBy: { sortOrder: "asc" },
    take: 4,
  });
  for (const provider of riversideProviders) {
    await prisma.userCareProvider.create({
      data: { userId: submitterA.id, careProviderId: provider.id },
    });
  }

  await prisma.patientProviderMessage.createMany({
    data: [
      {
        patientId: submitterA.id,
        careProviderId: riversideProviders[0].id,
        senderId: submitterA.id,
        body: "Hi — I had a question about my recent labs (synthetic demo message).",
      },
      {
        patientId: submitterA.id,
        careProviderId: riversideProviders[0].id,
        senderId: adminRiverside.id,
        body: "Thanks for reaching out. I will review your submission and follow up shortly.",
      },
    ],
  });

  const file = await storeFile(SYNTHETIC_PDF, "application/pdf");

  const submission = await prisma.submission.create({
    data: {
      referenceId: "CB-000001",
      title: "Synthetic CBC Panel",
      category: "Laboratory Report",
      description: "Demo laboratory report for workflow testing. Synthetic patient data only.",
      recipientName: "Laboratory Services",
      status: SUBMISSION_STATUSES.UNDER_REVIEW,
      submitterId: submitterA.id,
      organizationId: orgs[0].id,
    },
  });

  await prisma.document.create({
    data: {
      submissionId: submission.id,
      uploadedById: submitterA.id,
      originalName: "synthetic-cbc-panel.pdf",
      storageKey: file.storageKey,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      sha256: file.sha256,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        submissionId: submission.id,
        fromStatus: null,
        toStatus: SUBMISSION_STATUSES.SUBMITTED,
        note: "Submission received",
        changedById: submitterA.id,
      },
      {
        submissionId: submission.id,
        fromStatus: SUBMISSION_STATUSES.SUBMITTED,
        toStatus: SUBMISSION_STATUSES.UNDER_REVIEW,
        note: "Assigned for review",
        changedById: adminRiverside.id,
      },
    ],
  });

  await prisma.message.create({
    data: {
      submissionId: submission.id,
      senderId: adminRiverside.id,
      body: "Thank you for submitting. We are reviewing your synthetic lab report.",
      kind: MESSAGE_KINDS.FEEDBACK,
    },
  });

  await prisma.notification.create({
    data: {
      userId: submitterA.id,
      submissionId: submission.id,
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
      text: "New message on submission CB-000001",
    },
  });

  await prisma.message.create({
    data: {
      submissionId: submission.id,
      senderId: submitterA.id,
      body: "Happy to provide any additional labs if needed — synthetic demo only.",
      kind: MESSAGE_KINDS.MESSAGE,
    },
  });

  const fileDischarge = await storeFile(SYNTHETIC_PDF, "application/pdf");
  const fileWellness = await storeFile(SYNTHETIC_PDF, "application/pdf");

  const submissionPending = await prisma.submission.create({
    data: {
      referenceId: "CB-000005",
      title: "Synthetic discharge summary",
      category: "Discharge Summary",
      description:
        "Fresh upload for Alex Submitter — Riverside admin can move this to Under review from the queue.",
      recipientName: "Medical Records",
      status: SUBMISSION_STATUSES.SUBMITTED,
      submitterId: submitterA.id,
      organizationId: orgs[0].id,
    },
  });
  await prisma.document.create({
    data: {
      submissionId: submissionPending.id,
      uploadedById: submitterA.id,
      originalName: "synthetic-discharge-summary.pdf",
      storageKey: fileDischarge.storageKey,
      mimeType: fileDischarge.mimeType,
      sizeBytes: fileDischarge.sizeBytes,
      sha256: fileDischarge.sha256,
    },
  });
  await prisma.statusHistory.create({
    data: {
      submissionId: submissionPending.id,
      fromStatus: null,
      toStatus: SUBMISSION_STATUSES.SUBMITTED,
      note: "Submission received",
      changedById: submitterA.id,
    },
  });

  const submissionCompleted = await prisma.submission.create({
    data: {
      referenceId: "CB-000006",
      title: "Synthetic wellness visit note",
      category: "Clinical Note",
      description: "Completed demo submission — patient should see Completed on the dashboard.",
      recipientName: "Primary Care",
      status: SUBMISSION_STATUSES.COMPLETED,
      submitterId: submitterA.id,
      organizationId: orgs[0].id,
    },
  });
  await prisma.document.create({
    data: {
      submissionId: submissionCompleted.id,
      uploadedById: submitterA.id,
      originalName: "synthetic-wellness-note.pdf",
      storageKey: fileWellness.storageKey,
      mimeType: fileWellness.mimeType,
      sizeBytes: fileWellness.sizeBytes,
      sha256: fileWellness.sha256,
    },
  });
  await prisma.statusHistory.createMany({
    data: [
      {
        submissionId: submissionCompleted.id,
        fromStatus: null,
        toStatus: SUBMISSION_STATUSES.SUBMITTED,
        note: "Submission received",
        changedById: submitterA.id,
      },
      {
        submissionId: submissionCompleted.id,
        fromStatus: SUBMISSION_STATUSES.SUBMITTED,
        toStatus: SUBMISSION_STATUSES.UNDER_REVIEW,
        note: "Assigned for review",
        changedById: adminRiverside.id,
      },
      {
        submissionId: submissionCompleted.id,
        fromStatus: SUBMISSION_STATUSES.UNDER_REVIEW,
        toStatus: SUBMISSION_STATUSES.COMPLETED,
        note: "Review complete — synthetic demo",
        changedById: adminRiverside.id,
      },
    ],
  });
  await prisma.message.create({
    data: {
      submissionId: submissionCompleted.id,
      senderId: adminRiverside.id,
      body: "Your wellness note has been reviewed and marked complete in the demo workflow.",
      kind: MESSAGE_KINDS.FEEDBACK,
    },
  });

  await prisma.staffMessage.createMany({
    data: [
      {
        organizationId: orgs[0].id,
        senderId: adminRiverside.id,
        recipientId: adminMulti.id,
        body: "Can you cover intake for the synthetic CBC case if I'm in meetings?",
      },
      {
        organizationId: orgs[0].id,
        senderId: adminMulti.id,
        recipientId: adminRiverside.id,
        body: "Yes — I'll follow up with the patient on CB-000001 this afternoon.",
      },
      {
        organizationId: orgs[0].id,
        senderId: adminRiverside.id,
        recipientId: adminRiverside2.id,
        body: "Morgan — please review Casey Patient's imaging upload when you have a moment.",
      },
      {
        organizationId: orgs[0].id,
        senderId: adminRiverside2.id,
        recipientId: adminRiverside.id,
        body: "On it. I'll coordinate with Dana Patient on the additional info request too.",
      },
    ],
  });

  const submissionC = await prisma.submission.create({
    data: {
      referenceId: "CB-000003",
      title: "Synthetic chest imaging",
      category: "Imaging",
      description: "Demo imaging study for Riverside chat workflow.",
      recipientName: "Radiology",
      status: SUBMISSION_STATUSES.SUBMITTED,
      submitterId: submitterC.id,
      organizationId: orgs[0].id,
    },
  });
  await prisma.message.create({
    data: {
      submissionId: submissionC.id,
      senderId: adminRiverside2.id,
      body: "Casey — we received your synthetic imaging upload and will assign a reviewer.",
      kind: MESSAGE_KINDS.MESSAGE,
    },
  });

  const submissionD = await prisma.submission.create({
    data: {
      referenceId: "CB-000004",
      title: "Synthetic medication list",
      category: "Other",
      description: "Demo medication reconciliation for Dana Patient.",
      recipientName: "Pharmacy",
      status: SUBMISSION_STATUSES.ADDITIONAL_INFO,
      submitterId: submitterD.id,
      organizationId: orgs[0].id,
    },
  });
  await prisma.message.createMany({
    data: [
      {
        submissionId: submissionD.id,
        senderId: adminRiverside.id,
        body: "Dana — please upload your updated synthetic medication list when you can.",
        kind: MESSAGE_KINDS.INFO_REQUEST,
      },
      {
        submissionId: submissionD.id,
        senderId: submitterD.id,
        body: "Thanks — I'll add the updated demo list tonight.",
        kind: MESSAGE_KINDS.MESSAGE,
      },
    ],
  });

  await prisma.submission.create({
    data: {
      referenceId: "CB-000002",
      title: "Synthetic referral letter",
      category: "Referral",
      description: "Sample referral for submitter B — should not appear in Riverside admin queue.",
      recipientName: "Intake Desk",
      status: SUBMISSION_STATUSES.SUBMITTED,
      submitterId: submitterB.id,
      organizationId: orgs[1].id,
    },
  });

  console.log("Seed complete.");
  console.log("Demo passwords for all seeded users: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
