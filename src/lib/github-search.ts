import { buildRankingEntries, type RepositoryRankingInput } from "./ranking";

export const GITHUB_API_VERSION = "2026-03-10";
export const GITHUB_SEARCH_ENDPOINT = "https://api.github.com/search/repositories";

export interface GitHubSearchOptions {
  language?: string;
  page?: number;
  perPage?: number;
}

export interface GitHubSearchHeaders {
  accept: string;
  "x-github-api-version": string;
  authorization?: string;
}

interface GitHubOwner {
  login?: string;
}

export interface GitHubRepositorySearchItem {
  id?: number;
  node_id?: string | null;
  name?: string;
  full_name?: string;
  owner?: GitHubOwner | null;
  html_url?: string;
  description?: string | null;
  topics?: string[] | null;
  stargazers_count?: number;
  language?: string | null;
  fork?: boolean;
  archived?: boolean;
  mirror_url?: string | null;
  pushed_at?: string | null;
  updated_at?: string | null;
}

export interface GitHubRepositorySearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepositorySearchItem[];
}

export interface NormalizedSearchResult {
  query: string;
  totalCount: number;
  incompleteResults: boolean;
  items: ReturnType<typeof buildRankingEntries>;
}

export class GitHubSearchError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubSearchError";
  }
}

export function buildSearchQuery(language?: string): string {
  const qualifiers = ["stars:>=1", "fork:false", "archived:false", "mirror:false", "is:public"];

  if (language) {
    qualifiers.push(`language:${language}`);
  }

  return qualifiers.join(" ");
}

export function buildRepositorySearchUrl(options: GitHubSearchOptions = {}): URL {
  const url = new URL(GITHUB_SEARCH_ENDPOINT);

  url.searchParams.set("q", buildSearchQuery(options.language));
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(options.perPage ?? 100));
  url.searchParams.set("page", String(options.page ?? 1));

  return url;
}

export function createGitHubSearchHeaders(token?: string): GitHubSearchHeaders {
  const headers: GitHubSearchHeaders = {
    accept: "application/vnd.github+json",
    "x-github-api-version": GITHUB_API_VERSION,
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

export function normalizeGitHubSearchResponse(
  response: GitHubRepositorySearchResponse,
  options: { snapshotAt: string; language?: string } = { snapshotAt: new Date().toISOString() },
): NormalizedSearchResult {
  if (!Array.isArray(response.items)) {
    throw new GitHubSearchError("GitHub Search response did not include an items array");
  }

  const inputs: RepositoryRankingInput[] = response.items.flatMap((item) => {
    if (
      !item.id ||
      !item.name ||
      !item.full_name ||
      !item.html_url ||
      typeof item.stargazers_count !== "number"
    ) {
      return [];
    }

    const primaryLanguage = item.language ?? null;

    if (options.language && primaryLanguage !== options.language) {
      return [];
    }

    const [ownerFromFullName = "", nameFromFullName = ""] = item.full_name.split("/");
    const owner = item.owner?.login ?? ownerFromFullName;
    const name = item.name ?? nameFromFullName;

    return [
      {
        id: item.id,
        nodeId: item.node_id ?? null,
        owner,
        name,
        fullName: item.full_name,
        htmlUrl: item.html_url,
        description: item.description ?? null,
        topics: Array.isArray(item.topics) ? item.topics : [],
        stars: item.stargazers_count,
        primaryLanguage,
        fork: item.fork ?? false,
        archived: item.archived ?? false,
        mirror: item.mirror_url ? true : false,
        pushedAt: item.pushed_at ?? null,
        updatedAt: item.updated_at ?? null,
      },
    ];
  });

  return {
    query: buildSearchQuery(options.language),
    totalCount: response.total_count,
    incompleteResults: response.incomplete_results,
    items: buildRankingEntries(inputs, options.snapshotAt),
  };
}
