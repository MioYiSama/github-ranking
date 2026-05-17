import { describe, expect, it } from "vitest";
import { readBuiltHtml } from "../helpers/static-site";

describe("language page static smoke", () => {
  it("renders a direct language route with repository table content", () => {
    const html = readBuiltHtml("languages/javascript/index.html");

    expect(html).toContain("JavaScript Repository Ranking");
    expect(html).toContain("twbs/bootstrap");
    expect(html).toContain('href="/github-ranking/"');
  });

  it("renders empty language state on direct reload", () => {
    const html = readBuiltHtml("languages/python/index.html");

    expect(html).toContain("No Python ranking entries");
    expect(html).toContain("latest successful snapshot");
  });
});
