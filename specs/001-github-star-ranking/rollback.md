# Rollback Notes: Astro 7 / Vite 8

## Trigger Conditions

Rollback should be considered if Astro 7 alpha blocks static builds, breaks Tailwind v4 Vite integration, prevents Astro diagnostics, or causes CI-only rendering failures that cannot be fixed within the feature branch.

## Preferred Rollback Path

1. Pin Astro to the latest stable Astro 6 release.
2. Use Astro's compatible Vite 7 path.
3. Keep the same source structure, data contracts, fixtures, and tests.
4. Re-run `pnpm install` to regenerate `pnpm-lock.yaml`.
5. Re-run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build:static`, and `pnpm test:visual`.

## Expected Impact

- The public static routes and generated JSON contract should remain unchanged.
- Playwright baselines may need review if Astro/Vite asset output changes.
- Dependency audit and review notes must be updated to record the rollback reason.

## Recovery

If a scheduled deployment fails because of prerelease tooling, no new Pages artifact is deployed. The previous successful Pages deployment remains the visitor-facing fallback.
