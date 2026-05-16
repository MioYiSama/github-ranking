import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let built = false;

export function ensureBuiltSite() {
  if (!built) {
    execFileSync("pnpm", ["build:static"], {
      cwd: resolve("."),
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: "1",
        SNAPSHOT_NOW: "2026-05-16T12:00:00.000Z",
      },
      stdio: "pipe",
    });
    built = true;
  }
}

export function readBuiltHtml(path: string): string {
  ensureBuiltSite();
  return readFileSync(resolve("dist", path), "utf8");
}
