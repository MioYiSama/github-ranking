import { expect, test } from "@playwright/test";

test("snapshot timestamp messaging", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({ path: "tests/visual/screenshot.css" });
  await expect(page.getByText("Ranking data fetched May 16, 2026, 12:00 AM UTC")).toBeVisible();
  await expect(page.locator("[data-snapshot-status]")).toHaveScreenshot(
    "stale-snapshot-status.png",
  );
});
