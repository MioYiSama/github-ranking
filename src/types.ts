/** Shape of `rankings/<date>.json`, written by scripts/fetch.ts. */
export interface Ranking {
  date: string;
  fetched_at: string;
  count: number;
  repositories: RankedRepo[];
}

export interface RankedRepo {
  rank: number;
  id: number;
  full_name: string;
  owner: string;
  avatar_url: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics: string[];
  license: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  archived: boolean;
  created_at: string;
  pushed_at: string;
}
