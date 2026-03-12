import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpassword123";
const TEST_NAME = "Test User";

test("sign up and sign in with credentials", async ({ page }) => {
  // 1. Register a new account
  await page.goto("/sign-up");
  await expect(page.getByText("Create an account")).toBeVisible();

  await page.getByLabel("Name").fill(TEST_NAME);
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  // Should redirect to dashboard after sign-up
  await page.waitForURL("/dashboard**", { timeout: 10000 });
  await expect(page.locator("text=Assumptions")).toBeVisible();

  // 2. Sign out (via dropdown)
  await page.getByRole("banner").getByRole("button").last().click();
  await page.getByText("Sign out").click();

  // Should be back at landing or sign-in
  await page.waitForURL("/**", { timeout: 5000 });

  // 3. Sign back in
  await page.goto("/sign-in");
  await expect(page.getByText("Welcome back")).toBeVisible();

  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Should land on dashboard with calculator
  await page.waitForURL("/dashboard**", { timeout: 10000 });
  await expect(page.locator("text=Assumptions")).toBeVisible();
});
