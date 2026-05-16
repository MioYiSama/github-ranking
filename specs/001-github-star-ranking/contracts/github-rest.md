# Contract: GitHub REST Data Fetch

## Purpose

Define the build-time integration contract for fetching repository rankings from GitHub REST Search. No browser code calls GitHub REST API directly.

## Authentication

- Local development may use `GITHUB_TOKEN` from the shell environment.
- GitHub Actions uses the workflow-provided `GITHUB_TOKEN`.
- Tokens must never be emitted into generated JSON, static HTML, client-side JavaScript, logs, or committed files.

## API Version

- Requests send `Accept: application/vnd.github+json`.
- Requests send `X-GitHub-Api-Version: 2026-03-10` unless implementation research during tasks finds a repository-specific reason to pin an older supported version.

## Endpoints

### Overall Ranking

- Method: `GET`
- Endpoint: `https://api.github.com/search/repositories`
- Query:
  - `q=stars:>=1 fork:false archived:false mirror:false is:public`
  - `sort=stars`
  - `order=desc`
  - `per_page=100`
  - `page=1..10`

### Language Ranking

- Method: `GET`
- Endpoint: `https://api.github.com/search/repositories`
- Query:
  - `q=stars:>=1 fork:false archived:false mirror:false is:public language:{language}`
  - `sort=stars`
  - `order=desc`
  - `per_page=100`
  - `page=1` by default, configurable up to `page=1..10`

## Required Response Handling

- Read `items`, `total_count`, and `incomplete_results`.
- Normalize `stargazers_count` to `stars`.
- Normalize `full_name`, `html_url`, `description`, `language`, `fork`, `archived`, `mirror_url`, `pushed_at`, and `updated_at`.
- Treat `incomplete_results: true` as a warning retained in snapshot metadata, not as a fatal failure, unless the response has no usable items for a required ranking.
- Treat non-2xx status, malformed JSON, schema-invalid normalized output, or primary rate-limit exhaustion as fatal for the current workflow run.
- Fatal failures prevent deployment, preserving the previous successful GitHub Pages deployment.

## Rate-Limit Behavior

- Requests are sequential or low-concurrency.
- Implementation must observe `x-ratelimit-*` and `retry-after` headers when present.
- Implementation must avoid retry loops that can worsen primary or secondary rate limiting.
- Daily default language set must keep the number of Search requests comfortably below the authenticated Search limit and reduce secondary-limit risk.

## Schedule

- Workflow runs daily on a non-top-of-hour UTC cron.
- Workflow also supports `workflow_dispatch`.
- Default-branch pushes may trigger build/deploy after tests pass.
