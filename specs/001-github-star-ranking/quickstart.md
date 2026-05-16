# Quickstart: GitHub Repository Star Ranking

## Prerequisites

- Node.js 26+
- pnpm
- Astro 7 prerelease (`astro@beta` if available; otherwise exact `astro@alpha` until beta exists)
- Vite 8
- TypeScript 6
- `@types/node`
- AJV for snapshot schema validation
- Playwright browsers installed for visual regression tests
- A GitHub repository with Pages enabled under Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
- Optional local `GITHUB_TOKEN` for fetching public repository rankings during development

## Install

```bash
pnpm install
pnpm exec playwright install --with-deps chromium
```

## Local Data Fetch

```bash
GITHUB_TOKEN=... pnpm data:fetch
```

The live fetch is intentionally throttled to stay under GitHub Search API limits while collecting 1000 overall entries and one page per language by default. If no token is provided, local fetch may hit lower limits. Tests should rely on fixtures instead of live API calls.

Optional fetch controls:

- `GITHUB_RANKING_LANGUAGE_PAGES=10` collects up to 1000 entries per language, but is much more likely to hit GitHub Search secondary limits.
- `GITHUB_SEARCH_INTERVAL_MS=12000` slows requests further for stricter CI behavior.
- `GITHUB_SEARCH_SECONDARY_RETRY_MS=300000` waits longer after secondary rate-limit responses.

## Development

```bash
pnpm dev
```

## Validation

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:visual
pnpm build
```

Expected script mapping:

```json
{
  "scripts": {
    "dev": "astro dev",
    "data:fetch": "node scripts/fetch-rankings.mjs",
    "build": "pnpm data:fetch && astro build",
    "build:static": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots",
    "typecheck": "astro check",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
    "check": "pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build:static && pnpm test:visual"
  }
}
```

## Visual Regression

- Configure `playwright.config.ts` to serve the built site or Astro preview before tests.
- Commit Linux screenshot baselines generated in CI-compatible conditions.
- Cover overall ranking, a language ranking, stale snapshot messaging, and empty-state layout.
- Use `tests/visual/screenshot.css` to hide or stabilize any volatile elements before screenshots.
- Update baselines only for intentional UI changes and review image diffs in pull requests.

## GitHub Pages Deployment

Create `.github/workflows/deploy.yml` during implementation with:

- `schedule` for daily refresh.
- `workflow_dispatch` for manual refresh.
- `push` on the default branch.
- `permissions`: `contents: read`, `pages: write`, `id-token: write`.
- `actions/checkout`.
- `actions/setup-node`.
- `pnpm/action-setup` unless using Corepack directly.
- `actions/configure-pages`.
- pnpm install.
- ranking data fetch.
- Astro static build.
- Vitest checks.
- Playwright visual regression checks.
- AJV snapshot schema contract checks.
- `actions/upload-pages-artifact`.
- `actions/deploy-pages`.

`withastro/action` is allowed only if it is compatible with the pinned Astro 7 prerelease/Vite 8 setup and keeps the fetch, validation, build, artifact, and deploy phases reviewable.

Before the first run, enable Pages in repository settings and select GitHub Actions as the build and deployment source. `actions/configure-pages` can read Pages metadata with the built-in `GITHUB_TOKEN`, but automatic Pages enablement requires a separate token with repository administration or Pages write permission.

Deployment must happen only after data fetch and build succeed. If a scheduled run fails, do not deploy a new artifact; the previous GitHub Pages deployment remains the visitor-facing fallback.

## Configuration

- Configure language rankings in `src/config/languages.ts`.
- Configure GitHub Pages `site` and `base` in `astro.config.mjs`; project Pages should use the repository name as `base` unless a custom domain is configured.
- Configure TypeScript 6 explicitly with `types`, modern module resolution, and no deprecated ES5/classic/outFile-era options.
- Pin Astro 7 prerelease exactly while it remains alpha/beta, and review release notes before bumping.
- Keep `GITHUB_TOKEN` server-side in Actions/local shell only.

## Formatter Note

`oxfmt` is the formatter for supported project files such as JS, TS, JSON, Markdown, CSS, and package metadata. Current Oxfmt compatibility does not provide full Astro file formatting, so `.astro` files must remain covered by Astro diagnostics, build validation, review, and local component conventions.
