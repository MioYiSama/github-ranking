import { describe, expect, it, vi } from "vitest";
import {
  FatalFetchError,
  buildSnapshot,
  fetchSearchRanking,
} from "../../scripts/fetch-rankings.mjs";

function response(json: unknown, init: { ok?: boolean; status?: number; remaining?: string } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "x-ratelimit-remaining" ? (init.remaining ?? "25") : null,
    },
    json: async () => json,
  };
}

const githubItem = {
  id: 1,
  node_id: "node",
  name: "repo",
  full_name: "owner/repo",
  owner: { login: "owner" },
  html_url: "https://github.com/owner/repo",
  description: "Repository",
  stargazers_count: 42,
  language: "JavaScript",
  fork: false,
  archived: false,
  mirror_url: null,
  pushed_at: "2026-05-15T00:00:00.000Z",
  updated_at: "2026-05-15T00:00:00.000Z",
};

describe("fetch ranking integration boundaries", () => {
  it("builds a complete snapshot from mocked Search API responses", async () => {
    const fetchImpl = vi.fn(async () =>
      response({
        total_count: 1,
        incomplete_results: false,
        items: [githubItem],
      }),
    ) as unknown as typeof fetch;

    const snapshot = await buildSnapshot({
      fetchImpl,
      languages: [
        { language: "JavaScript", slug: "javascript", displayName: "JavaScript", enabled: true },
      ],
      now: new Date("2026-05-16T00:00:00.000Z"),
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(snapshot.overall[0]?.fullName).toBe("owner/repo");
    expect(snapshot.languages[0]?.items[0]?.primaryLanguage).toBe("JavaScript");
    expect(snapshot.source.requestCount).toBe(2);
  });

  it("treats fatal response failures as fetch errors", async () => {
    await expect(
      fetchSearchRanking({
        fetchImpl: (async () =>
          response({}, { ok: false, status: 500 })) as unknown as typeof fetch,
        snapshotAt: "2026-05-16T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(FatalFetchError);
  });
});
