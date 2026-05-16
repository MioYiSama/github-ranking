import { describe, expect, it } from "vitest";
import {
  assertUniqueLanguageSlugs,
  normalizeRepositoryFullName,
  repositoryIdentifier,
  toLanguageSlug,
} from "../../src/lib/slugs";

describe("slug helpers", () => {
  it("creates deterministic language slugs", () => {
    expect(toLanguageSlug("JavaScript")).toBe("javascript");
    expect(toLanguageSlug("C++")).toBe("c-plus-plus");
    expect(toLanguageSlug("C#")).toBe("c-sharp");
    expect(toLanguageSlug("Jupyter Notebook")).toBe("jupyter-notebook");
    expect(toLanguageSlug("Node.js")).toBe("node-js");
  });

  it("creates stable repository identifiers", () => {
    expect(repositoryIdentifier("Vercel", "Next.js")).toBe("vercel/next.js");
    expect(normalizeRepositoryFullName("owner/repo")).toBe("owner/repo");
    expect(() => normalizeRepositoryFullName("owner/repo/extra")).toThrow(/owner\/name/);
  });

  it("rejects duplicate language slugs", () => {
    expect(() =>
      assertUniqueLanguageSlugs([
        { language: "JavaScript", slug: "javascript", displayName: "JavaScript", enabled: true },
        { language: "JS", slug: "javascript", displayName: "JS", enabled: true },
      ]),
    ).toThrow(/Duplicate language slug/);
  });
});
