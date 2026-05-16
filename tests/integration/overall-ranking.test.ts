import { describe, expect, it } from "vitest";
import { buildRankingEntries } from "../../src/lib/ranking";
import snapshot from "../../src/data/fixtures/rankings.sample.json";

describe("overall ranking behavior", () => {
  it("is sorted, top-limited, and deterministic for ties", () => {
    expect(snapshot.overall).toHaveLength(1000);
    expect(snapshot.overall.slice(0, 6).map((entry) => entry.rank)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(snapshot.overall[2]?.stars).toBe(snapshot.overall[3]?.stars);
    expect(snapshot.overall[2]?.fullName).toBe("sindresorhus/awesome");
    expect(snapshot.overall[3]?.fullName).toBe("twbs/bootstrap");
  });

  it("truncates generated ranking input to the top 1000", () => {
    const ranking = buildRankingEntries(
      Array.from({ length: 1001 }, (_, index) => ({
        id: index + 1,
        owner: "owner",
        name: `repo-${index}`,
        fullName: `owner/repo-${index}`,
        htmlUrl: `https://github.com/owner/repo-${index}`,
        stars: 1001 - index,
      })),
      "2026-05-16T00:00:00.000Z",
    );

    expect(ranking).toHaveLength(1000);
  });
});
