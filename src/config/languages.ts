import { assertUniqueLanguageSlugs } from "../lib/slugs";
import type { LanguageConfig } from "../lib/types";

export const LANGUAGES: LanguageConfig[] = [
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

assertUniqueLanguageSlugs(LANGUAGES);

export function getEnabledLanguages(): LanguageConfig[] {
  return LANGUAGES.filter((language) => language.enabled);
}

export function findLanguageBySlug(slug: string): LanguageConfig | null {
  return getEnabledLanguages().find((language) => language.slug === slug) ?? null;
}
