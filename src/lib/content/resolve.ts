/**
 * Content catalogue resolver. Reviewed copy lives under content/ when authored.
 * Missing keys return null — never invent science or lesson prose. rules.md §4.5.
 */

import "server-only";

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

type Catalogue = Record<string, string>;

let cache: Catalogue | null | undefined;

function loadCatalogue(): Catalogue | null {
  if (cache !== undefined) return cache;
  const path = join(process.cwd(), "content", "en.json");
  if (!existsSync(path)) {
    cache = null;
    return null;
  }
  try {
    cache = JSON.parse(readFileSync(path, "utf8")) as Catalogue;
  } catch {
    cache = null;
  }
  return cache;
}

export function resolveContent(key: string): string | null {
  const catalogue = loadCatalogue();
  if (!catalogue) return null;
  const value = catalogue[key];
  return typeof value === "string" && value.trim() ? value : null;
}
