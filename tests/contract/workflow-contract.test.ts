import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("GitHub Pages workflow contract", () => {
  it("keeps fixture validation before live fetch and deployment", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");
    const orderedSteps = [
      "Run Vitest suite",
      "Build static site for validation",
      "Run Playwright visual tests",
      "Fetch live ranking data",
      "Build static site for deployment",
      "actions/upload-pages-artifact",
      "actions/deploy-pages",
    ];
    const positions = orderedSteps.map((step) => workflow.indexOf(step));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(workflow).toContain("RANKING_SNAPSHOT_SOURCE: fixture");
  });
});
