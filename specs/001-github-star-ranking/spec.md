# Feature Specification: GitHub Repository Star Ranking

**Feature Branch**: `001-github-star-ranking`

**Created**: 2026-05-16

**Status**: Draft

**Input**: User description: "我要做一个GitHub仓库星标排名。纯静态网站，每天定时获取最新数据。网站需要展示总排行、按语言排行。"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Overall Repository Ranking (Priority: P1)

As a public visitor, I want to open the site and immediately see the most-starred GitHub repositories in a clear overall ranking, so that I can discover and compare the most popular repositories without signing in or configuring anything.

**Why this priority**: The overall ranking is the core value of the site and provides a complete MVP on its own.

**Independent Test**: Can be fully tested by opening the ranking page and confirming that eligible public repositories are shown in descending captured star order with enough context to compare them.

**Acceptance Scenarios**:

1. **Given** current ranking data is available, **When** a visitor opens the site, **Then** the visitor sees an overall repository ranking sorted by the star counts captured in the last successful snapshot from highest to lowest.
2. **Given** a repository appears in the overall ranking, **When** a visitor scans the list, **Then** the visitor can see its rank, repository full name, star count, primary language when known, short description when available, and a link to the GitHub repository.
3. **Given** two repositories have the same star count, **When** the ranking is displayed, **Then** their relative order is stable and deterministic.

---

### User Story 2 - View Rankings By Language (Priority: P2)

As a visitor interested in a specific programming language, I want to switch to a language ranking, so that I can compare popular repositories within that language instead of scanning the global list.

**Why this priority**: Language-specific rankings make the site useful for targeted discovery and are explicitly requested.

**Independent Test**: Can be tested by selecting a configured language and confirming that only repositories whose GitHub-reported primary language matches that language are listed in star-descending order.

**Acceptance Scenarios**:

1. **Given** language ranking data is available, **When** a visitor chooses a language, **Then** the site displays repositories for that language sorted by star count from highest to lowest.
2. **Given** a visitor is viewing a language ranking, **When** the visitor shares or reloads that view, **Then** the same language ranking can be reached again without repeating manual navigation.
3. **Given** a selected language has no available ranking entries, **When** the visitor opens that language view, **Then** the site shows a clear empty state instead of a broken or misleading ranking.

---

### User Story 3 - Understand Data Freshness (Priority: P3)

As a returning visitor, I want to know when the ranking data was last refreshed, so that I can judge whether the ranking reflects recent GitHub star changes.

**Why this priority**: Daily freshness is central to trust, but visitors can still get value from rankings before advanced freshness messaging is added.

**Independent Test**: Can be tested by viewing any ranking and confirming that the last successful update time is visible and stale data is clearly identified.

**Acceptance Scenarios**:

1. **Given** a successful daily data refresh has occurred, **When** a visitor views any ranking, **Then** the visitor sees the last successful update date and time.
2. **Given** the latest refresh did not complete successfully, **When** a visitor views the site, **Then** the visitor can still see the last successful ranking snapshot with an indication that the data may be stale.
3. **Given** ranking data is older than the expected refresh window, **When** a visitor views any ranking, **Then** the site clearly identifies the data as stale.

### Edge Cases

- Latest data refresh fails or produces no usable ranking data.
- A repository is missing optional metadata such as description or primary language.
- A language ranking has no repositories available.
- Multiple repositories have identical star counts.
- A repository is deleted, renamed, made private, or otherwise becomes unavailable after it appeared in a prior snapshot.
- Star counts change between refreshes and a visitor compares the site against GitHub directly.
- The first deployment or a refresh run has no valid ranking snapshot to publish.
- A configured language has spaces, punctuation, aliases, or case differences between its visitor label, URL slug, and GitHub query value.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The site MUST present an overall ranking of eligible public GitHub repositories by star count in descending order. Eligible repositories exclude forks, archived repositories, mirrors when the data source can identify them, private or unavailable repositories, and repositories deleted before the successful snapshot is generated.
- **FR-002**: Each displayed repository entry MUST include rank, repository full name, star count, GitHub repository link, and primary language when known. When primary language is unknown, the entry MUST use a clear unknown-language representation rather than omitting the field silently.
- **FR-003**: Each displayed repository entry SHOULD include a short description when available. When no description is available, the entry MUST use a clear no-description representation that does not imply a loading failure.
- **FR-004**: Users MUST be able to view rankings grouped by repository primary language for a curated, configurable list of enabled languages. The MVP is not required to create a ranking for every language detected on GitHub.
- **FR-005**: Language rankings MUST include only repositories whose GitHub-reported primary language matches the selected configured language query value. Repositories with no primary language MUST NOT appear in a language-specific ranking.
- **FR-006**: Users MUST be able to return directly to the overall ranking and to a selected language ranking through shareable, reloadable navigation. The overall ranking MUST be reachable at `/`, and each enabled language ranking MUST have a stable `/languages/{slug}/` route.
- **FR-007**: Ranking data MUST be refreshed by a build-time or deployment-time workflow at least once per calendar day under normal operating conditions.
- **FR-008**: The site MUST show the last successful data refresh date and time on ranking views.
- **FR-009**: If the latest refresh attempt fails, the site MUST preserve and display the last successful ranking snapshot instead of showing an empty or broken experience. In visitor-facing copy, "latest data" means the latest successful snapshot, not a failed refresh attempt.
- **FR-010**: The site MUST clearly identify ranking data as stale when the last successful refresh is older than 36 hours. The stale threshold MUST be calculated from the snapshot timestamp, and displayed refresh times MUST include an explicit timezone or UTC indicator.
- **FR-011**: Rankings MUST use stable tie-breaking when repositories have equal star counts: sort by star count descending, then repository full name in ascending alphabetical order.
- **FR-012**: The site MUST provide clear empty states for unavailable rankings, missing language data, and missing optional repository metadata. Empty ranking states MUST identify which ranking has no entries, preserve navigation to other rankings, and continue to show freshness status when snapshot metadata exists.
- **FR-013**: The browsing experience MUST be public and read-only, with no visitor account, sign-in, comments, voting, moderation, administrative editing, or repository submission workflow required.
- **FR-014**: The MVP MUST display up to the top 1000 repositories overall and up to the top 1000 repositories for each available language ranking. If fewer than 1000 eligible entries are available for a ranking, the site MUST display all available eligible entries.
- **FR-015**: The site MUST be fully statically generated, with no server runtime, no visitor authentication, and no browser-side calls to the GitHub API. Daily refreshed data MUST be produced before static artifact publication, not by visitor browsers.
- **FR-016**: Displayed star counts MUST be snapshot values captured from GitHub during the last successful refresh. They are not guaranteed to match live GitHub counts until the next successful snapshot.
- **FR-017**: A deployment workflow MUST NOT publish a broken first deployment when no valid ranking snapshot exists. If the first data refresh produces no usable snapshot, publication MUST fail before deployment or produce a clearly unavailable static artifact only when that behavior is intentionally validated.
- **FR-018**: Repositories that are renamed, transferred, deleted, made private, or otherwise unavailable after a prior snapshot MUST be reconciled on the next successful snapshot. Until then, stale pages may show the last captured repository identity and MUST make snapshot timing visible.
- **FR-019**: Each configured language MUST define a visitor display name, a unique lowercase URL-safe slug, a GitHub language query value, and an enabled flag. Language query values with spaces, punctuation, aliases, or case differences MUST be encoded safely for data fetches while preserving stable visitor URLs.
- **FR-020**: The site MUST distinguish between an empty ranking, missing optional repository metadata, and stale data so visitors do not confuse one state for another.

### Dependency & Quality Constraints _(mandatory)_

- **DQ-001**: Any new external data source, service, or dependency MUST be listed with its purpose, alternatives considered, approval rationale, and expected maintenance cost. Write "No new dependencies" when the feature uses only existing project capabilities.
- **DQ-002**: Quality constraints MUST preserve public read-only browsing, deterministic ranking order, visible data freshness, graceful stale-data handling, and clear behavior when repository metadata is incomplete.
- **DQ-003**: Testing expectations MUST cover the primary path for overall ranking, language ranking, daily freshness display, stale-data fallback, empty states, tie-breaking, and unavailable repository metadata.
- **DQ-004**: Review expectations MUST verify ranking correctness, language grouping correctness, freshness communication, scope boundaries, and evidence that the site remains usable when the latest refresh fails.

### Non-Functional Requirements

- **NFR-001**: Ranking pages MUST be accessible to keyboard and screen-reader users, including semantic headings, link text that identifies repository destinations, visible focus states, and non-color-only stale or empty-state messaging.
- **NFR-002**: Ranking pages MUST remain readable on small and large screens. Rank, repository identity, star count, language, description, freshness status, and navigation MUST not overlap or require horizontal scrolling for normal mobile viewport widths.
- **NFR-003**: Ranking pages SHOULD be usable within 2 seconds after static assets are served on standard broadband for the MVP data set.
- **NFR-004**: Public availability MUST favor the last successful static artifact during data-source interruptions, refresh failures, validation failures, or build failures.
- **NFR-005**: Visitor privacy and token security MUST be preserved: the site MUST NOT require visitor accounts, collect visitor-submitted repository data, expose GitHub tokens, or include secrets in generated JSON, static HTML, client-side JavaScript, logs, or committed files.
- **NFR-006**: The "pure static" site boundary is compatible with daily refreshed data only because refreshes happen before deployment; visitors receive static files from the last successful deployment.

### Key Entities _(include if feature involves data)_

- **Repository Ranking Entry**: Represents a GitHub repository in a ranking. Key attributes include rank, GitHub numeric ID when available, owner/name, repository full name, star count, primary language or unknown marker, description or no-description marker, repository link, fork/archive/mirror eligibility flags, and snapshot timestamp.
- **Language Ranking**: Represents the ordered list of repository ranking entries for one configured primary language. Key attributes include display name, unique slug, GitHub query language value, total available count from the data source, ordered entries, empty-state eligibility, and last successful update timestamp.
- **Ranking Snapshot**: Represents one successful daily refresh of ranking data. Key attributes include schema version, generated timestamp, stale-after timestamp, source metadata, request count, optional non-fatal warnings, overall ranking entries, and language ranking entries.
- **Language Configuration**: Represents one language that may receive a static ranking route. Key attributes include display name, unique slug, GitHub query value, and enabled flag.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 95% of visitors can identify the top 10 repositories in the overall ranking within 10 seconds of opening the site.
- **SC-002**: 90% of visitors can open a language-specific ranking in 3 interactions or fewer.
- **SC-003**: The scheduled refresh workflow is configured to run at least once per calendar day, can be manually triggered, and deploys a new static artifact only after data refresh and validation succeed.
- **SC-004**: 100% of ranking views display the last successful update time.
- **SC-005**: 100% of ranking views show a non-broken fallback experience when the latest refresh fails but a prior successful snapshot exists.
- **SC-006**: At least 95% of displayed repository entries include rank, repository full name, star count, repository link, and primary language when known.
- **SC-007**: 100% of generated language ranking URLs can be loaded directly or reloaded without requiring prior navigation state.
- **SC-008**: 100% of ranking views with fewer than 1000 eligible entries display all eligible entries and do not imply that hidden entries exist.

## Assumptions

- Target users are public visitors who want to discover, compare, or monitor popular GitHub repositories.
- "按语言排行" means ranking by a repository's primary language.
- The first release covers top repository lists, not the full GitHub repository catalog.
- The MVP target is top 1000 repositories overall and top 1000 repositories per available language ranking.
- GitHub REST Search is the ranking data source for the MVP. Its public repository availability, search result completeness, rate limits, and reported metadata constrain what can be shown in each snapshot.
- The curated language list is chosen for visitor value and API-limit predictability; it can expand through reviewed configuration changes.
- Rankings are point-in-time snapshots, primarily sorted by star count descending; ties are resolved by repository full name in ascending alphabetical order.
- GitHub's reported primary language is treated as the authoritative primary-language value for language rankings, even for multi-language or generated-code-heavy repositories.
- If a refresh fails, the most recent successful snapshot remains available and is marked stale when older than 36 hours.
- Search, personal watchlists, repository submissions, authentication, comments, voting, and administrative editing are out of scope for this feature.
