import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/visual",
  outputDir: "test-results/visual",
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  webServer: {
    command: "pnpm build:static && pnpm preview --host 127.0.0.1 --port 4321",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    env: {
      ASTRO_TELEMETRY_DISABLED: "1",
      RANKING_SNAPSHOT_SOURCE: "fixture",
      SNAPSHOT_NOW: "2026-05-16T12:00:00.000Z",
    },
  },
  use: {
    baseURL: "http://127.0.0.1:4321",
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 1000 },
  },
  projects: [
    {
      name: "chromium-linux",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
