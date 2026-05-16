import { describe, expect, it } from "vitest";
import { readBuiltHtml } from "../helpers/static-site";

describe("freshness status smoke", () => {
  it("renders freshness status on overall and language routes", () => {
    expect(readBuiltHtml("index.html")).toContain("Fresh snapshot");
    expect(readBuiltHtml("languages/javascript/index.html")).toContain("Last successful update");
  });
});
