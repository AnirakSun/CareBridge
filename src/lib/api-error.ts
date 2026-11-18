import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function apiUnauthorized(message = "Authentication required") {
  return apiError(401, "UNAUTHORIZED", message);
}

export function apiForbidden(message = "Access denied") {
  return apiError(403, "FORBIDDEN", message);
}

export function apiNotFound(message = "Resource not found") {
  return apiError(404, "NOT_FOUND", message);
}

export function apiValidation(message: string) {
  return apiError(400, "VALIDATION_ERROR", message);
}
