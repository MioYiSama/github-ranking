import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE ?? "https://example.com";
const base = process.env.PUBLIC_BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
