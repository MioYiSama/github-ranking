import { expect, test } from "@playwright/test";

test("overall ranking page", async ({ page }) => {
  await page.goto("/");
  await page.addStyleTag({ path: "tests/visual/screenshot.css" });
  await expect(page.getByRole("heading", { name: "Overall Repository Ranking" })).toBeVisible();
  await expect(page.getByText("1,000 repositories", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "#1", exact: true })).toBeVisible();
  const renderedRows = await page.locator("[data-virtual-row]").count();
  expect(renderedRows).toBeGreaterThan(0);
  expect(renderedRows).toBeLessThan(80);
  await expect(page).toHaveScreenshot("overall-ranking.png", { fullPage: true });
  await page.locator("[data-virtual-viewport]").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(page.getByRole("cell", { name: "#1000", exact: true })).toBeVisible();
});
