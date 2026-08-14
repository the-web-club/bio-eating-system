import { SOURCE_KEYS } from "@/lib/nutrition-data/constants";

/**
 * Deterministic source priority when multiple approved observations exist for the same
 * canonical food and nutrient. Lower rank wins. Never average conflicting values silently.
 */
export const SOURCE_PRIORITY_RANK: Record<string, number> = {
  [SOURCE_KEYS.usda]: 10,
  [SOURCE_KEYS.fineli]: 20,
  [SOURCE_KEYS.ciqual]: 30,
  [SOURCE_KEYS.cnf]: 40,
  [SOURCE_KEYS.afcd]: 50,
  [SOURCE_KEYS.foodb]: 90,
  [SOURCE_KEYS.foodhub]: 91,
  [SOURCE_KEYS.eurofir]: 95,
};

export type SourceObservation<T> = T & {
  source: string;
  sourceVersion: string;
  amount: number;
};

export type SourceConflict<T> = {
  nutrientCode: string;
  canonicalFoodKey: string;
  observations: SourceObservation<T>[];
};

export function sourcePriorityRank(sourceKey: string): number {
  return SOURCE_PRIORITY_RANK[sourceKey] ?? 100;
}

export function pickPreferredObservation<T>(
  observations: SourceObservation<T>[],
): SourceObservation<T> | null {
  if (observations.length === 0) return null;

  return [...observations].sort((a, b) => {
    const rankDiff = sourcePriorityRank(a.source) - sourcePriorityRank(b.source);
    if (rankDiff !== 0) return rankDiff;
    const versionDiff = b.sourceVersion.localeCompare(a.sourceVersion);
    if (versionDiff !== 0) return versionDiff;
    return b.amount - a.amount;
  })[0];
}

export function detectMaterialConflicts<T extends { nutrientCode: string; amount: number }>(args: {
  canonicalFoodKey: string;
  observations: SourceObservation<T>[];
  relativeTolerance?: number;
}): SourceConflict<T>[] {
  const tolerance = args.relativeTolerance ?? 0.15;
  const byNutrient = new Map<string, SourceObservation<T>[]>();

  for (const observation of args.observations) {
    const list = byNutrient.get(observation.nutrientCode) ?? [];
    list.push(observation);
    byNutrient.set(observation.nutrientCode, list);
  }

  const conflicts: SourceConflict<T>[] = [];

  for (const [nutrientCode, rows] of byNutrient.entries()) {
    if (rows.length < 2) continue;
    const preferred = pickPreferredObservation(rows);
    if (!preferred) continue;

    const hasMaterialDifference = rows.some((row) => {
      if (row.source === preferred.source && row.sourceVersion === preferred.sourceVersion) {
        return false;
      }
      const baseline = Math.max(preferred.amount, 0.000001);
      return Math.abs(row.amount - preferred.amount) / baseline > tolerance;
    });

    if (hasMaterialDifference) {
      conflicts.push({
        nutrientCode,
        canonicalFoodKey: args.canonicalFoodKey,
        observations: rows,
      });
    }
  }

  return conflicts;
}
