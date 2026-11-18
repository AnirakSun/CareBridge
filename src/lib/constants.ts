export const ROLES = {
  SUBMITTER: "SUBMITTER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const SUBMISSION_STATUSES = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ADDITIONAL_INFO: "Additional Information Requested",
  COMPLETED: "Completed",
} as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUSES)[keyof typeof SUBMISSION_STATUSES];

export const STATUS_LIST: SubmissionStatus[] = [
  SUBMISSION_STATUSES.SUBMITTED,
  SUBMISSION_STATUSES.UNDER_REVIEW,
  SUBMISSION_STATUSES.ADDITIONAL_INFO,
  SUBMISSION_STATUSES.COMPLETED,
];

export const MESSAGE_KINDS = {
  MESSAGE: "MESSAGE",
  FEEDBACK: "FEEDBACK",
  INFO_REQUEST: "INFO_REQUEST",
} as const;

export type MessageKind = (typeof MESSAGE_KINDS)[keyof typeof MESSAGE_KINDS];

export const NOTIFICATION_TYPES = {
  STATUS_CHANGED: "STATUS_CHANGED",
  NEW_MESSAGE: "NEW_MESSAGE",
  NEW_SUBMISSION: "NEW_SUBMISSION",
} as const;

export const DOCUMENT_CATEGORIES = [
  "Laboratory Report",
  "Imaging",
  "Referral",
  "Insurance",
  "Other",
] as const;

export const ORG_TYPES = ["hospital", "lab", "clinic"] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_SUBMISSION = 5;

export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".jpg", ".jpeg", ".png"] as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
] as const;

export const SESSION_COOKIE = "carebridge_session";
export const SESSION_DAYS = 7;

export const HEALTH_DEVICES = {
  OURA_RING: "OURA_RING",
  APPLE_WATCH: "APPLE_WATCH",
  GARMIN: "GARMIN",
  FITBIT: "FITBIT",
  WHOOP: "WHOOP",
  SAMSUNG_GALAXY: "SAMSUNG_GALAXY",
} as const;

export type HealthDeviceType = (typeof HEALTH_DEVICES)[keyof typeof HEALTH_DEVICES];

export const HEALTH_DEVICE_LABELS: Record<HealthDeviceType, string> = {
  [HEALTH_DEVICES.OURA_RING]: "Oura Ring",
  [HEALTH_DEVICES.APPLE_WATCH]: "Apple Watch",
  [HEALTH_DEVICES.GARMIN]: "Garmin Watch",
  [HEALTH_DEVICES.FITBIT]: "Fitbit",
  [HEALTH_DEVICES.WHOOP]: "WHOOP",
  [HEALTH_DEVICES.SAMSUNG_GALAXY]: "Samsung Galaxy Watch",
};

/** Vendor help pages: connecting the device to a phone health app (e.g. Apple Health). */
export const HEALTH_DEVICE_CONNECTION_GUIDE_URLS: Record<HealthDeviceType, string> = {
  [HEALTH_DEVICES.OURA_RING]:
    "https://support.ouraring.com/hc/en-us/articles/360025418874-Connecting-Oura-to-Apple-Health",
  [HEALTH_DEVICES.APPLE_WATCH]:
    "https://support.apple.com/guide/iphone/iph5ede58c3d/ios",
  [HEALTH_DEVICES.GARMIN]:
    "https://support.garmin.com/en-US/?faq=h00WD2iaKX073Hd5AEz0w8",
  [HEALTH_DEVICES.FITBIT]:
    "https://help.fitbit.com/articles/en_US/Help_article/2033",
  [HEALTH_DEVICES.WHOOP]:
    "https://support.whoop.com/hc/en-us/articles/360026105793-Apple-Health",
  [HEALTH_DEVICES.SAMSUNG_GALAXY]:
    "https://www.samsung.com/us/support/answer/ANS10002535/",
};

export const DEVICE_CONNECTION_STATUS = {
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
} as const;
