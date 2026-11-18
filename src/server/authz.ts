import { ROLES } from "@/lib/constants";
import type { CurrentUser } from "./session";

export function isAdmin(user: CurrentUser) {
  return user.role === ROLES.ADMIN;
}

export function adminOrganizationIds(user: CurrentUser) {
  return user.memberships.map((m) => m.organizationId);
}

export function canViewSubmission(
  user: CurrentUser,
  submission: { submitterId: string; organizationId: string },
) {
  if (submission.submitterId === user.id) return true;
  if (
    user.role === ROLES.ADMIN &&
    user.memberships.some((m) => m.organizationId === submission.organizationId)
  ) {
    return true;
  }
  return false;
}

export function canManageSubmission(
  user: CurrentUser,
  submission: { organizationId: string },
) {
  return (
    user.role === ROLES.ADMIN &&
    user.memberships.some((m) => m.organizationId === submission.organizationId)
  );
}

export function canMessage(
  user: CurrentUser,
  submission: { submitterId: string; organizationId: string },
) {
  return canViewSubmission(user, submission);
}

export function canDownloadDocument(
  user: CurrentUser,
  submission: { submitterId: string; organizationId: string },
) {
  return canViewSubmission(user, submission);
}
