import type { Ranking } from "./types.ts";

// Production builds point this at the repo's raw files (see .github/workflows/pages.yml);
// the dev server serves the local rankings/ folder from the project root.
const BASE: string = import.meta.env.VITE_RANKINGS_BASE ?? "rankings/";
const DAY_MS = 86_400_000;

/** The ranking file for a UTC date (YYYY-MM-DD), or null if none was fetched that day. */
async function fetchRanking(date: string): Promise<Ranking | null> {
  const res = await fetch(`${BASE}${date}.json`);
  if (res.ok) return (await res.json()) as Ranking;
  if (res.status === 404) return null;
  throw new Error(`${date}.json: ${res.status} ${res.statusText}`);
}

/** Today's ranking, or yesterday's if today's has not been fetched yet (dates are UTC). */
export async function loadLatestRanking(): Promise<Ranking> {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
  const ranking = (await fetchRanking(today)) ?? (await fetchRanking(yesterday));
  if (!ranking) throw new Error(`No ranking for ${today} or ${yesterday}`);
  return ranking;
}

/** The ranking from the day before `ranking`, or null if that day is missing. */
export function loadPreviousRanking(ranking: Ranking): Promise<Ranking | null> {
  const prev = new Date(Date.parse(`${ranking.date}T00:00:00Z`) - DAY_MS);
  return fetchRanking(prev.toISOString().slice(0, 10));
}
