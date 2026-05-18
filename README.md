# GitHub Star Rankings

[![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?logo=github&logoColor=white)](https://pages.github.com/)

A polished, static GitHub repository leaderboard for discovering the projects developers care about most. GitHub Star Rankings turns public GitHub star data into browsable, shareable ranking pages for the overall ecosystem and major programming languages.

It is built for speed, trust, and easy hosting. There is no backend server, no visitor-facing GitHub token, and no client-side GitHub API dependency. Ranking data is collected at build time, published as a static artifact, and served directly from GitHub Pages.

## Why It Stands Out

- Static by design: fast to host, inexpensive to run, and simple to share.
- Overall top 1000 ranking: the most-starred eligible public repositories in one smooth leaderboard.
- Language rankings: curated pages for Python, Go, Rust, JavaScript, TypeScript, C, C++, Java, Kotlin, and more.
- Freshness indicators: every snapshot shows when it was generated, with stale-data messaging after 36 hours.
- Smooth large-list browsing: the 1000-row overall ranking uses TanStack Virtual core for responsive scrolling.
- Secure data flow: GitHub API access happens only during build or CI, never in the visitor's browser.
- Review-ready quality gates: formatting, linting, type checking, unit tests, contract tests, static builds, and Playwright visual regression coverage.

## Built For

- Developers who want to discover high-signal open source projects quickly.
- Engineering teams watching language and ecosystem momentum.
- Maintainers building public rankings, open source directories, or technical discovery pages.
- Anyone who wants an automated static data site powered by GitHub Actions and GitHub Pages.

## Tech Stack

| Layer                  | Technology                                                    |
| ---------------------- | ------------------------------------------------------------- |
| Static site generation | Astro 7 alpha                                                 |
| Build tooling          | Vite 8 / Rolldown                                             |
| Type system            | TypeScript 6                                                  |
| Styling                | Tailwind CSS 4 + `@tailwindcss/vite`                          |
| Large-list rendering   | TanStack Virtual core                                         |
| Data collection        | Node.js ESM scripts + native `fetch` + GitHub REST Search API |
| Data contracts         | AJV + JSON Schema                                             |
| Testing                | Vitest + Playwright                                           |
| Quality tooling        | oxlint + oxfmt + `astro check`                                |
| Deployment             | GitHub Actions + GitHub Pages                                 |

## Quick Start

Requirements:

- Node.js 26+
- pnpm 11+

Install dependencies:

```bash
pnpm install
```

Run the site locally with fixture data:

```bash
pnpm dev
```

Regenerate deterministic 1000-row demo data:

```bash
pnpm data:demo
```

Fetch live GitHub ranking data:

```bash
GITHUB_TOKEN=... pnpm data:fetch
```

The project can call the GitHub Search API without a token, but anonymous limits are lower. Live fetching is intentionally throttled to reduce the chance of hitting GitHub Search primary or secondary rate limits during scheduled refreshes.

Optional fetch controls:

- `GITHUB_RANKING_LANGUAGE_PAGES=10`: collect up to 1000 entries per language, with higher API pressure.
- `GITHUB_SEARCH_INTERVAL_MS=12000`: slow requests further for stricter CI environments.
- `GITHUB_SEARCH_SECONDARY_RETRY_MS=300000`: wait longer before retrying after secondary rate-limit responses.

## Validation

Run the full project check:

```bash
pnpm check
```

Or run individual checks as needed:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build:static
pnpm test:visual
```

Only update Playwright visual baselines when the UI change is intentional:

```bash
pnpm test:visual:update
```

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `main`, pushes to `001-github-star-ranking`, manual dispatch, and a daily schedule. The workflow installs dependencies, fetches live ranking data, builds the static site, uploads the Pages artifact, and deploys to GitHub Pages.

Before the first deployment, enable GitHub Pages in the repository:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

The workflow uses GitHub's built-in `GITHUB_TOKEN`. Do not add visitor-facing tokens or expose secrets in client-side code or public static assets.
