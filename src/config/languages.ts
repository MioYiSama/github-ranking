import { assertUniqueLanguageSlugs } from "../lib/slugs";
import type { LanguageConfig } from "../lib/types";

export const LANGUAGES: LanguageConfig[] = [
  { language: "Python", slug: "python", displayName: "Python", enabled: true },
  { language: "Go", slug: "go", displayName: "Go", enabled: true },
  { language: "Rust", slug: "rust", displayName: "Rust", enabled: true },
  { language: "JavaScript", slug: "javascript", displayName: "JavaScript", enabled: true },
  { language: "TypeScript", slug: "typescript", displayName: "TypeScript", enabled: true },
  { language: "C", slug: "c", displayName: "C", enabled: true },
  { language: "C++", slug: "c-plus-plus", displayName: "C++", enabled: true },
  { language: "Java", slug: "java", displayName: "Java", enabled: true },
  { language: "Kotlin", slug: "kotlin", displayName: "Kotlin", enabled: true },
];

assertUniqueLanguageSlugs(LANGUAGES);

export function getEnabledLanguages(): LanguageConfig[] {
  return LANGUAGES.filter((language) => language.enabled);
}

export function findLanguageBySlug(slug: string): LanguageConfig | null {
  return getEnabledLanguages().find((language) => language.slug === slug) ?? null;
}
