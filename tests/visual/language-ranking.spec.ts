import { expect, test } from "@playwright/test";

test("populated language ranking page", async ({ page }) => {
  await page.goto("/languages/javascript/");
  await page.addStyleTag({ path: "tests/visual/screenshot.css" });
  await expect(page.getByRole("heading", { name: "JavaScript Repository Ranking" })).toBeVisible();
  await expect(page).toHaveScreenshot("language-ranking.png", { fullPage: true });
});
