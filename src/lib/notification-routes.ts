import { NOTIFICATION_TYPES, ROLES } from "@/lib/constants";

export type NotificationLinkInput = {
  type: string;
  submissionId: string | null;
  careProviderId?: string | null;
  patientId?: string | null;
};

export function notificationHref(
  n: NotificationLinkInput,
  userRole: string,
): string {
  const isAdmin = userRole === ROLES.ADMIN;
  const chatBase = isAdmin ? "/admin/chat" : "/dashboard/chat";
  const submissionBase = isAdmin ? "/admin/submissions" : "/dashboard/submissions";

  if (n.type === NOTIFICATION_TYPES.NEW_MESSAGE) {
    if (n.submissionId) {
      return `${chatBase}?submission=${encodeURIComponent(n.submissionId)}`;
    }
    if (n.careProviderId) {
      if (isAdmin && n.patientId) {
        return `${chatBase}?patient=${encodeURIComponent(n.patientId)}&physician=${encodeURIComponent(n.careProviderId)}`;
      }
      return `${chatBase}?physician=${encodeURIComponent(n.careProviderId)}`;
    }
    return chatBase;
  }

  if (n.submissionId) {
    const fragment =
      n.type === NOTIFICATION_TYPES.NEW_SUBMISSION ? "#submission-documents" : "";
    return `${submissionBase}/${n.submissionId}${fragment}`;
  }

  return isAdmin ? "/admin" : "/dashboard";
}