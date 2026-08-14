import {
  assertApprovedProductionFood,
  isApprovedProductionFood,
} from "@/lib/nutrition-data/approved-sources";
import type { EngineFoodCandidate } from "@/lib/biological-os/types";

export class ApprovedDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovedDataError";
  }
}

export function assertApprovedFoodCandidate(candidate: EngineFoodCandidate): void {
  try {
    assertApprovedProductionFood({
      source: candidate.source,
      sourceVersion: candidate.sourceVersion,
      devOnly: candidate.devOnly,
    });
  } catch (error) {
    throw new ApprovedDataError(
      error instanceof Error ? error.message : "Food is not approved for production.",
    );
  }
}

export function filterExcludedCandidates(args: {
  candidates: EngineFoodCandidate[];
  excludedAllergens?: string[];
  hardExcludedFoodIds?: string[];
}): EngineFoodCandidate[] {
  const allergenSet = new Set(args.excludedAllergens ?? []);
  const excludedIds = new Set(args.hardExcludedFoodIds ?? []);

  return args.candidates.filter((candidate) => {
    if (excludedIds.has(candidate.foodId)) return false;
    if (candidate.allergens.some((allergen) => allergenSet.has(allergen))) {
      return false;
    }
    return true;
  });
}

export function filterApprovedCandidates(
  candidates: EngineFoodCandidate[],
): EngineFoodCandidate[] {
  return candidates.filter((candidate) =>
    isApprovedProductionFood({
      source: candidate.source,
      sourceVersion: candidate.sourceVersion,
      devOnly: candidate.devOnly,
    }),
  );
}
