import { expect, test } from "@playwright/test";

test("stale snapshot messaging", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({ path: "tests/visual/screenshot.css" });
  await page.locator("[data-snapshot-status]").evaluate((element) => {
    element.setAttribute("data-state", "stale");
    const strong = element.querySelector("strong");
    const detail = element.querySelector("span");

    if (strong) {
      strong.textContent = "Stale snapshot";
    }

    if (detail) {
      detail.textContent =
        "Last successful update was May 14, 2026, 12:00 AM UTC; data may no longer match current GitHub stars.";
    }
  });
  await expect(page.getByText("Stale snapshot")).toBeVisible();
  await expect(page.locator("[data-snapshot-status]")).toHaveScreenshot(
    "stale-snapshot-status.png",
  );
});
