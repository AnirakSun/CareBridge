import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/constants";
import {
  canDownloadDocument,
  canManageSubmission,
  canMessage,
  canViewSubmission,
} from "@/server/authz";
import type { CurrentUser } from "@/server/session";

function user(partial: Partial<CurrentUser> & Pick<CurrentUser, "id" | "role">): CurrentUser {
  return {
    email: "x@example.com",
    name: "Test",
    passwordHash: "hash",
    createdAt: new Date(),
    updatedAt: new Date(),
    memberships: partial.memberships ?? [],
    ...partial,
  } as CurrentUser;
}

const submission = { submitterId: "sub-1", organizationId: "org-1" };

describe("authz policies", () => {
  it("allows submitter owner access", () => {
    const submitter = user({ id: "sub-1", role: ROLES.SUBMITTER });
    expect(canViewSubmission(submitter, submission)).toBe(true);
    expect(canMessage(submitter, submission)).toBe(true);
    expect(canManageSubmission(submitter, submission)).toBe(false);
  });

  it("allows org admin access only for assigned org", () => {
    const admin = user({
      id: "admin-1",
      role: ROLES.ADMIN,
      memberships: [
        {
          id: "m1",
          userId: "admin-1",
          organizationId: "org-1",
          organization: {
            id: "org-1",
            name: "Org",
            slug: "org",
            type: "hospital",
            city: "X",
            state: "Y",
            description: "",
            streetAddress: null,
            zipCode: null,
            phone: null,
            website: null,
            hoursOverview: null,
            accreditations: null,
            patientPopulation: null,
            isActive: true,
            createdAt: new Date(),
          },
        },
      ],
    });
    expect(canViewSubmission(admin, submission)).toBe(true);
    expect(canManageSubmission(admin, submission)).toBe(true);
    expect(canDownloadDocument(admin, submission)).toBe(true);

    const otherOrgAdmin = user({
      id: "admin-2",
      role: ROLES.ADMIN,
      memberships: [
        {
          id: "m2",
          userId: "admin-2",
          organizationId: "org-2",
          organization: {
            id: "org-2",
            name: "Other",
            slug: "other",
            type: "lab",
            city: "X",
            state: "Y",
            description: "",
            streetAddress: null,
            zipCode: null,
            phone: null,
            website: null,
            hoursOverview: null,
            accreditations: null,
            patientPopulation: null,
            isActive: true,
            createdAt: new Date(),
          },
        },
      ],
    });
    expect(canViewSubmission(otherOrgAdmin, submission)).toBe(false);
  });

  it("denies foreign submitter", () => {
    const other = user({ id: "sub-2", role: ROLES.SUBMITTER });
    expect(canViewSubmission(other, submission)).toBe(false);
  });
});
