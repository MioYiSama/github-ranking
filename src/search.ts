import type { RankedRepo } from "./types.ts";

// Word-level fuzzy search. Substring-fuzzy matching (Fuse.js and friends) lets one typo land
// inside any longer word ("react" → "practice", "rust" → "crustacean"), which floods results
// once they are sorted by stars instead of relevance. Here a query word must be a prefix of a
// whole word, or that whole word with a few typos.

export interface SearchEntry {
  repo: RankedRepo;
  /** Lowercased full name: a plain substring hit counts ("code" finds vscode). */
  name: string;
  /** Lowercased description, for queries in scripts written without spaces (CJK). */
  desc: string;
  /** Words of the name, topics and language: prefix or typo-tolerant match. */
  idWords: string[];
  /** Words of the description: prefix match only, since prose has too many near-misses. */
  descWords: string[];
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function buildSearchIndex(repos: RankedRepo[]): SearchEntry[] {
  return repos.map((repo) => ({
    repo,
    name: repo.full_name.toLowerCase(),
    desc: repo.description?.toLowerCase() ?? "",
    idWords: [
      ...new Set(words(`${repo.full_name} ${repo.topics.join(" ")} ${repo.language ?? ""}`)),
    ],
    descWords: [...new Set(words(repo.description ?? ""))],
  }));
}

/** Repos matching every word of `query`, in index order. */
export function searchRepos(index: SearchEntry[], query: string): RankedRepo[] {
  const q = query.trim().toLowerCase();
  const terms = words(q);
  const unspaced = /[^\p{ASCII}]/u.test(q);
  return index
    .filter(
      (e) =>
        e.name.includes(q) ||
        (unspaced && e.desc.includes(q)) ||
        (terms.length > 0 && terms.every((t) => matchesTerm(e, t))),
    )
    .map((e) => e.repo);
}

function matchesTerm(e: SearchEntry, term: string): boolean {
  // Short words get no typos: one edit turns "rust" into "rest".
  const typos = term.length < 5 ? 0 : term.length < 9 ? 1 : 2;
  return (
    e.idWords.some((w) => w.startsWith(term) || (typos > 0 && withinEdits(term, w, typos))) ||
    e.descWords.some((w) => w.startsWith(term))
  );
}

/** Optimal-string-alignment distance (edits plus adjacent swaps) between a and b is ≤ max. */
function withinEdits(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  // Three rolling DP rows: two back (for swaps), previous, current.
  let before = new Int32Array(b.length + 1);
  let prev = Int32Array.from({ length: b.length + 1 }, (_, j) => j);
  let cur = new Int32Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let d = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, before[j - 2] + 1);
      }
      cur[j] = d;
      if (d < rowMin) rowMin = d;
    }
    // Every later row is at least this row's minimum.
    if (rowMin > max) return false;
    [before, prev, cur] = [prev, cur, before];
  }
  return prev[b.length] <= max;
}
