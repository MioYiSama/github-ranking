# GitHub Star Rankings

Static GitHub repository star rankings with an overall top list, language-specific pages, visible snapshot freshness, and a scheduled GitHub Pages deployment path.

## Features

- Overall ranking for eligible public repositories, sorted by snapshot star count.
- Virtualized 1000-row overall ranking powered by TanStack Virtual core.
- Curated language rankings at stable `/languages/{slug}/` routes.
- Snapshot freshness status with stale-data messaging after 36 hours.
- Build-time GitHub REST Search fetches only; visitor browsers never call GitHub APIs.
- Unit, integration, contract, smoke, and Playwright visual regression tests.

## Local Setup

Prerequisites:

- Node.js 22.12+
- pnpm 11+

Install dependencies:

```bash
pnpm install
```

Run the static site with fixture data:

```bash
pnpm dev
```

Fetch live ranking data locally:

```bash
GITHUB_TOKEN=... pnpm data:fetch
```

Without a token, GitHub Search API rate limits may be lower.

Regenerate deterministic 1000-row demo data:

```bash
pnpm data:demo
```

## Validation

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build:static
pnpm test:visual
```

Use `pnpm test:visual:update` only for intentional visual baseline changes.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main`, manual dispatch, and a daily schedule. Deployment happens only after dependencies install, ranking data fetches successfully, tests pass, the static build succeeds, and visual tests pass. If a scheduled refresh fails before deployment, GitHub Pages keeps serving the previous successful artifact.

Set repository Pages source to GitHub Actions. The workflow uses the built-in `GITHUB_TOKEN`; do not add visitor-facing or client-side tokens.
