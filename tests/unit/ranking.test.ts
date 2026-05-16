import { describe, expect, it } from "vitest";
import { buildRankingEntries } from "../../src/lib/ranking";

const snapshotAt = "2026-05-16T00:00:00.000Z";

function repo(fullName: string, stars: number, overrides = {}) {
  const [owner = "", name = ""] = fullName.split("/");

  return {
    id: Math.floor(Math.random() * 1000000) + 1,
    owner,
    name,
    fullName,
    htmlUrl: `https://github.com/${fullName}`,
    stars,
    ...overrides,
  };
}

describe("ranking helpers", () => {
  it("sorts by stars descending and full name for ties", () => {
    const ranking = buildRankingEntries(
      [repo("zeta/tool", 10), repo("alpha/tool", 10), repo("middle/tool", 20)],
      snapshotAt,
    );

    expect(ranking.map((entry) => entry.fullName)).toEqual([
      "middle/tool",
      "alpha/tool",
      "zeta/tool",
    ]);
    expect(ranking.map((entry) => entry.rank)).toEqual([1, 2, 3]);
  });

  it("truncates to the requested top limit", () => {
    const ranking = buildRankingEntries(
      Array.from({ length: 1005 }, (_, index) => repo(`owner/repo-${index}`, 1005 - index)),
      snapshotAt,
    );

    expect(ranking).toHaveLength(1000);
    expect(ranking.at(-1)?.rank).toBe(1000);
  });

  it("applies metadata defaults and excludes ineligible repositories", () => {
    const ranking = buildRankingEntries(
      [
        repo("owner/good", 3),
        repo("owner/fork", 100, { fork: true }),
        repo("owner/archived", 100, { archived: true }),
        repo("owner/mirror", 100, { mirror: true }),
      ],
      snapshotAt,
    );

    expect(ranking).toHaveLength(1);
    expect(ranking[0]).toMatchObject({
      fullName: "owner/good",
      description: null,
      primaryLanguage: null,
      fork: false,
      archived: false,
      snapshotAt,
    });
  });
});
