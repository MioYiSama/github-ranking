import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";

const API = "https://api.github.com/search/repositories";
const PER_PAGE = 100;
const PAGES = 10; // Search API caps results at 1000.
const OUT_DIR = join(import.meta.dirname, "..", "rankings");

interface ApiRepo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  license: { spdx_id: string | null } | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  pushed_at: string;
  archived: boolean;
  owner: { login: string; avatar_url: string };
}

interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: ApiRepo[];
}

const token = process.env.GITHUB_TOKEN;
const MAX_RETRIES = 5;
/** Epoch ms when the exhausted primary rate-limit window resets; 0 = not exhausted. */
let resetAt = 0;

async function fetchPage(page: number): Promise<SearchResponse> {
  const url = new URL(API);
  url.searchParams.set("q", "stars:>1");
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "github-ranking",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  for (let attempt = 1; ; attempt++) {
    // Primary limit (search: 30/min authenticated, 10/min anonymous): if the
    // previous response used up the window, sleep until it resets.
    if (resetAt > Date.now()) {
      const waitMs = resetAt - Date.now();
      console.log(`page ${page}: rate limit exhausted, waiting ${Math.ceil(waitMs / 1000)}s`);
      await setTimeout(waitMs);
    }

    const res = await fetch(url, { headers });
    trackRateLimit(res);
    if (res.ok) return (await res.json()) as SearchResponse;

    const body = await res.text();
    const retryAfter = res.headers.get("retry-after");
    const primary = res.headers.get("x-ratelimit-remaining") === "0";
    const secondary = retryAfter !== null || /rate limit/i.test(body);
    const rateLimited = res.status === 429 || (res.status === 403 && (primary || secondary));
    if (!rateLimited || attempt > MAX_RETRIES) {
      throw new Error(`page ${page}: ${res.status} ${res.statusText}\n${body}`);
    }

    if (primary) {
      // resetAt was updated by trackRateLimit; the loop head waits for it.
      console.warn(`page ${page}: primary rate limit hit (attempt ${attempt})`);
      continue;
    }
    // Secondary limit: honour retry-after, otherwise back off exponentially
    // starting at one minute, as GitHub recommends.
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : 60_000 * 2 ** (attempt - 1);
    console.warn(`page ${page}: secondary rate limit hit, retrying in ${Math.ceil(waitMs / 1000)}s`);
    await setTimeout(waitMs);
  }
}

function trackRateLimit(res: Response): void {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  if (remaining === "0" && reset) resetAt = Number(reset) * 1000 + 1000;
}

const seen = new Set<number>();
const repos: ApiRepo[] = [];
for (let page = 1; page <= PAGES; page++) {
  const data = await fetchPage(page);
  if (data.incomplete_results) console.warn(`page ${page}: GitHub reported incomplete results`);
  // Star counts shift between requests, so a repo can appear on two pages.
  for (const repo of data.items) {
    if (seen.has(repo.id)) continue;
    seen.add(repo.id);
    repos.push(repo);
  }
  console.log(`page ${page}: ${data.items.length} items (total ${repos.length})`);
  if (data.items.length < PER_PAGE) break;
}

repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

const now = new Date();
const date = now.toISOString().slice(0, 10); // UTC, YYYY-MM-DD
const output = {
  date,
  fetched_at: now.toISOString(),
  count: repos.length,
  repositories: repos.map((r, i) => ({
    rank: i + 1,
    id: r.id,
    full_name: r.full_name,
    owner: r.owner.login,
    avatar_url: r.owner.avatar_url,
    html_url: r.html_url,
    description: r.description,
    language: r.language,
    topics: r.topics ?? [],
    license: r.license?.spdx_id ?? null,
    stars: r.stargazers_count,
    forks: r.forks_count,
    open_issues: r.open_issues_count,
    archived: r.archived,
    created_at: r.created_at,
    pushed_at: r.pushed_at,
  })),
};

await mkdir(OUT_DIR, { recursive: true });
const file = join(OUT_DIR, `${date}.json`);
await writeFile(file, JSON.stringify(output, null, 2) + "\n");
console.log(`wrote ${repos.length} repositories to ${file}`);
