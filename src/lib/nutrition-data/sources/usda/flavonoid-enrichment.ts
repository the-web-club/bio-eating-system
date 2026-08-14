import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { FNDDS_FLAVONOID_SOURCE_VERSION } from "./flavonoid-nutrients";

const enrichmentRecordSchema = z.record(z.string(), z.number().nonnegative());

const enrichmentFileSchema = z.object({
  version: z.literal("foundation-flavonoid-enrichment-v1"),
  source: z.literal("usda-fndds-flavonoid"),
  sourceVersion: z.literal(FNDDS_FLAVONOID_SOURCE_VERSION),
  reviewStatus: z.enum(["REVIEW_REQUIRED", "APPROVED", "REJECTED"]),
  notes: z.string().optional(),
  records: z.record(z.string(), enrichmentRecordSchema),
});

export type FlavonoidEnrichmentFile = z.infer<typeof enrichmentFileSchema>;

let cachedEnrichment: FlavonoidEnrichmentFile | null | undefined;

const ENRICHMENT_PATH = path.join(
  process.cwd(),
  "content/imports/usda-fndds-flavonoids/foundation-flavonoid-enrichment-v1.json",
);

export function loadFlavonoidEnrichment(): FlavonoidEnrichmentFile | null {
  if (cachedEnrichment !== undefined) return cachedEnrichment;
  if (!existsSync(ENRICHMENT_PATH)) {
    cachedEnrichment = null;
    return cachedEnrichment;
  }

  const parsed = enrichmentFileSchema.parse(
    JSON.parse(readFileSync(ENRICHMENT_PATH, "utf8")),
  );
  cachedEnrichment = parsed;
  return parsed;
}

export function resetFlavonoidEnrichmentCacheForTests() {
  cachedEnrichment = undefined;
}

export function flavonoidAmountsForFdcId(fdcId: number): Record<string, number> {
  const enrichment = loadFlavonoidEnrichment();
  if (!enrichment) return {};
  return enrichment.records[String(fdcId)] ?? {};
}
