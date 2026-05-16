# Data Model: GitHub Repository Star Ranking

## RepositoryRankingEntry

Represents one repository in one ranking list.

**Fields**

- `rank`: Integer, 1-based position within the ranking.
- `id`: GitHub repository numeric ID.
- `nodeId`: GitHub repository node ID when present.
- `owner`: Repository owner login.
- `name`: Repository name.
- `fullName`: Repository full name in `owner/name` format.
- `htmlUrl`: Public GitHub repository URL.
- `description`: Repository description or `null` when unavailable.
- `stars`: Star count captured in the snapshot.
- `primaryLanguage`: Primary GitHub language or `null` when unavailable.
- `fork`: Boolean; MVP ranking excludes forks.
- `archived`: Boolean; MVP ranking excludes archived repositories.
- `mirror`: Boolean; MVP ranking excludes mirrors when GitHub Search supports the qualifier.
- `pushedAt`: Last pushed timestamp when provided by GitHub.
- `updatedAt`: Repository updated timestamp when provided by GitHub.
- `snapshotAt`: Timestamp when this entry was captured.

**Validation Rules**

- `rank` must be unique and sequential within a ranking.
- `fullName` must contain exactly one `/`.
- `stars` must be a non-negative integer.
- `htmlUrl` must be an HTTPS GitHub URL.
- Entries are sorted by `stars` descending, then `fullName` ascending for ties.

## LanguageRanking

Represents the top repository list for one configured primary language.

**Fields**

- `language`: GitHub language query value.
- `slug`: URL-safe language identifier.
- `displayName`: Visitor-facing language name.
- `totalCount`: GitHub Search total count for the query.
- `incompleteResults`: Whether GitHub marked the search response as incomplete.
- `query`: Search query used to produce the ranking.
- `items`: Ordered `RepositoryRankingEntry[]`.
- `generatedAt`: Timestamp when the language ranking was generated.

**Validation Rules**

- `slug` must be unique across configured languages.
- Each item with a known primary language must match `language`.
- `items` contains at most 1000 entries for MVP.
- Empty `items` is allowed and must produce a clear empty state.

## RankingSnapshot

Represents one successful daily build-time data snapshot.

**Fields**

- `schemaVersion`: Snapshot schema version.
- `generatedAt`: Timestamp for the successful data generation run.
- `staleAfter`: Timestamp when the site should mark the snapshot stale.
- `source`: Metadata about GitHub REST API version, request count, and workflow context.
- `overall`: Ordered `RepositoryRankingEntry[]`.
- `languages`: Ordered `LanguageRanking[]`.
- `errors`: Non-fatal collection warnings, such as incomplete search results.

**Validation Rules**

- `schemaVersion` must be supported by the current site build.
- `overall` contains at most 1000 entries.
- `languages` contains only configured language rankings.
- `staleAfter` must be 36 hours after `generatedAt`.
- Fatal fetch or validation failure prevents deployment so the prior Pages deployment remains available.

## LanguageConfig

Represents one language ranking configured for generation.

**Fields**

- `language`: GitHub Search language qualifier value.
- `slug`: URL path segment.
- `displayName`: Label shown to visitors.
- `enabled`: Whether this language should be fetched and built.

**Validation Rules**

- `slug` must be lowercase, URL-safe, and unique.
- Disabled languages are not fetched and do not produce pages.
- Adding a language must include or update tests for slugging and query encoding.

## FetchRun

Represents a build-time attempt to collect ranking data.

**Fields**

- `startedAt`: Fetch start timestamp.
- `completedAt`: Fetch completion timestamp.
- `status`: `success` or `failure`.
- `requestCount`: Number of GitHub REST requests made.
- `rateLimitRemaining`: Remaining Search/API budget when known.
- `fatalError`: Error message for failed runs.
- `warnings`: Non-fatal warnings retained in snapshot metadata.

**State Transitions**

- `pending` -> `success`: All required rankings fetched, normalized, validated, and written.
- `pending` -> `failure`: Required ranking fetch fails, schema validation fails, or rate limit prevents completion.
- `success` -> `stale`: Snapshot age exceeds 36 hours.

## Relationships

- `RankingSnapshot` has one `overall` ranking and many `LanguageRanking` records.
- `LanguageRanking` has many `RepositoryRankingEntry` records.
- `LanguageConfig` determines which `LanguageRanking` records are generated.
- `FetchRun` produces zero or one `RankingSnapshot`.
