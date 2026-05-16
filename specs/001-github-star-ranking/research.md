# Research: GitHub Repository Star Ranking

## Decision: Use Astro 7 prerelease for static page generation and Vite 8 support

**Rationale**: The feature is a pure static, public, read-only ranking site. The user explicitly requested Vite 8 support through Astro 7. Astro's April 2026 release notes describe Astro 7 alpha as the first preview with Vite 8 support and the Rust compiler as the default. Use `astro@beta` when available; until then, use an exact `astro@alpha` prerelease pin and record the version in review evidence.

**Alternatives considered**:

- Astro 6 with Vite 7: more stable, but rejected because the user wants Vite 8.
- Plain Vite 8 app: gives direct Vite 8 control, but route generation and content-style static pages would require more custom structure.
- Next.js static export: more framework surface than needed for a read-only static ranking site.

## Decision: Use Vite 8/Rolldown directly through Astro 7 prerelease

**Rationale**: Vite 8 is stable and ships Rolldown as its unified Rust bundler. Astro 7 prerelease is the Astro path that upgrades the framework to Vite 8. The plan should treat Vite 8 compatibility as a first-class review area because integrations/plugins that depend on Vite internals can break.

**Alternatives considered**:

- Vite 7 through Astro 6: lower risk, but not the requested direction.
- `rolldown-vite` on Vite 7: useful migration bridge for complex Vite projects, but unnecessary if the Astro 7 prerelease build passes.

## Decision: Use TypeScript 6 with explicit modern compiler configuration

**Rationale**: The user requested TypeScript 6. TypeScript 6 is a transition release preparing projects for TypeScript 7's native compiler and changes several defaults. The project should explicitly configure `types`, avoid deprecated ES5/classic/outFile-era settings, and use bundler-oriented module resolution compatible with Vite/Astro.

**Alternatives considered**:

- TypeScript 5.9: more conservative, but rejected by user request.
- TypeScript 7 native preview: potentially faster, but it is a larger migration risk and not requested.

## Decision: Add `@types/node` for explicit Node script typing

**Rationale**: The project includes Node ESM scripts for build-time ranking fetches and configuration files that access Node globals and modules. TypeScript 6 projects should declare Node types explicitly rather than relying on ambient availability.

**Alternatives considered**:

- Leave Node scripts loosely typed: lower setup cost, but weakens the TypeScript 6 migration and hides script API mistakes.
- Avoid Node-specific APIs: not realistic for file generation, environment variables, and build-time fetch orchestration.

## Decision: Use Tailwind CSS v4 through `@tailwindcss/vite`

**Rationale**: The user requested Tailwind CSS v4. Tailwind's official Astro guide configures Tailwind v4 as a Vite plugin, which fits Astro's Vite-based build pipeline.

**Alternatives considered**:

- Plain CSS: fewer dependencies, but slower to build consistent ranking UI.
- Older `@astrojs/tailwind` integration: not preferred for Tailwind v4 because the current Tailwind guide uses the Vite plugin.

## Decision: Use pnpm for package management

**Rationale**: The user requested pnpm. It provides deterministic installs through `pnpm-lock.yaml`, good CI behavior, and script execution that exposes local project binaries.

**Alternatives considered**:

- npm: built into Node, but user explicitly requested pnpm.
- bun/yarn: no stated project need and would add unnecessary variance.

## Decision: Use GitHub REST Search API with native `fetch`

**Rationale**: The user requested GitHub REST API. Repository rankings can be fetched with `GET /search/repositories`, `sort=stars`, `order=desc`, `per_page=100`, pages `1..10`, and query qualifiers such as `language:LANGUAGE`, `fork:false`, `archived:false`, `mirror:false`, and `is:public`. Native `fetch` in Node avoids a GitHub SDK dependency and keeps request handling explicit.

**Alternatives considered**:

- GitHub GraphQL API: richer typed query model, but user requested REST and top-1000 pages fit within REST Search's accessible result window.
- Octokit SDK: convenient, but not necessary for the limited request surface and would add dependency maintenance.

## Decision: Authenticate scheduled fetches with `GITHUB_TOKEN`

**Rationale**: The scheduled workflow can use GitHub Actions' built-in token for authenticated requests without storing a personal token. Search endpoints have a custom rate limit; authenticated Search requests are sufficient for one daily top-1000 overall request plus a curated set of language requests when requests are kept sequential and bounded. The primary `GITHUB_TOKEN` limit is also adequate for this workload.

**Alternatives considered**:

- Unauthenticated requests: lower rate limits and more fragile in CI.
- Personal access token: higher control, but unnecessary secret management for public repository search.

## Decision: Use a curated configurable language list

**Rationale**: GitHub REST Search can filter by language, but fetching "all languages" is not a bounded API operation. A curated list keeps the workflow deterministic, keeps daily requests under Search limits, and satisfies the language-ranking user story. The list will live in `src/config/languages.ts` and can be expanded through reviewed changes.

**Initial languages**: JavaScript, TypeScript, Python, Java, Go, Rust, C, C++, C#, PHP, Ruby, Swift, Kotlin, Dart, Shell, HTML, CSS, Vue, Svelte, Astro, Jupyter Notebook.

**Alternatives considered**:

- Infer all languages from the overall top 1000: cheaper, but misses popular repositories in languages that do not appear in the global top list.
- Fetch hundreds of languages: broader, but conflicts with API limits and the MVP scope.

## Decision: Preserve stale-data fallback by deploying only on successful fetch and build

**Rationale**: If a scheduled fetch or build fails, the workflow should fail before deployment. GitHub Pages will continue serving the previous successful deployment, satisfying the "last successful snapshot" requirement. Snapshot JSON includes `generatedAt` and stale status can be computed during static build.

**Alternatives considered**:

- Commit generated data back to the repository: creates noisy daily commits and can trigger extra workflows.
- Deploy an error page on failure: violates the requirement to preserve the last successful snapshot.

## Decision: Use Vitest for units/contracts and Playwright for visual regression

**Rationale**: The user requested Vitest and Playwright visual regression testing. Vitest covers deterministic data and contract logic close to the Vite config. Playwright's `toHaveScreenshot()` provides built-in visual comparisons and should run against the static build/preview server in a pinned Linux CI environment with committed baselines.

**Alternatives considered**:

- Vitest-only DOM snapshots: useful for structure, but cannot catch visual layout regressions.
- Third-party visual testing SaaS: unnecessary for the MVP and adds external dependency cost.

## Decision: Use AJV for snapshot schema validation

**Rationale**: The plan already defines `contracts/data-snapshot.schema.json`. AJV lets contract tests validate generated snapshot fixtures and real generated data against that schema, reducing drift between fetch normalization and the published static data shape.

**Alternatives considered**:

- Hand-written schema checks: fewer dependencies, but duplicate the schema and are easier to drift.
- No schema validation dependency: simpler install, but leaves the formal contract underused.

## Decision: Use Oxc tools for lint/format

**Rationale**: The user requested Vitest, oxlint, and oxfmt. Vitest works naturally with Vite configuration and Node-based test fixtures. Oxlint supports JavaScript/TypeScript and `.astro` script blocks. Oxfmt is fast and supports common project file types with Tailwind class sorting, but current compatibility does not provide full Astro formatting, so `.astro` files require Astro diagnostics, build checks, review, and component conventions.

**Alternatives considered**:

- Jest: no advantage for a Vite/Astro project.
- ESLint + Prettier: broader Astro ecosystem support, but conflicts with the requested Oxc toolchain and adds more dependencies.

## Decision: Deploy with GitHub Actions to GitHub Pages

**Rationale**: GitHub Pages supports custom GitHub Actions publishing. The workflow will run on daily schedule, manual dispatch, and default-branch pushes. It will use official or focused actions for checkout, Node/pnpm setup, Pages configuration, artifact upload, and Pages deployment, then install with pnpm, fetch ranking data, build with Astro, run tests, upload the generated `dist/` artifact, and deploy with the Pages action.

**Alternatives considered**:

- Branch-based Pages deploy: less control over build-time data fetching.
- Third-party deploy action: unnecessary when GitHub and Astro provide official deployment paths.
- Hidden one-shot framework deploy action: acceptable only if compatible with Astro 7 prerelease/Vite 8 and still leaves fetch, test, build, upload, and deploy gates clear in the workflow.
