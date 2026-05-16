import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

export const API_VERSION = "2026-03-10";
export const SEARCH_ENDPOINT = "https://api.github.com/search/repositories";
export const SNAPSHOT_SCHEMA_VERSION = "1.0.0";
export const DEFAULT_OUTPUT = "src/data/generated/rankings.json";
export const STALE_AFTER_HOURS = 36;
export const RANKING_LIMIT = 1000;
export const SEARCH_PAGE_SIZE = 100;
export const DEFAULT_SEARCH_REQUEST_INTERVAL_MS = 2_200;
export const DEFAULT_SEARCH_MAX_RETRIES = 3;
export const DEFAULT_SECONDARY_RATE_LIMIT_RETRY_MS = 60_000;

export const DEFAULT_LANGUAGES = [
  { language: "JavaScript", slug: "javascript", displayName: "JavaScript", enabled: true },
  { language: "TypeScript", slug: "typescript", displayName: "TypeScript", enabled: true },
  { language: "Python", slug: "python", displayName: "Python", enabled: true },
  { language: "Java", slug: "java", displayName: "Java", enabled: true },
  { language: "Go", slug: "go", displayName: "Go", enabled: true },
  { language: "Rust", slug: "rust", displayName: "Rust", enabled: true },
  { language: "C", slug: "c", displayName: "C", enabled: true },
  { language: "C++", slug: "c-plus-plus", displayName: "C++", enabled: true },
  { language: "C#", slug: "c-sharp", displayName: "C#", enabled: true },
  { language: "PHP", slug: "php", displayName: "PHP", enabled: true },
  { language: "Ruby", slug: "ruby", displayName: "Ruby", enabled: true },
  { language: "Swift", slug: "swift", displayName: "Swift", enabled: true },
  { language: "Kotlin", slug: "kotlin", displayName: "Kotlin", enabled: true },
  { language: "Dart", slug: "dart", displayName: "Dart", enabled: true },
  { language: "Shell", slug: "shell", displayName: "Shell", enabled: true },
  { language: "HTML", slug: "html", displayName: "HTML", enabled: true },
  { language: "CSS", slug: "css", displayName: "CSS", enabled: true },
  { language: "Vue", slug: "vue", displayName: "Vue", enabled: true },
  { language: "Svelte", slug: "svelte", displayName: "Svelte", enabled: true },
  { language: "Astro", slug: "astro", displayName: "Astro", enabled: true },
  {
    language: "Jupyter Notebook",
    slug: "jupyter-notebook",
    displayName: "Jupyter Notebook",
    enabled: true,
  },
];

export class FatalFetchError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "FatalFetchError";
    this.status = status;
  }
}

export function staleAfterFor(generatedAt) {
  return new Date(
    new Date(generatedAt).getTime() + STALE_AFTER_HOURS * 60 * 60 * 1000,
  ).toISOString();
}

export function buildSearchQuery(language) {
  const qualifiers = ["stars:>=1", "fork:false", "archived:false", "mirror:false", "is:public"];

  if (language) {
    qualifiers.push(`language:${language}`);
  }

  return qualifiers.join(" ");
}

export function buildSearchUrl({ language, page = 1, perPage = SEARCH_PAGE_SIZE } = {}) {
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set("q", buildSearchQuery(language));
  url.searchParams.set("sort", "stars");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  return url;
}

export function buildHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function sleepFor(milliseconds) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, milliseconds);
  });
}

function getHeader(headers, name) {
  return headers?.get?.(name) ?? null;
}

function numericHeader(headers, name) {
  const value = Number(getHeader(headers, name) ?? Number.NaN);
  return Number.isNaN(value) ? null : value;
}

async function waitForSearchSlot(rateLimitState, { requestIntervalMs, sleep }) {
  if (!requestIntervalMs || requestIntervalMs <= 0) {
    return;
  }

  const now = Date.now();
  const elapsed = now - rateLimitState.lastRequestAt;

  if (rateLimitState.lastRequestAt > 0 && elapsed < requestIntervalMs) {
    await sleep(requestIntervalMs - elapsed);
  }

  rateLimitState.lastRequestAt = Date.now();
}

async function readGitHubErrorMessage(response) {
  try {
    const json = await response.json();
    return typeof json.message === "string" ? json.message : "";
  } catch {
    return "";
  }
}

function rateLimitDelayMs(response, { attempt, errorMessage, secondaryRateLimitRetryMs }) {
  if (response.status !== 403 && response.status !== 429) {
    return null;
  }

  const retryAfter = numericHeader(response.headers, "retry-after");

  if (retryAfter !== null) {
    return Math.max(retryAfter * 1000, 0);
  }

  const remaining = numericHeader(response.headers, "x-ratelimit-remaining");
  const reset = numericHeader(response.headers, "x-ratelimit-reset");

  if (remaining === 0 && reset !== null) {
    return Math.max(reset * 1000 - Date.now(), 0) + 1000;
  }

  if (/rate limit|secondary rate|abuse/i.test(errorMessage)) {
    return secondaryRateLimitRetryMs * 2 ** attempt;
  }

  return null;
}

function errorDetail(errorMessage) {
  return errorMessage ? `: ${errorMessage}` : "";
}

function compareEntries(left, right) {
  if (right.stars !== left.stars) {
    return right.stars - left.stars;
  }

  return left.fullName.localeCompare(right.fullName, "en", { sensitivity: "base" });
}

function normalizeItems(items, { language, snapshotAt }) {
  return items
    .flatMap((item) => {
      if (
        !item.id ||
        !item.name ||
        !item.full_name ||
        !item.html_url ||
        typeof item.stargazers_count !== "number"
      ) {
        return [];
      }

      if (item.fork === true || item.archived === true || item.mirror_url) {
        return [];
      }

      const primaryLanguage = item.language ?? null;

      if (language && primaryLanguage !== language) {
        return [];
      }

      const [ownerFromFullName = "", nameFromFullName = ""] = item.full_name.split("/");

      return [
        {
          id: item.id,
          nodeId: item.node_id ?? null,
          owner: item.owner?.login ?? ownerFromFullName,
          name: item.name ?? nameFromFullName,
          fullName: item.full_name,
          htmlUrl: item.html_url,
          description: item.description ?? null,
          stars: item.stargazers_count,
          primaryLanguage,
          fork: item.fork ?? false,
          archived: item.archived ?? false,
          mirror: item.mirror_url ? true : false,
          pushedAt: item.pushed_at ?? null,
          updatedAt: item.updated_at ?? null,
        },
      ];
    })
    .sort(compareEntries)
    .slice(0, RANKING_LIMIT)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
      snapshotAt,
    }));
}

export async function fetchSearchRanking(options = {}) {
  const { language, slug, displayName, token, fetchImpl = fetch, snapshotAt } = options;
  const pageCount = options.pageCount ?? 10;
  const sleep = options.sleep ?? sleepFor;
  const maxRetries = options.maxRetries ?? DEFAULT_SEARCH_MAX_RETRIES;
  const requestIntervalMs = options.requestIntervalMs ?? DEFAULT_SEARCH_REQUEST_INTERVAL_MS;
  const secondaryRateLimitRetryMs =
    options.secondaryRateLimitRetryMs ?? DEFAULT_SECONDARY_RATE_LIMIT_RETRY_MS;
  const rateLimitState = options.rateLimitState ?? { lastRequestAt: 0 };
  const log = options.log ?? console.warn;
  const collectedItems = [];
  let totalCount = 0;
  let incompleteResults = false;
  let rateLimitRemaining = null;
  let requestCount = 0;

  for (let page = 1; page <= pageCount && collectedItems.length < RANKING_LIMIT; page += 1) {
    const url = buildSearchUrl({ language, page });
    const label = `${language ?? "overall"} ranking page ${page}`;
    let response;
    let errorMessage = "";

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      await waitForSearchSlot(rateLimitState, { requestIntervalMs, sleep });

      response = await fetchImpl(url, { headers: buildHeaders(token) });
      requestCount += 1;
      const pageRateLimitRemaining = numericHeader(response.headers, "x-ratelimit-remaining");

      if (pageRateLimitRemaining !== null) {
        rateLimitRemaining =
          rateLimitRemaining === null
            ? pageRateLimitRemaining
            : Math.min(rateLimitRemaining, pageRateLimitRemaining);
      }

      if (response.ok) {
        break;
      }

      errorMessage = await readGitHubErrorMessage(response);
      const retryDelayMs = rateLimitDelayMs(response, {
        attempt,
        errorMessage,
        secondaryRateLimitRetryMs,
      });

      if (retryDelayMs !== null && attempt < maxRetries) {
        log(
          `GitHub Search throttled ${label}; waiting ${Math.ceil(retryDelayMs / 1000)}s before retry ${attempt + 2}/${maxRetries + 1}${errorDetail(errorMessage)}`,
        );
        await sleep(retryDelayMs);
        continue;
      }

      const rateLimited = retryDelayMs !== null || response.status === 429;
      const message = rateLimited
        ? `GitHub Search rate limit blocked ${label} after ${attempt + 1} attempt(s)${errorDetail(errorMessage)}`
        : `GitHub Search returned ${response.status} for ${label}${errorDetail(errorMessage)}`;
      throw new FatalFetchError(message, response.status);
    }

    let json;

    try {
      json = await response.json();
    } catch (error) {
      throw new FatalFetchError(
        `Malformed JSON from GitHub Search for ${language ?? "overall"} ranking page ${page}: ${error.message}`,
      );
    }

    if (!Array.isArray(json.items)) {
      throw new FatalFetchError(
        `GitHub Search response for ${language ?? "overall"} page ${page} did not include items`,
      );
    }

    totalCount = json.total_count ?? totalCount;
    incompleteResults = incompleteResults || Boolean(json.incomplete_results);
    collectedItems.push(...json.items);

    if (json.items.length < SEARCH_PAGE_SIZE) {
      break;
    }
  }

  const items = normalizeItems(collectedItems, { language, snapshotAt });
  const result = {
    totalCount,
    incompleteResults,
    query: buildSearchQuery(language),
    items,
    rateLimitRemaining,
    requestCount,
  };

  if (!language && result.items.length === 0) {
    throw new FatalFetchError("Overall ranking response contained no usable repository entries");
  }

  if (language) {
    return {
      language,
      slug,
      displayName,
      totalCount: result.totalCount,
      incompleteResults: result.incompleteResults,
      query: result.query,
      generatedAt: snapshotAt,
      items: result.items,
      rateLimitRemaining: result.rateLimitRemaining,
      requestCount: result.requestCount,
    };
  }

  return result;
}

export async function buildSnapshot({
  token = process.env.GITHUB_TOKEN,
  fetchImpl = fetch,
  languages = DEFAULT_LANGUAGES,
  now = new Date(),
  sleep = sleepFor,
  maxRetries = DEFAULT_SEARCH_MAX_RETRIES,
  requestIntervalMs = DEFAULT_SEARCH_REQUEST_INTERVAL_MS,
  secondaryRateLimitRetryMs = DEFAULT_SECONDARY_RATE_LIMIT_RETRY_MS,
  log = console.warn,
} = {}) {
  const generatedAt = now.toISOString();
  const enabledLanguages = languages.filter((language) => language.enabled);
  const warnings = [];
  const rateLimitState = { lastRequestAt: 0 };
  let requestCount = 0;
  let rateLimitRemaining = null;

  const overall = await fetchSearchRanking({
    token,
    fetchImpl,
    snapshotAt: generatedAt,
    sleep,
    maxRetries,
    requestIntervalMs,
    secondaryRateLimitRetryMs,
    rateLimitState,
    log,
  });
  requestCount += overall.requestCount;
  rateLimitRemaining = overall.rateLimitRemaining;

  if (overall.incompleteResults) {
    warnings.push("Overall ranking search returned incomplete results.");
  }

  const languageRankings = [];

  for (const language of enabledLanguages) {
    const ranking = await fetchSearchRanking({
      language: language.language,
      slug: language.slug,
      displayName: language.displayName,
      token,
      fetchImpl,
      snapshotAt: generatedAt,
      sleep,
      maxRetries,
      requestIntervalMs,
      secondaryRateLimitRetryMs,
      rateLimitState,
      log,
    });
    requestCount += ranking.requestCount;

    if (ranking.rateLimitRemaining !== null) {
      rateLimitRemaining =
        rateLimitRemaining === null
          ? ranking.rateLimitRemaining
          : Math.min(rateLimitRemaining, ranking.rateLimitRemaining);
    }

    if (ranking.incompleteResults) {
      warnings.push(`${language.displayName} ranking search returned incomplete results.`);
    }

    const {
      rateLimitRemaining: _remaining,
      requestCount: _requestCount,
      ...publicRanking
    } = ranking;
    languageRankings.push(publicRanking);
  }

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    generatedAt,
    staleAfter: staleAfterFor(generatedAt),
    source: {
      api: "github-rest-search",
      apiVersion: API_VERSION,
      workflowRunId: process.env.GITHUB_RUN_ID ?? null,
      requestCount,
      rateLimitRemaining,
    },
    overall: overall.items,
    languages: languageRankings,
    errors: warnings,
  };
}

export async function validateSnapshot(
  snapshot,
  schemaPath = "specs/001-github-star-ranking/contracts/data-snapshot.schema.json",
) {
  const schema = JSON.parse(await readFile(resolve(schemaPath), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
  const validate = ajv.compile(schema);

  if (!validate(snapshot)) {
    throw new FatalFetchError(
      `Generated snapshot failed schema validation: ${ajv.errorsText(validate.errors)}`,
    );
  }
}

export async function writeSnapshot(snapshot, outputPath = DEFAULT_OUTPUT) {
  const absolutePath = resolve(outputPath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

export async function run(options = {}) {
  const snapshot = await buildSnapshot(options);
  await validateSnapshot(snapshot, options.schemaPath);
  await writeSnapshot(snapshot, options.outputPath);
  return snapshot;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
