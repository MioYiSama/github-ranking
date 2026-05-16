export interface RepositoryRankingEntry {
  rank: number;
  id: number;
  nodeId: string | null;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  fork: boolean;
  archived: boolean;
  mirror: boolean | null;
  pushedAt?: string | null;
  updatedAt?: string | null;
  snapshotAt: string;
}

export interface LanguageRanking {
  language: string;
  slug: string;
  displayName: string;
  totalCount: number;
  incompleteResults: boolean;
  query: string;
  generatedAt: string;
  items: RepositoryRankingEntry[];
}

export interface RankingSnapshot {
  schemaVersion: "1.0.0";
  generatedAt: string;
  staleAfter: string;
  source: {
    api: "github-rest-search";
    apiVersion: string;
    workflowRunId?: string | null;
    requestCount: number;
    rateLimitRemaining?: number | null;
  };
  overall: RepositoryRankingEntry[];
  languages: LanguageRanking[];
  errors?: string[];
}

export interface LanguageConfig {
  language: string;
  slug: string;
  displayName: string;
  enabled: boolean;
}

export interface FetchRun {
  startedAt: string;
  completedAt: string;
  status: "success" | "failure";
  requestCount: number;
  rateLimitRemaining: number | null;
  fatalError: string | null;
  warnings: string[];
}
