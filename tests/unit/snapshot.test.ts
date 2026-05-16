import { describe, expect, it } from "vitest";
import { getSnapshotStatus, isSnapshotStale, staleAfterFor } from "../../src/lib/snapshot";
import type { RankingSnapshot } from "../../src/lib/types";

const snapshot: RankingSnapshot = {
  schemaVersion: "1.0.0",
  generatedAt: "2026-05-16T00:00:00.000Z",
  staleAfter: "2026-05-17T12:00:00.000Z",
  source: {
    api: "github-rest-search",
    apiVersion: "2026-03-10",
    requestCount: 1,
  },
  overall: [],
  languages: [],
};

describe("snapshot freshness helpers", () => {
  it("calculates stale threshold 36 hours after generation", () => {
    expect(staleAfterFor(snapshot.generatedAt)).toBe("2026-05-17T12:00:00.000Z");
  });

  it("classifies snapshots as fresh or stale", () => {
    expect(isSnapshotStale(snapshot, new Date("2026-05-17T11:59:59.000Z"))).toBe(false);
    expect(isSnapshotStale(snapshot, new Date("2026-05-17T12:00:00.000Z"))).toBe(true);
  });

  it("creates visitor-facing freshness labels", () => {
    expect(getSnapshotStatus(snapshot, new Date("2026-05-16T12:00:00.000Z")).label).toBe(
      "Fresh snapshot",
    );
    expect(getSnapshotStatus(snapshot, new Date("2026-05-18T00:00:00.000Z")).label).toBe(
      "Stale snapshot",
    );
  });
});
