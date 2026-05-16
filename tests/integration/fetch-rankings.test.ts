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
      requestIntervalMs: 0,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(snapshot.overall[0]?.fullName).toBe("owner/repo");
    expect(snapshot.languages[0]?.items[0]?.primaryLanguage).toBe("JavaScript");
    expect(snapshot.source.requestCount).toBe(2);
  });

  it("keeps language fetches shallow by default while collecting 1000 overall entries", async () => {
    const pageItems = (page: number) =>
      Array.from({ length: 100 }, (_, index) => ({
        ...githubItem,
        id: page * 1000 + index,
        name: `repo-${page}-${index}`,
        full_name: `owner/repo-${page}-${index}`,
      }));
    const fetchImpl = vi.fn(async (url: URL) => {
      const page = Number(url.searchParams.get("page") ?? "1");

      return response({
        total_count: 1000,
        incomplete_results: false,
        items: pageItems(page),
      });
    }) as unknown as typeof fetch;

    const snapshot = await buildSnapshot({
      fetchImpl,
      languages: [
        { language: "JavaScript", slug: "javascript", displayName: "JavaScript", enabled: true },
      ],
      now: new Date("2026-05-16T00:00:00.000Z"),
      requestIntervalMs: 0,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(11);
    expect(snapshot.overall).toHaveLength(1000);
    expect(snapshot.languages[0]?.items).toHaveLength(100);
    expect(snapshot.source.requestCount).toBe(11);
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

  it("retries GitHub Search rate-limit responses", async () => {
    const sleep = vi.fn(async () => undefined);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response(
          { message: "You have exceeded a secondary rate limit." },
          { ok: false, status: 403, remaining: "1" },
        ),
      )
      .mockResolvedValueOnce(
        response({
          total_count: 1,
          incomplete_results: false,
          items: [githubItem],
        }),
      ) as unknown as typeof fetch;

    const ranking = await fetchSearchRanking({
      fetchImpl,
      snapshotAt: "2026-05-16T00:00:00.000Z",
      sleep,
      requestIntervalMs: 0,
      secondaryRateLimitRetryMs: 123,
      log: () => undefined,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(123);
    expect(ranking.items[0]?.fullName).toBe("owner/repo");
    expect(ranking.requestCount).toBe(2);
  });
});
