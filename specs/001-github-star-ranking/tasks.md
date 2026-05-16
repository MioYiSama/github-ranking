# Tasks: GitHub Repository Star Ranking

**Input**: Design documents from `/specs/001-github-star-ranking/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are mandatory for every changed behavior. Tests must cover primary paths, edge cases, failure modes, integration boundaries, snapshot contracts, and Playwright visual regression paths described by the specification and implementation plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not depend on incomplete tasks.
- **[Story]**: Maps task to a user story. Setup, foundational, and polish tasks do not include story labels.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Astro 7 prerelease/Vite 8/TypeScript 6 project, tooling, and empty file structure.

- [x] T001 Create `package.json` with pnpm scripts and approved dependencies in `/Users/mioyi/Documents/Code/Web/github-ranking/package.json`
- [x] T002 Create Node runtime pin for Node.js 22.12+ in `/Users/mioyi/Documents/Code/Web/github-ranking/.node-version`
- [x] T003 Create Astro 7 prerelease static build configuration with Tailwind Vite plugin and GitHub Pages placeholders in `/Users/mioyi/Documents/Code/Web/github-ranking/astro.config.mjs`
- [x] T004 Create TypeScript 6 compiler configuration with explicit Node/browser types and bundler module resolution in `/Users/mioyi/Documents/Code/Web/github-ranking/tsconfig.json`
- [x] T005 [P] Create Vitest configuration for unit, integration, and contract tests in `/Users/mioyi/Documents/Code/Web/github-ranking/vitest.config.ts`
- [x] T006 [P] Create Playwright visual regression configuration with local web server and Linux screenshot settings in `/Users/mioyi/Documents/Code/Web/github-ranking/playwright.config.ts`
- [x] T007 [P] Create oxlint configuration for TypeScript, Astro script blocks, and generated-file exclusions in `/Users/mioyi/Documents/Code/Web/github-ranking/.oxlintrc.json`
- [x] T008 [P] Create oxfmt configuration for supported JS/TS/JSON/MD/CSS files and Astro exclusions in `/Users/mioyi/Documents/Code/Web/github-ranking/.oxfmtrc.json`
- [x] T009 [P] Create Tailwind CSS v4 entry file and base tokens in `/Users/mioyi/Documents/Code/Web/github-ranking/src/styles/global.css`
- [x] T010 [P] Create screenshot stabilization stylesheet for visual tests in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/screenshot.css`
- [x] T011 [P] Create static favicon asset in `/Users/mioyi/Documents/Code/Web/github-ranking/public/favicon.svg`
- [x] T012 Install approved dependencies and generate lockfile in `/Users/mioyi/Documents/Code/Web/github-ranking/pnpm-lock.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared data contracts, fixtures, library boundaries, and fetch scaffolding required by all user stories.

**Critical**: No user story work should begin until this phase is complete.

- [x] T013 [P] Create schema-valid sample ranking snapshot fixture in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/fixtures/rankings.sample.json`
- [x] T014 [P] Create initial generated ranking snapshot for local static builds in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/generated/rankings.json`
- [x] T015 [P] Create AJV JSON Schema contract tests for generated snapshots in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/contract/snapshot-contract.test.ts`
- [x] T016 [P] Create slug unit tests for language slugs and repository identifiers in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/unit/slugs.test.ts`
- [x] T017 [P] Create ranking unit tests for descending stars, top-1000 truncation, tie-breaking, and missing metadata in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/unit/ranking.test.ts`
- [x] T018 [P] Create GitHub Search query and normalization unit tests in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/unit/github-search.test.ts`
- [x] T019 [P] Create shared TypeScript data contracts for RepositoryRankingEntry, LanguageRanking, RankingSnapshot, LanguageConfig, and FetchRun in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/types.ts`
- [x] T020 [P] Implement slug helpers for language routes and deterministic identifiers in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/slugs.ts`
- [x] T021 Implement ranking helpers for sorting, rank assignment, top-1000 truncation, and metadata defaults in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/ranking.ts`
- [x] T022 Implement GitHub Search request builder and response normalizer using native fetch contracts in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/github-search.ts`
- [x] T023 Implement snapshot schema, stale-threshold, and generated-data helpers in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/snapshot.ts`
- [x] T024 Create mocked fetch integration tests for successful Search API responses and fatal response failures in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/integration/fetch-rankings.test.ts`
- [x] T025 Create build-time fetch script scaffold with environment handling and file output boundaries in `/Users/mioyi/Documents/Code/Web/github-ranking/scripts/fetch-rankings.mjs`
- [x] T026 [P] Create Astro environment declarations in `/Users/mioyi/Documents/Code/Web/github-ranking/src/env.d.ts`
- [x] T027 [P] Create static-site test helpers for built-page assertions in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/helpers/static-site.ts`
- [x] T028 Run foundational checks and fix failures in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/contract/snapshot-contract.test.ts`

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - View Overall Repository Ranking (Priority: P1) MVP

**Goal**: Visitors can open the site and immediately see a public overall ranking of GitHub repositories sorted by stars.

**Independent Test**: Build the static site from fixture or fetched data, open `/`, and verify rank, repository full name, star count, primary language when known, optional description, GitHub link, top-1000 limit, and deterministic tie order.

### Tests for User Story 1

- [x] T029 [P] [US1] Create overall ranking integration tests for ordering, top-1000 truncation, and tie behavior in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/integration/overall-ranking.test.ts`
- [x] T030 [P] [US1] Create overall route static smoke tests for required table content, top-10 scanability, and GitHub links in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/smoke/overall-page.test.ts`
- [x] T031 [P] [US1] Create Playwright visual regression test for the overall ranking page in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/overall-ranking.spec.ts`

### Implementation for User Story 1

- [x] T032 [US1] Extend build-time fetch script to fetch and normalize the overall GitHub REST ranking in `/Users/mioyi/Documents/Code/Web/github-ranking/scripts/fetch-rankings.mjs`
- [x] T033 [US1] Implement repository row component with fallback rendering for missing description and language in `/Users/mioyi/Documents/Code/Web/github-ranking/src/components/RepositoryRow.astro`
- [x] T034 [P] [US1] Implement reusable ranking table component with stable rank and star formatting in `/Users/mioyi/Documents/Code/Web/github-ranking/src/components/RankingTable.astro`
- [x] T035 [P] [US1] Implement base layout with public read-only shell and global stylesheet import in `/Users/mioyi/Documents/Code/Web/github-ranking/src/layouts/BaseLayout.astro`
- [x] T036 [US1] Implement overall ranking page using generated snapshot data in `/Users/mioyi/Documents/Code/Web/github-ranking/src/pages/index.astro`
- [x] T037 [US1] Add top-1000 and deterministic tie-break behavior to ranking helpers used by the overall page in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/ranking.ts`
- [x] T038 [US1] Add overall ranking fixture entries for equal stars and missing optional metadata in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/fixtures/rankings.sample.json`
- [x] T039 [US1] Style overall ranking table for scanning 1000 entries without layout shifts in `/Users/mioyi/Documents/Code/Web/github-ranking/src/styles/global.css`
- [x] T040 [US1] Regenerate static build fixture data for the overall ranking in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/generated/rankings.json`
- [x] T041 [US1] Validate MVP by running overall story tests and recording any intentional visual baseline in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/overall-ranking.spec.ts-snapshots/`

**Checkpoint**: User Story 1 is independently functional and demoable as the MVP.

---

## Phase 4: User Story 2 - View Rankings By Language (Priority: P2)

**Goal**: Visitors can switch to a language-specific ranking and share or reload that language route.

**Independent Test**: Build the static site, open `/languages/[slug]/`, and verify only repositories for that configured primary language appear, navigation is linkable, empty language states are clear, and the page reloads directly.

### Tests for User Story 2

- [x] T042 [P] [US2] Create language configuration tests for enabled languages, unique slugs, and query encoding in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/unit/languages.test.ts`
- [x] T043 [P] [US2] Create language ranking integration tests for language filtering, empty results, and generated page data in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/integration/language-rankings.test.ts`
- [x] T044 [P] [US2] Create language route smoke tests for direct reload, overall link, and repository table content in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/smoke/language-page.test.ts`
- [x] T045 [P] [US2] Create Playwright visual regression test for a populated language ranking page in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/language-ranking.spec.ts`
- [x] T046 [P] [US2] Create Playwright visual regression test for an empty language ranking state in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/empty-language.spec.ts`

### Implementation for User Story 2

- [x] T047 [US2] Implement curated language configuration with display names, slugs, and enabled flags in `/Users/mioyi/Documents/Code/Web/github-ranking/src/config/languages.ts`
- [x] T048 [US2] Extend GitHub Search helpers for language-qualified REST queries in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/github-search.ts`
- [x] T049 [US2] Extend build-time fetch script to collect configured language rankings under Search API limits in `/Users/mioyi/Documents/Code/Web/github-ranking/scripts/fetch-rankings.mjs`
- [x] T050 [P] [US2] Implement language navigation component with shareable links in `/Users/mioyi/Documents/Code/Web/github-ranking/src/components/LanguageNav.astro`
- [x] T051 [US2] Implement static language route generation with `getStaticPaths()` in `/Users/mioyi/Documents/Code/Web/github-ranking/src/pages/languages/[slug].astro`
- [x] T052 [US2] Extend ranking table component with language-specific empty states in `/Users/mioyi/Documents/Code/Web/github-ranking/src/components/RankingTable.astro`
- [x] T053 [US2] Integrate language navigation into the base layout without requiring authentication or client-side data fetches in `/Users/mioyi/Documents/Code/Web/github-ranking/src/layouts/BaseLayout.astro`
- [x] T054 [US2] Add populated and empty language rankings to the sample snapshot fixture in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/fixtures/rankings.sample.json`

**Checkpoint**: User Story 2 is independently functional and does not break User Story 1.

---

## Phase 5: User Story 3 - Understand Data Freshness (Priority: P3)

**Goal**: Visitors can see when ranking data was last refreshed, understand stale data, and keep using the last successful deployment after refresh failures.

**Independent Test**: Build the static site with fresh and stale fixtures, verify freshness indicators on overall and language routes, and verify the scheduled workflow deploys only after data fetch, validation, build, and tests succeed.

### Tests for User Story 3

- [x] T055 [P] [US3] Create snapshot freshness unit tests for generatedAt, staleAfter, stale labels, and stale threshold behavior in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/unit/snapshot.test.ts`
- [x] T056 [P] [US3] Create fetch failure integration tests for non-2xx responses, malformed JSON, schema-invalid output, successful responses with no usable ranking data, and rate-limit failures in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/integration/fetch-failure.test.ts`
- [x] T057 [P] [US3] Create workflow contract test for fetch, test, build, upload, and deploy gate ordering in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/contract/workflow-contract.test.ts`
- [x] T058 [P] [US3] Create freshness status smoke tests for overall and language routes in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/smoke/freshness-status.test.ts`
- [x] T059 [P] [US3] Create Playwright visual regression test for stale snapshot messaging in `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/stale-snapshot.spec.ts`

### Implementation for User Story 3

- [x] T060 [US3] Add stale and failed-refresh fixture variants in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/fixtures/rankings.stale.json`
- [x] T061 [US3] Implement snapshot status component for last successful update and stale messaging in `/Users/mioyi/Documents/Code/Web/github-ranking/src/components/SnapshotStatus.astro`
- [x] T062 [US3] Extend snapshot helpers for freshness labels, stale calculations, and build-time fallback semantics in `/Users/mioyi/Documents/Code/Web/github-ranking/src/lib/snapshot.ts`
- [x] T063 [US3] Extend build-time fetch script to set generatedAt, staleAfter, source metadata, warnings, and fatal-failure exits in `/Users/mioyi/Documents/Code/Web/github-ranking/scripts/fetch-rankings.mjs`
- [x] T064 [US3] Integrate snapshot status into the overall ranking page in `/Users/mioyi/Documents/Code/Web/github-ranking/src/pages/index.astro`
- [x] T065 [US3] Integrate snapshot status into language ranking pages in `/Users/mioyi/Documents/Code/Web/github-ranking/src/pages/languages/[slug].astro`
- [x] T066 [US3] Create GitHub Actions workflow for scheduled fetch, validation, build, visual tests, artifact upload, and Pages deployment in `/Users/mioyi/Documents/Code/Web/github-ranking/.github/workflows/deploy.yml`
- [x] T067 [US3] Update generated snapshot data with source metadata and stale threshold fields in `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/generated/rankings.json`

**Checkpoint**: User Story 3 is independently functional and confirms the daily static deployment path.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, dependency audit, visual baseline review, and code-review preparation across all stories.

- [x] T068 [P] Create project README with feature overview, local development, validation commands, and GitHub Pages setup in `/Users/mioyi/Documents/Code/Web/github-ranking/README.md`
- [x] T069 [P] Record dependency audit for Astro 7 prerelease, Vite 8, TypeScript 6, Tailwind, Vitest, Playwright, Oxc tools, AJV, and GitHub Actions in `/Users/mioyi/Documents/Code/Web/github-ranking/specs/001-github-star-ranking/dependency-audit.md`
- [x] T070 [P] Record rollback notes for Astro 7 prerelease/Vite 8 blockers in `/Users/mioyi/Documents/Code/Web/github-ranking/specs/001-github-star-ranking/rollback.md`
- [x] T071 [P] Record security review notes for token handling, public read-only scope, and generated data exposure in `/Users/mioyi/Documents/Code/Web/github-ranking/specs/001-github-star-ranking/security-check.md`
- [x] T072 Review and update ranking requirements checklist findings in `/Users/mioyi/Documents/Code/Web/github-ranking/specs/001-github-star-ranking/checklists/ranking.md`
- [x] T073 Run formatter validation and fix supported formatted files referenced by `/Users/mioyi/Documents/Code/Web/github-ranking/.oxfmtrc.json`
- [x] T074 Run lint validation and fix source or config issues referenced by `/Users/mioyi/Documents/Code/Web/github-ranking/.oxlintrc.json`
- [x] T075 Run TypeScript and Astro diagnostics and fix issues under `/Users/mioyi/Documents/Code/Web/github-ranking/src/`
- [x] T076 Run Vitest suite and fix failures under `/Users/mioyi/Documents/Code/Web/github-ranking/tests/`
- [x] T077 Run Astro static build and fix build or generated-data failures under `/Users/mioyi/Documents/Code/Web/github-ranking/src/data/generated/rankings.json`
- [x] T078 Run Playwright visual regression tests and update only intentional baselines under `/Users/mioyi/Documents/Code/Web/github-ranking/tests/visual/`
- [x] T079 Run full quickstart validation and record command results in `/Users/mioyi/Documents/Code/Web/github-ranking/specs/001-github-star-ranking/validation-results.md`
- [x] T080 Prepare code review notes with validation evidence, operational risks, and deployment rollback plan in `/Users/mioyi/Documents/Code/Web/github-ranking/specs/001-github-star-ranking/review-notes.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies. Start immediately.
- **Phase 2 Foundational**: Depends on Setup completion. Blocks all user stories.
- **Phase 3 US1**: Depends on Foundational completion. Delivers the MVP.
- **Phase 4 US2**: Depends on Foundational completion. Can run after or alongside US1 if shared component edits are coordinated.
- **Phase 5 US3**: Depends on Foundational completion and benefits from US1/US2 routes being present before final integration.
- **Phase 6 Polish**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 View Overall Repository Ranking**: No dependency on other user stories after foundation.
- **US2 View Rankings By Language**: Reuses ranking table/layout from US1 if US1 is already done, but remains testable through its own route and fixtures.
- **US3 Understand Data Freshness**: Reuses generated snapshot and route surfaces from US1/US2, but freshness logic is independently testable through fixtures, snapshot helpers, and workflow contracts.

### Within Each User Story

- Write tests before implementation where practical.
- Data contracts and fixtures before fetch/rendering logic.
- Library helpers before Astro pages.
- Components before route integration.
- Story-specific visual baselines after the corresponding static route renders.

## Parallel Opportunities

- Setup tasks T005-T011 can run in parallel after T001-T004 are understood.
- Foundational test tasks T013-T018 and helper task T026-T027 can run in parallel.
- US1 tests T029-T031 can run in parallel before implementation.
- US2 tests T042-T046 can run in parallel before implementation.
- US3 tests T055-T059 can run in parallel before implementation.
- Documentation and review tasks T068-T071 can run in parallel after story implementation stabilizes.

## Parallel Example: User Story 1

```text
Task: "T029 Create overall ranking integration tests in tests/integration/overall-ranking.test.ts"
Task: "T030 Create overall route static smoke tests in tests/smoke/overall-page.test.ts"
Task: "T031 Create Playwright visual regression test in tests/visual/overall-ranking.spec.ts"
```

## Parallel Example: User Story 2

```text
Task: "T042 Create language configuration tests in tests/unit/languages.test.ts"
Task: "T043 Create language ranking integration tests in tests/integration/language-rankings.test.ts"
Task: "T044 Create language route smoke tests in tests/smoke/language-page.test.ts"
Task: "T045 Create populated language visual test in tests/visual/language-ranking.spec.ts"
Task: "T046 Create empty language visual test in tests/visual/empty-language.spec.ts"
```

## Parallel Example: User Story 3

```text
Task: "T055 Create snapshot freshness unit tests in tests/unit/snapshot.test.ts"
Task: "T056 Create fetch failure integration tests in tests/integration/fetch-failure.test.ts"
Task: "T057 Create workflow contract test in tests/contract/workflow-contract.test.ts"
Task: "T058 Create freshness status smoke tests in tests/smoke/freshness-status.test.ts"
Task: "T059 Create stale snapshot visual test in tests/visual/stale-snapshot.spec.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 US1.
4. Stop and validate overall ranking independently with Vitest, static smoke, Playwright visual, and Astro build.
5. Demo `/` before adding language and freshness features.

### Incremental Delivery

1. Setup + Foundation produces a buildable static app skeleton and contract-tested data shape.
2. US1 adds overall ranking MVP.
3. US2 adds language-specific rankings and shareable language routes.
4. US3 adds freshness communication and scheduled GitHub Pages deployment.
5. Polish phase validates the full stack and prepares review evidence.

### Parallel Team Strategy

1. One person owns setup/tooling while another writes foundational tests and fixtures.
2. After Phase 2, US1/US2/US3 tests can be authored in parallel.
3. Coordinate edits to shared files: `src/components/RankingTable.astro`, `src/layouts/BaseLayout.astro`, `scripts/fetch-rankings.mjs`, and `src/data/fixtures/rankings.sample.json`.

## Notes

- [P] tasks touch distinct files and can run in parallel.
- User story labels map to the prioritized stories in `spec.md`.
- Keep GitHub tokens out of generated JSON, static HTML, logs, and committed files.
- Do not introduce Octokit, ESLint, Prettier, or third-party deploy actions without updating `plan.md` and the dependency audit.
- Keep Astro 7 prerelease pinned exactly until a stable Astro 7 release is selected.
