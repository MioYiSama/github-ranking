import type { Ranking } from "./types.ts";

// Production builds point this at the repo's raw files (see .github/workflows/pages.yml);
// the dev server serves the local rankings/ folder from the project root.
const BASE: string = import.meta.env.VITE_RANKINGS_BASE ?? "rankings/";

function utcDate(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);
}

/** Today's ranking, or yesterday's if today's has not been fetched yet (dates are UTC). */
export async function loadLatestRanking(): Promise<Ranking> {
  for (const daysAgo of [0, 1]) {
    const date = utcDate(daysAgo);
    const res = await fetch(`${BASE}${date}.json`);
    if (res.ok) return (await res.json()) as Ranking;
    if (res.status !== 404) throw new Error(`${date}.json: ${res.status} ${res.statusText}`);
  }
  throw new Error(`No ranking for ${utcDate(0)} or ${utcDate(1)}`);
}
