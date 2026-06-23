import { describe, expect, it } from "vitest";
import { readBuiltHtml } from "../helpers/static-site";

describe("freshness status smoke", () => {
  it("renders snapshot timestamp on overall and language routes", () => {
    expect(readBuiltHtml("index.html")).toContain("Ranking data fetched");
    expect(readBuiltHtml("languages/javascript/index.html")).toContain(
      "Ranking data fetched May 16, 2026, 12:00 AM UTC",
    );
  });
});
