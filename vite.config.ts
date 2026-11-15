import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite-plus";

export default defineConfig({
  // Relative asset URLs, so the build works under any GitHub Pages sub-path.
  base: "./",
  // No SPA fallback: a missing rankings/<date>.json must 404 in dev, not return index.html.
  appType: "mpa",
  plugins: [svelte()],
  fmt: {
    ignorePatterns: ["rankings/**"],
  },
});
