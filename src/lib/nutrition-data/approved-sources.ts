import { SOURCE_KEYS } from "@/lib/nutrition-data/constants";
import type { SourceComplianceRecord } from "@/lib/nutrition-data/compliance-gate";
import { evaluateSourceCompliance } from "@/lib/nutrition-data/compliance-gate";

/** Source keys that passed the production compliance gate in seed-registry. */
export const PRODUCTION_APPROVED_SOURCE_KEYS = [SOURCE_KEYS.usda] as const;

export type ProductionApprovedSourceKey = (typeof PRODUCTION_APPROVED_SOURCE_KEYS)[number];

export function isProductionApprovedSourceKey(
  sourceKey: string,
): sourceKey is ProductionApprovedSourceKey {
  return (PRODUCTION_APPROVED_SOURCE_KEYS as readonly string[]).includes(sourceKey);
}

export type ApprovedFoodRecord = {
  source: string;
  sourceVersion: string;
  devOnly: boolean;
};

export function assertApprovedProductionFood(record: ApprovedFoodRecord): void {
  if (record.devOnly) {
    throw new Error(`Food from ${record.source} is devOnly and cannot enter production calculations.`);
  }

  if (!record.sourceVersion.trim()) {
    throw new Error(`Food from ${record.source} is missing sourceVersion provenance.`);
  }

  if (!isProductionApprovedSourceKey(record.source)) {
    throw new Error(
      `Food source ${record.source} is not in the production-approved source registry.`,
    );
  }
}

export function isApprovedProductionFood(record: ApprovedFoodRecord): boolean {
  try {
    assertApprovedProductionFood(record);
    return true;
  } catch {
    return false;
  }
}

export function assertSourceRegistryEligible(source: SourceComplianceRecord): void {
  const result = evaluateSourceCompliance(source);
  if (!result.eligible) {
    throw new Error(
      `Source ${source.sourceKey} failed compliance gate: ${result.failures.join(" ")}`,
    );
  }
}
