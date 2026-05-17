import { describe, expect, it } from "vitest";
import { readBuiltHtml } from "../helpers/static-site";

describe("overall page static smoke", () => {
  it("renders ranking content, top entries, and GitHub links", () => {
    const html = readBuiltHtml("index.html");

    expect(html).toContain("Overall Repository Ranking");
    expect(html).toContain("1,000 repositories");
    expect(html).toContain("freeCodeCamp/freeCodeCamp");
    expect(html).toContain("vercel/next.js");
    expect(html).toContain("https://github.com/vercel/next.js");
    expect(html).toContain("Search repositories");
    expect(html).toContain('href="/github-ranking/languages/javascript/"');
    expect(html).toContain('href="/github-ranking/"');
    expect(html).toContain('href="/github-ranking/favicon.svg"');
  });
});
