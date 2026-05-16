import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const generatedAt = "2026-05-16T00:00:00.000Z";
const staleAfter = "2026-05-17T12:00:00.000Z";
const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "Shell",
  "HTML",
  "CSS",
  "Vue",
  "Svelte",
  "Astro",
  "Jupyter Notebook",
];

const syntheticLanguages = languages.filter((language) => language !== "Python");

const languageSlugs = new Map([
  ["C++", "c-plus-plus"],
  ["C#", "c-sharp"],
  ["Jupyter Notebook", "jupyter-notebook"],
]);

const baseEntries = [
  repo(
    28457823,
    "freeCodeCamp",
    "freeCodeCamp",
    410000,
    "TypeScript",
    "freeCodeCamp.org's open-source codebase and curriculum.",
  ),
  repo(
    1062897,
    "EbookFoundation",
    "free-programming-books",
    360000,
    null,
    "Freely available programming books.",
  ),
  repo(
    21737465,
    "sindresorhus",
    "awesome",
    350000,
    null,
    "Awesome lists about all kinds of interesting topics.",
  ),
  repo(2126244, "twbs", "bootstrap", 350000, "JavaScript", null),
  repo(70107786, "vercel", "next.js", 130000, "JavaScript", "The React framework for the web."),
  repo(
    724712,
    "rust-lang",
    "rust",
    105000,
    "Rust",
    "Empowering everyone to build reliable and efficient software.",
  ),
];

function slugFor(language) {
  return languageSlugs.get(language) ?? language.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function repo(id, owner, name, stars, primaryLanguage, description) {
  return {
    id,
    nodeId: `fixture-node-${id}`,
    owner,
    name,
    fullName: `${owner}/${name}`,
    htmlUrl: `https://github.com/${owner}/${name}`,
    description,
    stars,
    primaryLanguage,
    fork: false,
    archived: false,
    mirror: false,
    pushedAt: "2026-05-15T12:00:00.000Z",
    updatedAt: "2026-05-15T12:30:00.000Z",
  };
}

function compareEntries(left, right) {
  if (right.stars !== left.stars) {
    return right.stars - left.stars;
  }

  return left.fullName.localeCompare(right.fullName, "en", { sensitivity: "base" });
}

function rank(entries) {
  return entries
    .toSorted(compareEntries)
    .slice(0, 1000)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      snapshotAt: generatedAt,
    }));
}

function syntheticEntries() {
  return Array.from({ length: 994 }, (_, index) => {
    const language = syntheticLanguages[index % syntheticLanguages.length];
    const padded = String(index + 1).padStart(4, "0");
    return repo(
      900000 + index,
      `demo-${slugFor(language)}`,
      `repository-${padded}`,
      349000 - index * 173,
      language,
      `Synthetic ${language} repository used to exercise the 1000-row virtual ranking.`,
    );
  });
}

function snapshot() {
  const overall = rank([...baseEntries, ...syntheticEntries()]);
  const languageRankings = languages.map((language) => {
    const items = rank(overall.filter((entry) => entry.primaryLanguage === language));
    return {
      language,
      slug: slugFor(language),
      displayName: language,
      totalCount: items.length,
      incompleteResults: false,
      query: `stars:>=1 fork:false archived:false mirror:false is:public language:${language}`,
      generatedAt,
      items,
    };
  });

  return {
    schemaVersion: "1.0.0",
    generatedAt,
    staleAfter,
    source: {
      api: "github-rest-search",
      apiVersion: "2026-03-10",
      workflowRunId: "fixture",
      requestCount: 31,
      rateLimitRemaining: 26,
    },
    overall,
    languages: languageRankings,
    errors: [],
  };
}

async function writeJson(path, data) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const data = snapshot();
await writeJson("src/data/fixtures/rankings.sample.json", data);
await writeJson("src/data/generated/rankings.json", data);
