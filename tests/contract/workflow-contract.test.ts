import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages workflow contract", () => {
  it("keeps fetch, validation, build, upload, and deploy gates ordered", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
    const orderedSteps = [
      "pnpm data:fetch",
      "pnpm test",
      "pnpm build:static",
      "pnpm test:visual",
      "actions/upload-pages-artifact",
      "actions/deploy-pages",
    ];
    const positions = orderedSteps.map((step) => workflow.indexOf(step));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });
});
