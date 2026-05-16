import type { LanguageConfig } from "./types";

const LANGUAGE_SLUG_ALIASES = new Map<string, string>([
  ["c++", "c-plus-plus"],
  ["c#", "c-sharp"],
  ["f#", "f-sharp"],
  ["objective-c", "objective-c"],
  ["jupyter notebook", "jupyter-notebook"],
]);

export function toLanguageSlug(language: string): string {
  const normalized = language.trim().toLowerCase();
  const aliased = LANGUAGE_SLUG_ALIASES.get(normalized);

  if (aliased) {
    return aliased;
  }

  return normalized
    .replace(/\+/g, " plus ")
    .replace(/#/g, " sharp ")
    .replace(/\./g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function repositoryIdentifier(owner: string, name: string): string {
  return `${owner.trim().toLowerCase()}/${name.trim().toLowerCase()}`;
}

export function normalizeRepositoryFullName(fullName: string): string {
  const trimmed = fullName.trim();
  const parts = trimmed.split("/");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Repository full name must use owner/name format: ${fullName}`);
  }

  return `${parts[0]}/${parts[1]}`;
}

export function assertUniqueLanguageSlugs(languages: LanguageConfig[]): void {
  const seen = new Set<string>();

  for (const language of languages) {
    if (seen.has(language.slug)) {
      throw new Error(`Duplicate language slug: ${language.slug}`);
    }

    seen.add(language.slug);
  }
}
