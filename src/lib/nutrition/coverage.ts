import type { CoverageRow, DailyRequirement, NutrientTotal, RemovalDelta } from "@/lib/nutrition-data/types";

export const COVERAGE_ENGINE_VERSION = "coverage-0.1.0";

export function compareCoverage(args: {
  requirements: DailyRequirement[];
  totals: NutrientTotal[];
}): CoverageRow[] {
  const totalsByCode = new Map(args.totals.map((row) => [row.nutrientCode, row]));

  return args.requirements.map((requirement) => {
    const actualRow = totalsByCode.get(requirement.nutrientCode);
    const actual = actualRow?.total ?? 0;
    const gap = Math.max(requirement.value - actual, 0);
    const surplus = Math.max(actual - requirement.value, 0);

    return {
      nutrientCode: requirement.nutrientCode,
      unit: requirement.unit,
      target: requirement.value,
      actual,
      gap,
      surplus,
    };
  });
}

export function nutrientDeltaOnRemoval(args: {
  withFood: NutrientTotal[];
  withoutFood: NutrientTotal[];
}): RemovalDelta[] {
  const withoutByCode = new Map(args.withoutFood.map((row) => [row.nutrientCode, row]));
  const deltas: RemovalDelta[] = [];

  for (const row of args.withFood) {
    const remaining = withoutByCode.get(row.nutrientCode)?.total ?? 0;
    const lost = Math.max(row.total - remaining, 0);
    if (lost <= 0) continue;
    deltas.push({
      nutrientCode: row.nutrientCode,
      unit: row.unit,
      lost,
    });
  }

  return deltas.sort((a, b) => a.nutrientCode.localeCompare(b.nutrientCode));
}

export function gapsFromRemoval(args: {
  baselineCoverage: CoverageRow[];
  removalDelta: RemovalDelta[];
}): CoverageRow[] {
  const deltaByCode = new Map(args.removalDelta.map((row) => [row.nutrientCode, row.lost]));

  return args.baselineCoverage.map((row) => {
    const lost = deltaByCode.get(row.nutrientCode) ?? 0;
    const actual = Math.max(row.actual - lost, 0);
    const gap = Math.max(row.target - actual, 0);
    const surplus = Math.max(actual - row.target, 0);

    return {
      nutrientCode: row.nutrientCode,
      unit: row.unit,
      target: row.target,
      actual,
      gap,
      surplus,
    };
  });
}
