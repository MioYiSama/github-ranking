import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import { assertRankingOrder } from "../../src/lib/ranking";
import type { RankingSnapshot } from "../../src/lib/types";

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(resolve(path), "utf8")) as T;
}

describe("ranking snapshot contract", () => {
  it.each([
    "src/data/fixtures/rankings.sample.json",
    "src/data/fixtures/rankings.stale.json",
    "src/data/generated/rankings.json",
  ])("validates %s against the JSON Schema", async (path) => {
    const schema = await readJson<Record<string, unknown>>(
      "specs/001-github-star-ranking/contracts/data-snapshot.schema.json",
    );
    const snapshot = await readJson<RankingSnapshot>(path);
    const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
    const validate = ajv.compile(schema);

    expect(validate(snapshot), ajv.errorsText(validate.errors)).toBe(true);
  });

  it("keeps generated rankings sequential and sorted", async () => {
    const snapshot = await readJson<RankingSnapshot>("src/data/generated/rankings.json");
    assertRankingOrder(snapshot.overall);
    snapshot.languages.forEach((language) => assertRankingOrder(language.items));
  });
});
