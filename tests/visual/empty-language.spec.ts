import { expect, test } from "@playwright/test";

test("empty language ranking state", async ({ page }) => {
  await page.goto("/languages/python/");
  await page.addStyleTag({ path: "tests/visual/screenshot.css" });
  await expect(page.getByRole("heading", { name: "Python Repository Ranking" })).toBeVisible();
  await expect(page.getByText("No Python ranking entries")).toBeVisible();
  await expect(page).toHaveScreenshot("empty-language.png", { fullPage: true });
});
