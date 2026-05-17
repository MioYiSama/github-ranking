# Dependency Audit: GitHub Repository Star Ranking

**Date**: 2026-05-16

## Runtime And Build

- `astro@7.0.0-alpha.1`: Static site framework with Astro 7 prerelease support for Vite 8. Alternative: Astro 6/Vite 7, rejected because the plan targets Astro 7/Vite 8. Maintenance risk: prerelease instability; pinned exactly.
- `vite@8.0.13`: Vite 8 build pipeline via Astro. Alternative: indirect Astro-managed Vite only, but explicit dependency keeps version reviewable.
- `typescript@6.0.3`: Type checking for source, configs, and tests. Alternative: TypeScript 5.x, rejected by plan.
- `@types/node@25.8.0`: Explicit Node types for scripts/configs. Alternative: ambient untyped globals, rejected for TypeScript 6 clarity.
- `tailwindcss@4.3.0` and `@tailwindcss/vite@4.3.0`: Tailwind v4 Vite integration. Alternative: plain CSS, rejected by plan.
- `@tanstack/virtual-core@3.14.0`: Vanilla virtualizer for the 1000-row homepage ranking. Alternative: render all rows in the DOM, rejected because it creates unnecessary layout and browser work for large ranking snapshots.
- `fuse.js@7.3.0`: Browser-side fuzzy filtering for each rendered ranking list. Alternative: hand-written substring scoring, rejected because typo-tolerant filtering across names, descriptions, languages, and topics is user-facing behavior and a focused dependency is lower risk than custom scoring logic.

## Testing And Quality

- `vitest@4.1.6`: Unit, integration, smoke, and contract tests. Alternative: Node test runner, rejected for Vite/Astro alignment.
- `@playwright/test@1.60.0`: Browser visual regression tests. Alternative: DOM snapshots, rejected because visual layout needs screenshot coverage.
- `ajv@8.20.0`: JSON Schema snapshot validation. Alternative: hand-written validation, rejected to avoid contract drift.
- `oxlint@1.65.0`: Fast linting for JS/TS files. Alternative: ESLint, rejected by Oxc toolchain choice. Limitation: this installed release does not expose an `astro` plugin name, so `.astro` quality is enforced through Astro diagnostics, static build, visual tests, and review.
- `oxfmt@0.50.0`: Formatter for supported JS/TS/JSON/MD/CSS-style files. Limitation: `.astro` formatting remains covered by diagnostics, build, visual tests, and review.
- `@astrojs/check@0.9.9`: Astro and TypeScript diagnostics. Alternative: TypeScript-only checks, rejected because `.astro` files need framework diagnostics.

## GitHub Actions

- `actions/checkout@v5`
- `pnpm/action-setup@v4`
- `actions/setup-node@v5`
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

These are official or focused setup/deploy actions. The workflow keeps fetch, test, build, visual-test, upload, and deploy gates visible.

## Security And Maintenance Notes

- GitHub REST requests use native `fetch`; no GitHub SDK dependency is added.
- The scheduled workflow uses `github.token`; no personal token is required.
- Tokens must never be emitted into generated JSON, static HTML, client-side JavaScript, logs, or committed files.
- Astro 7 remains the highest maintenance risk because it is pinned to an alpha release.
