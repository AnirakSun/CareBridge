import { z } from "zod";
import {
  ALLOWED_EXTENSIONS,
  DOCUMENT_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_SUBMISSION,
  MESSAGE_KINDS,
  SUBMISSION_STATUSES,
} from "./constants";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const submissionMetadataSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  category: z.enum(DOCUMENT_CATEGORIES as unknown as [string, ...string[]]),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  recipientName: z.string().trim().min(2, "Recipient is required"),
  organizationId: z.string().min(1, "Select an organization"),
});

export const statusUpdateSchema = z.object({
  status: z.enum([
    SUBMISSION_STATUSES.UNDER_REVIEW,
    SUBMISSION_STATUSES.ADDITIONAL_INFO,
    SUBMISSION_STATUSES.COMPLETED,
  ] as unknown as [string, ...string[]]),
  note: z.string().trim().optional(),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, "Message cannot be empty").max(5000),
  kind: z
    .enum([
      MESSAGE_KINDS.MESSAGE,
      MESSAGE_KINDS.FEEDBACK,
      MESSAGE_KINDS.INFO_REQUEST,
    ] as unknown as [string, ...string[]])
    .optional()
    .default(MESSAGE_KINDS.MESSAGE),
});

export function validateFileMeta(
  file: { name: string; size: number; type: string },
  index: number,
): string | null {
  if (index >= MAX_FILES_PER_SUBMISSION) {
    return `Maximum ${MAX_FILES_PER_SUBMISSION} files allowed`;
  }
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    : "";
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return `File type not allowed: ${file.name}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large (max 10 MB): ${file.name}`;
  }
  return null;
}

const optionalProfileString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: optionalProfileString,
  streetAddress: optionalProfileString,
  addressLine2: optionalProfileString,
  city: optionalProfileString,
  state: optionalProfileString
    .optional()
    .transform((v) => (v === "" ? undefined : v?.toUpperCase().slice(0, 2))),
  zipCode: optionalProfileString,
});

export const adminChatLookupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: optionalProfileString,
    phone: optionalProfileString,
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "Enter an email or phone number",
    path: ["email"],
  });

export const insuranceCreateSchema = z.object({
  providerName: z.string().trim().min(1, "Insurance provider name is required"),
  planName: optionalProfileString,
  memberId: optionalProfileString,
  groupNumber: optionalProfileString,
  isPrimary: z.boolean().optional(),
});

export const connectDeviceSchema = z.object({
  deviceType: z.enum([
    "OURA_RING",
    "APPLE_WATCH",
    "GARMIN",
    "FITBIT",
    "WHOOP",
    "SAMSUNG_GALAXY",
  ] as const),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
