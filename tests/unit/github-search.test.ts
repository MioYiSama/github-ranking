import { describe, expect, it } from "vitest";
import {
  buildRepositorySearchUrl,
  buildSearchQuery,
  createGitHubSearchHeaders,
  normalizeGitHubSearchResponse,
} from "../../src/lib/github-search";

describe("GitHub Search helpers", () => {
  it("builds overall and language-qualified queries", () => {
    expect(buildSearchQuery()).toBe("stars:>=1 fork:false archived:false mirror:false is:public");
    expect(buildSearchQuery("C++")).toBe(
      "stars:>=1 fork:false archived:false mirror:false is:public language:C++",
    );

    const url = buildRepositorySearchUrl({ language: "C++" });
    expect(url.searchParams.get("q")).toBe(
      "stars:>=1 fork:false archived:false mirror:false is:public language:C++",
    );
    expect(url.searchParams.get("sort")).toBe("stars");
    expect(url.searchParams.get("per_page")).toBe("100");
  });

  it("creates token-safe request headers", () => {
    expect(createGitHubSearchHeaders()).not.toHaveProperty("authorization");
    expect(createGitHubSearchHeaders("secret").authorization).toBe("Bearer secret");
  });

  it("normalizes GitHub repository search responses", () => {
    const normalized = normalizeGitHubSearchResponse(
      {
        total_count: 2,
        incomplete_results: false,
        items: [
          {
            id: 1,
            node_id: "node",
            name: "repo",
            full_name: "owner/repo",
            owner: { login: "owner" },
            html_url: "https://github.com/owner/repo",
            description: undefined,
            stargazers_count: 12,
            language: "JavaScript",
            fork: false,
            archived: false,
            mirror_url: null,
            pushed_at: "2026-05-15T00:00:00.000Z",
            updated_at: "2026-05-15T00:00:00.000Z",
          },
        ],
      },
      { snapshotAt: "2026-05-16T00:00:00.000Z", language: "JavaScript" },
    );

    expect(normalized.items).toHaveLength(1);
    expect(normalized.items[0]).toMatchObject({
      rank: 1,
      fullName: "owner/repo",
      description: null,
      stars: 12,
      primaryLanguage: "JavaScript",
    });
  });
});
