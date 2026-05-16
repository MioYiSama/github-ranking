import { describe, expect, it } from "vitest";
import { LANGUAGES, findLanguageBySlug, getEnabledLanguages } from "../../src/config/languages";
import { buildRepositorySearchUrl } from "../../src/lib/github-search";

describe("language configuration", () => {
  it("has enabled languages with unique URL-safe slugs", () => {
    const enabled = getEnabledLanguages();
    const slugs = new Set(enabled.map((language) => language.slug));

    expect(enabled.length).toBeGreaterThan(5);
    expect(slugs.size).toBe(enabled.length);

    for (const language of enabled) {
      expect(language.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("finds languages by slug", () => {
    expect(findLanguageBySlug("javascript")?.language).toBe("JavaScript");
    expect(findLanguageBySlug("not-configured")).toBeNull();
  });

  it("keeps query encoding separate from visitor slugs", () => {
    const cpp = LANGUAGES.find((language) => language.language === "C++");
    expect(cpp?.slug).toBe("c-plus-plus");
    expect(buildRepositorySearchUrl({ language: cpp?.language }).searchParams.get("q")).toContain(
      "language:C++",
    );
  });
});
