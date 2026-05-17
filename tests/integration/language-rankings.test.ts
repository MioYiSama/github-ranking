import { describe, expect, it } from "vitest";
import { getEnabledLanguages } from "../../src/config/languages";
import { getLanguageRanking } from "../../src/lib/snapshot";
import type { RankingSnapshot } from "../../src/lib/types";
import snapshotData from "../../src/data/fixtures/rankings.sample.json";

const snapshot = snapshotData as RankingSnapshot;

describe("language ranking behavior", () => {
  it("filters entries to the selected primary language", () => {
    const ranking = getLanguageRanking(snapshot, "javascript");
    expect(ranking?.items.length).toBeGreaterThan(0);
    expect(ranking?.items.every((entry) => entry.primaryLanguage === "JavaScript")).toBe(true);
  });

  it("supports clear empty language results", () => {
    const ranking = getLanguageRanking(snapshot, "python");
    expect(ranking?.items).toEqual([]);
  });

  it("generates page data for every configured language", () => {
    const slugs = getEnabledLanguages().map((language) => language.slug);

    expect(slugs).toContain("javascript");
    expect(slugs.every((slug) => getLanguageRanking(snapshot, slug))).toBe(true);
  });
});
