import { describe, expect, it } from "vitest";
import { SUBMISSION_STATUSES } from "@/lib/constants";
import { assertTransition, canTransition } from "@/server/services/status-transitions";

describe("status transitions", () => {
  it("allows valid admin workflow", () => {
    expect(canTransition(SUBMISSION_STATUSES.SUBMITTED, SUBMISSION_STATUSES.UNDER_REVIEW)).toBe(
      true,
    );
    expect(
      canTransition(SUBMISSION_STATUSES.UNDER_REVIEW, SUBMISSION_STATUSES.ADDITIONAL_INFO),
    ).toBe(true);
    expect(canTransition(SUBMISSION_STATUSES.UNDER_REVIEW, SUBMISSION_STATUSES.COMPLETED)).toBe(
      true,
    );
    expect(
      canTransition(SUBMISSION_STATUSES.ADDITIONAL_INFO, SUBMISSION_STATUSES.UNDER_REVIEW),
    ).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() =>
      assertTransition(SUBMISSION_STATUSES.SUBMITTED, SUBMISSION_STATUSES.COMPLETED),
    ).toThrow();
    expect(canTransition(SUBMISSION_STATUSES.COMPLETED, SUBMISSION_STATUSES.UNDER_REVIEW)).toBe(
      false,
    );
  });
});
