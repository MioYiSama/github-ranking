import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages workflow contract", () => {
  it("keeps live data fetch before deployment build and deploy", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
    const orderedSteps = [
      "Fetch live ranking data",
      "Build static site for deployment",
      "actions/upload-pages-artifact",
      "actions/deploy-pages",
    ];
    const positions = orderedSteps.map((step) => workflow.indexOf(step));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(workflow).not.toContain("pnpm test");
    expect(workflow).not.toContain("pnpm test:visual");
    expect(workflow).not.toContain("playwright install");
    expect(workflow).not.toContain("RANKING_SNAPSHOT_SOURCE: fixture");
  });
});
