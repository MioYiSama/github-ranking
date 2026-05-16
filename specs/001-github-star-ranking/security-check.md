# Security Review: GitHub Repository Star Ranking

## Token Handling

- `GITHUB_TOKEN` is read only by the build-time fetch script or GitHub Actions.
- Browser code does not call GitHub APIs.
- Generated JSON contains public repository metadata only.
- The fetch script does not write request headers, authorization values, or token-derived content into the snapshot.

## Public Scope

- The site is public and read-only.
- There are no accounts, sign-in flows, comments, voting, moderation tools, repository submission forms, or administrative workflows.
- Repository links point to public GitHub repository URLs.

## Generated Data Exposure

- Snapshot data includes repository IDs, owner/name, public URLs, descriptions, stars, primary language, and public timestamps.
- Private, unavailable, archived, forked, and mirrored repositories are excluded where the data source identifies them.
- Stale data is explicitly labeled instead of pretending to be live.

## Operational Risks

- GitHub Search rate limits can fail a scheduled refresh. The workflow fails before deployment, preserving the last successful Pages artifact.
- Astro 7 alpha and Vite 8 remain prerelease/upgrade risks and are covered by rollback notes.
