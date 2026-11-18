import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, validateFileMeta } from "@/lib/validation";

describe("validation schemas", () => {
  it("validates register input", () => {
    const ok = registerSchema.safeParse({
      name: "Demo User",
      email: "demo@example.com",
      password: "Password123!",
    });
    expect(ok.success).toBe(true);

    const bad = registerSchema.safeParse({
      name: "A",
      email: "bad",
      password: "short",
    });
    expect(bad.success).toBe(false);
  });

  it("validates login input", () => {
    const ok = loginSchema.safeParse({ email: "demo@example.com", password: "x" });
    expect(ok.success).toBe(true);
  });

  it("rejects invalid file metadata", () => {
    expect(
      validateFileMeta({ name: "virus.exe", size: 100, type: "application/octet-stream" }, 0),
    ).toMatch(/not allowed/);
    expect(
      validateFileMeta({ name: "big.pdf", size: 11 * 1024 * 1024, type: "application/pdf" }, 0),
    ).toMatch(/too large/);
  });
});
