import { describe, expect, it } from "vitest";
import { FatalFetchError, fetchSearchRanking } from "../../scripts/fetch-rankings.mjs";

function response(
  json: unknown,
  init: { ok?: boolean; status?: number; remaining?: string; throwJson?: boolean } = {},
) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "x-ratelimit-remaining" ? (init.remaining ?? "25") : null,
    },
    json: async () => {
      if (init.throwJson) {
        throw new Error("bad json");
      }

      return json;
    },
  };
}

describe("fetch failure behavior", () => {
  it("fails on malformed JSON", async () => {
    await expect(
      fetchSearchRanking({
        fetchImpl: (async () => response({}, { throwJson: true })) as unknown as typeof fetch,
        snapshotAt: "2026-05-16T00:00:00.000Z",
      }),
    ).rejects.toThrow(/Malformed JSON/);
  });

  it("fails when overall ranking has no usable entries", async () => {
    await expect(
      fetchSearchRanking({
        fetchImpl: (async () =>
          response({
            total_count: 1,
            incomplete_results: false,
            items: [{ id: 1 }],
          })) as unknown as typeof fetch,
        snapshotAt: "2026-05-16T00:00:00.000Z",
      }),
    ).rejects.toThrow(/no usable repository entries/);
  });

  it("fails on primary rate-limit exhaustion", async () => {
    await expect(
      fetchSearchRanking({
        fetchImpl: (async () =>
          response({}, { ok: false, status: 403, remaining: "0" })) as unknown as typeof fetch,
        snapshotAt: "2026-05-16T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(FatalFetchError);
  });
});
