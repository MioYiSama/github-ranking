import type { Ranking, RankingIndex } from "./types.ts";

// Production builds point this at the repo's raw files (see .github/workflows/pages.yml);
// the dev server serves the local rankings/ folder from the project root.
const BASE: string = import.meta.env.VITE_RANKINGS_BASE ?? "rankings/";
const DAY_MS = 86_400_000;

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(`${BASE}${file}`);
  if (!res.ok) throw new Error(`${file}: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/** Dates with a ranking file, newest first. */
export async function loadIndex(): Promise<string[]> {
  const { dates } = await fetchJson<RankingIndex>("index.json");
  if (dates.length === 0) throw new Error("No rankings yet");
  return dates;
}

// Each file is ~1 MB; keep them so flipping between dates doesn't refetch.
const cache = new Map<string, Promise<Ranking>>();

export function loadRanking(date: string): Promise<Ranking> {
  let pending = cache.get(date);
  if (!pending) {
    pending = fetchJson<Ranking>(`${date}.json`);
    // A failed load must not stick, or Retry would replay the same error.
    pending.catch(() => cache.delete(date));
    cache.set(date, pending);
  }
  return pending;
}

/** The base for a single day's star diff: the day before, if that day was fetched. */
export function defaultBase(dates: string[], date: string): string | null {
  const prev = new Date(Date.parse(`${date}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
  return dates.includes(prev) ? prev : null;
}
