import { randomUUID } from "crypto";
import { expect, test } from "@playwright/test";
import path from "path";

const password = "Password123!";

test.describe("CareBridge core workflow", () => {
  test("submitter registers, submits PDF, admin reviews and messages", async ({ browser, page }) => {
    const email = `e2e-${randomUUID()}@carebridge.demo`;

    await page.goto("/register");
    await page.getByLabel("Full name").fill("E2E Submitter");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("link", { name: "New submission" }).click();
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Document title").fill("E2E Synthetic Lab Report");
    await page.getByLabel("Intended recipient").fill("Lab Intake");
    await page.getByLabel("Description").fill(
      "Synthetic demo lab report uploaded during automated end-to-end testing.",
    );
    await page.getByLabel("Recipient organization").selectOption({
      label: "Riverside General Hospital — Riverton, CA",
    });
    const pdfPath = path.join(__dirname, "../fixtures/synthetic.pdf");
    await page.locator("#files").setInputFiles(pdfPath);
    const submitResponse = page.waitForResponse(
      (res) => res.url().includes("/api/submissions") && res.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Submit for review" }).click();
    const response = await submitResponse;
    expect(response.status()).toBe(201);
    await expect(page).toHaveURL(/\/dashboard\/submissions\/(?!new)/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "E2E Synthetic Lab Report" })).toBeVisible();

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/login");
    await adminPage.locator("#provider-email").fill("admin.riverside@carebridge.demo");
    await adminPage.locator("#provider-password").fill(password);
    await adminPage.getByRole("button", { name: "Log in as provider" }).click();
    await expect(adminPage).toHaveURL(/\/admin/);
    const adminSubmissionLink = adminPage
      .getByRole("link", { name: "E2E Synthetic Lab Report" })
      .first();
    await expect(adminSubmissionLink).toBeVisible({ timeout: 15_000 });
    await adminSubmissionLink.click();
    await adminPage.locator("#status").selectOption("Under Review");
    await adminPage.getByRole("button", { name: "Save status" }).click();
    await expect(adminPage.getByText("Status updated")).toBeVisible();

    await adminPage.getByPlaceholder("Write a message…").fill("Please confirm synthetic patient ID format.");
    await adminPage.getByRole("button", { name: "Send message" }).click();
    await expect(adminPage.getByText("Message sent")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Please confirm synthetic patient ID format.")).toBeVisible({
      timeout: 15_000,
    });

    await adminContext.close();
  });

  test("submitter cannot access admin area", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#patient-email").fill("submitter.a@carebridge.demo");
    await page.locator("#patient-password").fill(password);
    await page.getByRole("button", { name: "Log in as patient" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/admin");
    await expect(page.getByText("Access denied")).toBeVisible();
  });
});
