import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/constants";

const ALLOWED: Record<string, SubmissionStatus[]> = {
  [SUBMISSION_STATUSES.SUBMITTED]: [SUBMISSION_STATUSES.UNDER_REVIEW],
  [SUBMISSION_STATUSES.UNDER_REVIEW]: [
    SUBMISSION_STATUSES.ADDITIONAL_INFO,
    SUBMISSION_STATUSES.COMPLETED,
  ],
  [SUBMISSION_STATUSES.ADDITIONAL_INFO]: [SUBMISSION_STATUSES.UNDER_REVIEW],
  [SUBMISSION_STATUSES.COMPLETED]: [],
};

export function canTransition(from: string, to: SubmissionStatus) {
  return (ALLOWED[from] ?? []).includes(to);
}

export function assertTransition(from: string, to: SubmissionStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid status transition from "${from}" to "${to}"`);
  }
}
