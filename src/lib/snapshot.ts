import type { RankingSnapshot } from "./types";

export const SNAPSHOT_SCHEMA_VERSION = "1.0.0";
export const STALE_AFTER_HOURS = 36;

export type SnapshotState = "fresh" | "stale";

export interface SnapshotStatus {
  state: SnapshotState;
  generatedAt: Date;
  staleAfter: Date;
  label: string;
  detail: string;
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function staleAfterFor(generatedAt: string | Date): string {
  const date = typeof generatedAt === "string" ? new Date(generatedAt) : generatedAt;

  return addHours(date, STALE_AFTER_HOURS).toISOString();
}

export function isSnapshotStale(
  snapshot: Pick<RankingSnapshot, "staleAfter">,
  now: Date = getConfiguredNow(),
): boolean {
  return new Date(snapshot.staleAfter).getTime() <= now.getTime();
}

export function formatUtcDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;

  return (
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

export function getConfiguredNow(): Date {
  const configured = process.env.SNAPSHOT_NOW;

  return configured ? new Date(configured) : new Date();
}

export function getSnapshotStatus(
  snapshot: RankingSnapshot,
  now: Date = getConfiguredNow(),
): SnapshotStatus {
  const generatedAt = new Date(snapshot.generatedAt);
  const staleAfter = new Date(snapshot.staleAfter);
  const stale = isSnapshotStale(snapshot, now);
  const generatedLabel = formatUtcDateTime(generatedAt);

  return {
    state: stale ? "stale" : "fresh",
    generatedAt,
    staleAfter,
    label: stale ? "Stale snapshot" : "Fresh snapshot",
    detail: stale
      ? `Last successful update was ${generatedLabel}; data may no longer match current GitHub stars.`
      : `Last successful update was ${generatedLabel}.`,
  };
}

export function getLanguageRanking(snapshot: RankingSnapshot, slug: string) {
  return snapshot.languages.find((language) => language.slug === slug) ?? null;
}

export function assertSupportedSnapshot(snapshot: RankingSnapshot): void {
  if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`Unsupported snapshot schema version: ${snapshot.schemaVersion}`);
  }
}
