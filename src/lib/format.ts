import { SUBMISSION_STATUSES, type SubmissionStatus } from "./constants";

export function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function statusBadgeClass(status: SubmissionStatus | string) {
  switch (status) {
    case SUBMISSION_STATUSES.SUBMITTED:
      return "bg-blue-100 text-blue-800";
    case SUBMISSION_STATUSES.UNDER_REVIEW:
      return "bg-amber-100 text-amber-900";
    case SUBMISSION_STATUSES.ADDITIONAL_INFO:
      return "bg-orange-100 text-orange-900";
    case SUBMISSION_STATUSES.COMPLETED:
      return "bg-emerald-100 text-emerald-900";
    default:
      return "bg-slate-100 text-slate-800";
  }
}
