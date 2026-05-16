import generatedSnapshot from "./generated/rankings.json";
import fixtureSnapshot from "./fixtures/rankings.sample.json";

export const snapshotData =
  process.env.RANKING_SNAPSHOT_SOURCE === "fixture" ? fixtureSnapshot : generatedSnapshot;
