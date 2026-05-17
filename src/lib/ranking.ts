import type { RepositoryRankingEntry } from "./types";

export type RepositoryRankingInput = Omit<
  RepositoryRankingEntry,
  | "rank"
  | "snapshotAt"
  | "description"
  | "primaryLanguage"
  | "nodeId"
  | "fork"
  | "archived"
  | "mirror"
  | "pushedAt"
  | "updatedAt"
> &
  Partial<
    Pick<
      RepositoryRankingEntry,
      | "rank"
      | "snapshotAt"
      | "description"
      | "primaryLanguage"
      | "nodeId"
      | "fork"
      | "archived"
      | "mirror"
      | "pushedAt"
      | "updatedAt"
    >
  >;

export const RANKING_LIMIT = 1000;

function normalizeTopics(topics: string[] | undefined): string[] {
  return [...new Set(topics ?? [])]
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function compareRankingEntries(
  left: Pick<RepositoryRankingInput, "stars" | "fullName">,
  right: Pick<RepositoryRankingInput, "stars" | "fullName">,
): number {
  if (right.stars !== left.stars) {
    return right.stars - left.stars;
  }

  return left.fullName.localeCompare(right.fullName, "en", { sensitivity: "base" });
}

export function isEligibleRepository(
  entry: Pick<RepositoryRankingInput, "fork" | "archived" | "mirror">,
): boolean {
  return entry.fork !== true && entry.archived !== true && entry.mirror !== true;
}

export function buildRankingEntries(
  entries: RepositoryRankingInput[],
  snapshotAt: string,
  limit = RANKING_LIMIT,
): RepositoryRankingEntry[] {
  return entries
    .filter(isEligibleRepository)
    .toSorted(compareRankingEntries)
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      id: entry.id,
      nodeId: entry.nodeId ?? null,
      owner: entry.owner,
      name: entry.name,
      fullName: entry.fullName,
      htmlUrl: entry.htmlUrl,
      description: entry.description ?? null,
      topics: normalizeTopics(entry.topics),
      stars: entry.stars,
      primaryLanguage: entry.primaryLanguage ?? null,
      fork: entry.fork ?? false,
      archived: entry.archived ?? false,
      mirror: entry.mirror ?? null,
      pushedAt: entry.pushedAt ?? null,
      updatedAt: entry.updatedAt ?? null,
      snapshotAt,
    }));
}

export function assertRankingOrder(entries: RepositoryRankingEntry[]): void {
  entries.forEach((entry, index) => {
    if (entry.rank !== index + 1) {
      throw new Error(`Expected ${entry.fullName} to have rank ${index + 1}, got ${entry.rank}`);
    }

    const next = entries[index + 1];

    if (next && compareRankingEntries(entry, next) > 0) {
      throw new Error(`Ranking order violation between ${entry.fullName} and ${next.fullName}`);
    }
  });
}
