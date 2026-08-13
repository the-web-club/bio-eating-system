import type { PreferenceKind } from "@/generated/prisma/client";
import { totalsForPortions } from "@/lib/nutrition/contribution";
import { compareCoverage } from "@/lib/nutrition/coverage";
import type {
  CoverageRow,
  DailyRequirement,
  NutrientContributionRow,
} from "@/lib/nutrition-data/types";
import type { EngineFoodCandidate, FoodMatrixDraft, FoodMatrixDraftItem } from "@/lib/biological-os/types";

export function filterRequirementsWithFoodData(args: {
  requirements: DailyRequirement[];
  candidates: Array<{ nutrients: NutrientContributionRow[] }>;
}): DailyRequirement[] {
  const availableCodes = new Set<string>();

  for (const candidate of args.candidates) {
    for (const row of candidate.nutrients) {
      if (row.amount > 0) {
        availableCodes.add(row.nutrientCode);
      }
    }
  }

  return args.requirements.filter((requirement) =>
    availableCodes.has(requirement.nutrientCode),
  );
}

export function buildNutrientProfileMap(
  profiles: Array<{ foodId: string; nutrients: NutrientContributionRow[] }>,
): Map<string, NutrientContributionRow[]> {
  return new Map(profiles.map((profile) => [profile.foodId, profile.nutrients]));
}

export function coverageForDraft(args: {
  draft: FoodMatrixDraft;
  requirements: DailyRequirement[];
  profiles: Map<string, NutrientContributionRow[]>;
}): CoverageRow[] {
  const totals = totalsForPortions({
    portions: args.draft.items.map((item) => ({
      foodId: item.foodId,
      grams: item.portionGrams,
    })),
    profiles: args.profiles,
  });

  return compareCoverage({
    requirements: args.requirements,
    totals,
  });
}

export function uncoveredNutrientCodes(coverage: CoverageRow[]): string[] {
  return coverage
    .filter((row) => row.gap > 0.001)
    .map((row) => row.nutrientCode)
    .sort();
}

export function foodSlotToPreference(requiredFoodIds: Set<string>, foodId: string): PreferenceKind {
  return requiredFoodIds.has(foodId) ? "HARD_PREFERENCE" : "SOFT_PREFERENCE";
}

export function sortDraftItems(items: FoodMatrixDraftItem[]): FoodMatrixDraftItem[] {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.foodId.localeCompare(b.foodId);
  });
}

export function draftItemKey(item: FoodMatrixDraftItem): string {
  return `${item.foodId}:${item.biologicalCategorySlug}`;
}
