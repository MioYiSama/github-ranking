# Implementation Plan: GitHub Repository Star Ranking

**Branch**: `001-github-star-ranking` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-github-star-ranking/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a public, read-only static ranking site that shows the top GitHub repositories overall and by language. Use the Astro 7 prerelease channel for Vite 8 support to generate static pages at build time, Tailwind CSS v4 through the Vite plugin for styling, TypeScript 6 for type checking, Playwright for visual regression testing, a scheduled GitHub Actions workflow to fetch GitHub REST API ranking snapshots daily, and GitHub Pages for deployment. The latest successful Pages deployment remains the public fallback if a later data refresh or build fails.

## Technical Context

**Language/Version**: Astro 7 prerelease channel (`astro@beta` if available; otherwise `astro@alpha` pinned exactly until beta exists) with TypeScript 6, TypeScript-flavored Astro frontmatter, and Node.js ESM data scripts on Node.js 26+.

**Primary Dependencies**: `astro@beta` or exact `astro@alpha` prerelease for Astro 7, `vite@^8`, `typescript@^6`, `@types/node`, `tailwindcss@^4`, `@tailwindcss/vite@^4`, `vitest`, `@playwright/test`, `ajv`, `oxlint`, `oxfmt`, and `@astrojs/check`. Workflow dependencies use official actions: `actions/checkout`, `actions/setup-node`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, and `pnpm/action-setup` unless Corepack is used instead. `withastro/action` is allowed if it proves compatible with Astro 7 prerelease/Vite 8 and does not obscure the data-fetch/build/test/deploy gates. GitHub REST API calls use Node's native `fetch`; no GitHub API SDK is planned.

**Storage**: Generated JSON snapshot files in the build workspace under `src/data/generated/`. No database or server-side runtime storage. The deployed static artifact is the source of truth for visitors until the next successful deployment.

**Testing**: `pnpm typecheck`, `pnpm test`, `pnpm test:visual`, `pnpm lint`, `pnpm format:check`, `pnpm build`, fixture-based fetch tests, AJV-backed JSON Schema contract checks, Playwright visual regression screenshots for key ranking pages, and static-page smoke tests after build.

**Target Platform**: GitHub Pages serving static HTML, CSS, and JavaScript; GitHub Actions on Ubuntu for scheduled data fetch, Astro build, and Pages deployment.

**Project Type**: Static web application with a build-time data collector.

**Performance Goals**: Overall and language ranking pages should be usable within 2 seconds on standard broadband after the static assets are served; generated ranking pages should handle 1000 entries with virtualized rendering where needed; Vite 8/Rolldown should keep production build time within 2 minutes for the MVP data set; the scheduled fetch/build/test/deploy workflow should complete within 12 minutes under normal API conditions.

**Constraints**: No server runtime, no visitor authentication, no client-side GitHub API token, no hard-coded secrets, daily refresh under normal conditions, stale data marked after 36 hours, Search API result and rate limits respected, GitHub Pages source configured for GitHub Actions. Astro 7 is prerelease and Vite 8 uses Rolldown, so implementation must pin exact prerelease versions, document upgrade notes, and keep rollback notes to the latest Astro 6/Vite 7 plan if prerelease blockers appear. Playwright screenshots must be generated and compared on the same Linux CI environment to reduce font/rendering noise. `oxfmt` does not currently provide full Astro file formatting, so formatter coverage is limited to supported JS/TS/JSON/MD/CSS-style files while `.astro` quality is enforced through Astro checks, build, visual tests, review, and focused component conventions.

**Scale/Scope**: Top 1000 repositories overall and top 100 for each configured language ranking by default, with language rankings configurable up to top 1000 when GitHub Search limits allow. Initial language set is a curated, configurable list sized to stay within GitHub Search API limits for one daily run.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Dependency Discipline**: PASS. New dependencies are listed with purpose and alternatives:
  - Astro 7 prerelease (`astro@beta` if available, otherwise exact `astro@alpha`): static site generation requested by user and selected specifically for Vite 8 support. Alternatives considered were Astro 6/Vite 7 and plain Vite 8. Astro 7 prerelease is chosen because the user explicitly requested Vite 8 through Astro; risk is mitigated by exact pinning, CI validation, and rollback notes.
  - `tailwindcss@^4` and `@tailwindcss/vite@^4`: styling requested by user; alternative was plain CSS modules. Chosen for utility styling and official Tailwind v4 Vite integration.
  - `vite@^8`: requested by user and required for the intended Astro 7 prerelease path. Alternative was Vite 7 through Astro 6, rejected by current user direction.
  - `typescript@^6`: requested by user and stable as of the current plan date; TypeScript 6 migration defaults require explicit `types`, modern `moduleResolution`, and no deprecated ES5/classic/outFile settings.
  - `@types/node`: required for TypeScript 6 to type Node build/data scripts explicitly. Alternative was ambient or untyped Node globals, rejected because TypeScript 6 favors explicit `types` and stricter project boundaries.
  - `vitest`: requested by user for unit and contract tests; alternative was Node's built-in test runner, rejected because Vitest aligns with Vite/Astro config.
  - `@playwright/test`: requested by user for visual regression tests; alternative was image snapshots through a custom script, rejected because Playwright provides built-in screenshot assertions, browser automation, web server orchestration, and CI-friendly reports.
  - `ajv`: validates `contracts/data-snapshot.schema.json` against generated snapshots in contract tests and build-time sanity checks. Alternative was a hand-written validator, rejected because schema drift is easier to miss and the project already has a formal JSON Schema contract.
  - `oxlint`: requested by user for linting; alternative was ESLint, rejected to keep the requested Oxc toolchain and faster CI.
  - `oxfmt`: requested by user for formatting; alternative was Prettier, rejected for now to avoid adding a second formatter. Limitation: no full `.astro` formatting coverage.
  - `@astrojs/check`: required for Astro diagnostics alongside TypeScript 6; maintenance cost is low and standard for Astro projects.
  - GitHub Actions `actions/checkout`, `actions/setup-node`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, and `pnpm/action-setup` unless replaced by Corepack: official or focused workflow dependencies for checkout, Node/pnpm setup, Pages configuration, artifact upload, and deployment. `withastro/action` may be used only if compatible with Astro 7 prerelease/Vite 8 and transparent about build/deploy steps. No third-party deploy action planned.
- **Code Quality**: PASS. Design uses a single Astro project, typed data normalization, deterministic sorting, fixture-driven tests, isolated data-fetch code, and clear generated-data boundaries. No broad refactor or extra architectural layer is planned.
- **Test Completeness**: PASS. Planned tests cover ranking order, language query construction, metadata normalization, stale snapshot logic, failed fetch behavior, route generation, AJV snapshot data contract, static build, UI smoke coverage, and Playwright visual baselines for overall, language, empty, and stale states.
- **Code Review Readiness**: PASS. Review evidence must include dependency rationale, Astro 7/Vite 8 prerelease pin, generated snapshot sample, API limit handling, fixture test output, visual diff report, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm test:visual`, `pnpm typecheck`, and `pnpm build`.

All gates pass. No constitution exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/001-github-star-ranking/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── data-snapshot.schema.json
│   ├── github-rest.md
│   └── routes.md
├── checklists/
│   ├── ranking.md
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── deploy.yml

public/
└── favicon.svg

scripts/
└── fetch-rankings.mjs

src/
├── components/
│   ├── LanguageNav.astro
│   ├── RankingTable.astro
│   ├── RepositoryRow.astro
│   └── SnapshotStatus.astro
├── config/
│   └── languages.ts
├── data/
│   ├── fixtures/
│   │   └── rankings.sample.json
│   └── generated/
│       └── rankings.json
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   ├── github-search.ts
│   ├── ranking.ts
│   ├── snapshot.ts
│   └── slugs.ts
├── pages/
│   ├── index.astro
│   └── languages/
│       └── [slug].astro
└── styles/
    └── global.css

tests/
├── contract/
│   └── snapshot-contract.test.ts
├── integration/
│   └── fetch-rankings.test.ts
├── unit/
│   ├── github-search.test.ts
│   ├── ranking.test.ts
│   └── slugs.test.ts
└── smoke/
    └── static-pages.test.ts

tests/visual/
├── overall-ranking.spec.ts
├── language-ranking.spec.ts
├── empty-language.spec.ts
├── stale-snapshot.spec.ts
├── screenshot.css
├── overall-ranking.spec.ts-snapshots/
├── language-ranking.spec.ts-snapshots/
├── empty-language.spec.ts-snapshots/
└── stale-snapshot.spec.ts-snapshots/

astro.config.mjs
package.json
playwright.config.ts
pnpm-lock.yaml
tsconfig.json
vitest.config.ts
.oxlintrc.json
.oxfmtrc.json
```

**Structure Decision**: Use one root Astro static app plus one build-time data script. Keep GitHub API access in `scripts/` and `src/lib/` so public pages consume only generated JSON. Keep all ranking UI in reusable Astro components and all deterministic sorting/normalization in testable library modules. Keep Playwright visual regression specs and committed Linux baselines under `tests/visual/` so UI changes are reviewed explicitly.

## Complexity Tracking

No constitution violations or justified complexity exceptions.

## Post-Design Constitution Check

- **Dependency Discipline**: PASS. Research and design artifacts keep the dependency list bounded to the user-requested Astro/Tailwind/Vite/Vitest/Oxc/Playwright stack plus Astro diagnostics, explicit Node typings, AJV contract validation, and official GitHub Actions, with Astro 7 prerelease risk explicitly documented.
- **Code Quality**: PASS. Data contracts, route contracts, and data model define stable boundaries for fetch, normalize, generate, and render responsibilities.
- **Test Completeness**: PASS. Design artifacts define unit, integration, AJV-backed contract, build, static smoke, and Playwright visual regression coverage for primary flows, edge cases, failure modes, integration boundaries, and responsive layout states.
- **Code Review Readiness**: PASS. Quickstart documents the validation commands and review evidence expected before merge.
