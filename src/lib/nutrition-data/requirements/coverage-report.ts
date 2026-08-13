import type { NutrientUnit } from "@/generated/prisma/client";
import type { DailyRequirement, NutrientTotal } from "@/lib/nutrition-data/types";

export type NutrientCoverageStatus = "supported" | "partial" | "missing_in_food_data";

export type RequirementCoverageRow = {
  nutrientCode: string;
  unit: NutrientUnit;
  target: number | null;
  actual: number;
  gap: number;
  surplus: number;
  status: NutrientCoverageStatus;
};

export type FoodNutrientPresence = {
  foodId: string;
  foodName: string;
  nutrientCodes: string[];
};

export type RequirementCoverageReport = {
  requirementSetVersion: string;
  requirementRowCount: number;
  nutrientCount: number;
  productionFoodCount: number;
  foodNutrientDefinitions: number;
  supportedNutrients: string[];
  partialNutrients: string[];
  missingNutrients: string[];
  unresolvedIssues: string[];
  coverageRows: RequirementCoverageRow[];
  foodPresence: FoodNutrientPresence[];
};

export function buildRequirementCoverageReport(args: {
  requirementSetVersion: string;
  requirements: DailyRequirement[];
  totals: NutrientTotal[];
  foodPresence: FoodNutrientPresence[];
  trackedNutrients: string[];
  partialNutrients: string[];
  unresolvedIssues?: string[];
}): RequirementCoverageReport {
  const totalsByCode = new Map(args.totals.map((row) => [row.nutrientCode, row]));
  const requirementByCode = new Map(args.requirements.map((row) => [row.nutrientCode, row]));

  const supportedNutrients: string[] = [];
  const partialNutrients: string[] = [];
  const missingNutrients: string[] = [];

  for (const nutrientCode of args.trackedNutrients) {
    const hasFoodData = totalsByCode.has(nutrientCode);
    const hasRequirement = requirementByCode.has(nutrientCode);

    if (hasFoodData && hasRequirement) {
      supportedNutrients.push(nutrientCode);
      continue;
    }

    if (args.partialNutrients.includes(nutrientCode)) {
      partialNutrients.push(nutrientCode);
      continue;
    }

    if (!hasFoodData) {
      missingNutrients.push(nutrientCode);
    }
  }

  for (const nutrientCode of args.partialNutrients) {
    if (!totalsByCode.has(nutrientCode) && !partialNutrients.includes(nutrientCode)) {
      partialNutrients.push(nutrientCode);
    }
  }

  const coverageRows: RequirementCoverageRow[] = args.requirements.map((requirement) => {
    const actualRow = totalsByCode.get(requirement.nutrientCode);
    const actual = actualRow?.total ?? 0;
    const gap = Math.max(requirement.value - actual, 0);
    const surplus = Math.max(actual - requirement.value, 0);
    const status: NutrientCoverageStatus = actualRow
      ? "supported"
      : args.partialNutrients.includes(requirement.nutrientCode)
        ? "partial"
        : "missing_in_food_data";

    return {
      nutrientCode: requirement.nutrientCode,
      unit: requirement.unit,
      target: requirement.value,
      actual,
      gap,
      surplus,
      status,
    };
  });

  return {
    requirementSetVersion: args.requirementSetVersion,
    requirementRowCount: args.requirements.length,
    nutrientCount: args.requirements.length,
    productionFoodCount: args.foodPresence.length,
    foodNutrientDefinitions: new Set(args.totals.map((row) => row.nutrientCode)).size,
    supportedNutrients,
    partialNutrients,
    missingNutrients,
    unresolvedIssues: args.unresolvedIssues ?? [],
    coverageRows,
    foodPresence: args.foodPresence,
  };
}
