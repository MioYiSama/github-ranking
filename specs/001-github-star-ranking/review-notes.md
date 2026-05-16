# Code Review Notes

## Summary

This implementation creates a static Astro GitHub star ranking site with build-time GitHub REST data collection, generated JSON snapshots, overall and language routes, freshness status, empty states, and validation coverage.

## Review Checklist

- Dependency discipline: see `dependency-audit.md`.
- Prerelease rollback: see `rollback.md`.
- Security and token handling: see `security-check.md`.
- Snapshot contract: AJV validates fixtures and generated data.
- Ranking correctness: unit and integration tests cover sorting, top-1000 truncation, tie-breaking, metadata defaults, and language filtering.
- Operational fallback: workflow deploys only after fetch, test, build, and visual checks pass.
- Validation evidence: see `validation-results.md`.

## Risks

- Astro 7 is pinned to `7.0.0-alpha.1`; upgrading should be deliberate and reviewed.
- GitHub Search API availability and rate limits can prevent refresh. The prior static deployment remains available.
- Visual baselines should be updated only after intentional UI changes.
- Local visual tests need browser binaries installed with Playwright.

## Rollback Plan

Use the documented Astro 6/Vite 7 rollback path if Astro 7 alpha blocks CI or production static builds.
