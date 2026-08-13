import {
  APPROVED_FOOD_SOURCE,
  APPROVED_FOOD_SOURCE_VERSION,
} from "@/lib/biological-os/constants";
import type { EngineFoodCandidate } from "@/lib/biological-os/types";

export class ApprovedDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApprovedDataError";
  }
}

export function assertApprovedFoodCandidate(candidate: EngineFoodCandidate): void {
  if (candidate.devOnly) {
    throw new ApprovedDataError(
      `Food ${candidate.foodId} is devOnly and cannot be used in the Biological OS engine.`,
    );
  }

  if (candidate.source !== APPROVED_FOOD_SOURCE) {
    throw new ApprovedDataError(
      `Food ${candidate.foodId} source ${candidate.source} is not approved.`,
    );
  }

  if (candidate.sourceVersion !== APPROVED_FOOD_SOURCE_VERSION) {
    throw new ApprovedDataError(
      `Food ${candidate.foodId} sourceVersion ${candidate.sourceVersion} is not approved.`,
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
  return candidates.filter((candidate) => {
    try {
      assertApprovedFoodCandidate(candidate);
      return true;
    } catch {
      return false;
    }
  });
}
