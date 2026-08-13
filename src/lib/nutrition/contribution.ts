import type { NutrientUnit } from "@/generated/prisma/client";
import type { FoodPortion, NutrientContributionRow, NutrientTotal } from "@/lib/nutrition-data/types";

export const CONTRIBUTION_VERSION = "contribution-0.1.0";

export function nutrientAmountForPortion(
  row: NutrientContributionRow,
  grams: number,
): number {
  if (grams <= 0 || row.perAmountG <= 0) return 0;
  return (row.amount / row.perAmountG) * grams;
}

export function totalsForPortions(args: {
  portions: FoodPortion[];
  profiles: Map<string, NutrientContributionRow[]>;
}): NutrientTotal[] {
  const totals = new Map<string, NutrientTotal>();

  for (const portion of args.portions) {
    const rows = args.profiles.get(portion.foodId) ?? [];
    for (const row of rows) {
      const added = nutrientAmountForPortion(row, portion.grams);
      const key = `${row.nutrientCode}:${row.unit}`;
      const existing = totals.get(key);
      if (existing) {
        existing.total += added;
      } else {
        totals.set(key, {
          nutrientCode: row.nutrientCode,
          unit: row.unit,
          total: added,
        });
      }
    }
  }

  return [...totals.values()].sort((a, b) => a.nutrientCode.localeCompare(b.nutrientCode));
}

export function contributionRowsFromProfile(args: {
  foodId: string;
  externalId: string;
  name: string;
  rows: Array<{
    code: string;
    unit: NutrientUnit;
    amount: number;
    perAmountG: number;
    source: string;
    sourceVersion: string;
  }>;
}): NutrientContributionRow[] {
  return args.rows.map((row) => ({
    nutrientCode: row.code,
    unit: row.unit,
    amount: row.amount,
    perAmountG: row.perAmountG,
    source: row.source,
    sourceVersion: row.sourceVersion,
  }));
}
