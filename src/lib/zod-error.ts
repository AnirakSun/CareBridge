import type { ZodError } from "zod";

export function firstZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Validation failed";
}
