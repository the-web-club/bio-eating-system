import { PARTIALLY_SUPPORTED_NUTRIENTS } from "@/lib/nutrition-data/requirements/constants";
import type { CoverageRow, DailyRequirement } from "@/lib/nutrition-data/types";
import type { PhytonutrientDiversityResult } from "@/lib/biological-os/phytonutrient-diversity";

export type NutrientAdequacyStatus =
  | "covered"
  | "gap"
  | "unknown"
  | "monitor_only"
  | "no_requirement";

export type NutrientAdequacyRow = {
  nutrientCode: string;
  unit: CoverageRow["unit"];
  target: number | null;
  actual: number | null;
  gap: number;
  surplus: number;
  status: NutrientAdequacyStatus;
};

export type BiologicalAdequacyReport = {
  isBiologicallyComplete: boolean;
  unresolvedNutrients: string[];
  monitorOnlyNutrients: string[];
  rows: NutrientAdequacyRow[];
  phytonutrientDiversity: PhytonutrientDiversityResult | null;
};

export function nutrientsWithCompositionData(
  candidates: Array<{ nutrients: Array<{ nutrientCode: string; amount: number }> }>,
): Set<string> {
  const codes = new Set<string>();
  for (const candidate of candidates) {
    for (const row of candidate.nutrients) {
      if (row.amount > 0) {
        codes.add(row.nutrientCode);
      }
    }
  }
  return codes;
}

export function buildBiologicalAdequacyReport(args: {
  coverage: CoverageRow[];
  requirements: DailyRequirement[];
  compositionNutrientCodes: Set<string>;
  phytonutrientDiversity?: PhytonutrientDiversityResult | null;
}): BiologicalAdequacyReport {
  const requirementCodes = new Set(args.requirements.map((row) => row.nutrientCode));
  const monitorOnly = new Set<string>(PARTIALLY_SUPPORTED_NUTRIENTS);
  const unresolvedNutrients: string[] = [];
  const monitorOnlyNutrients: string[] = [];

  const rows: NutrientAdequacyRow[] = args.coverage.map((row) => {
    const hasRequirement = requirementCodes.has(row.nutrientCode);
    const hasComposition = args.compositionNutrientCodes.has(row.nutrientCode);
    const isMonitorOnly = monitorOnly.has(row.nutrientCode);

    let status: NutrientAdequacyStatus;
    let actual: number | null = row.actual;
    let target: number | null = row.target;

    if (!hasRequirement) {
      status = "no_requirement";
      target = null;
    } else if (!hasComposition) {
      status = "unknown";
      actual = null;
      target = row.target;
      unresolvedNutrients.push(row.nutrientCode);
    } else if (isMonitorOnly) {
      status = "monitor_only";
      monitorOnlyNutrients.push(row.nutrientCode);
    } else if (row.gap > 0.001) {
      status = "gap";
    } else {
      status = "covered";
    }

    return {
      nutrientCode: row.nutrientCode,
      unit: row.unit,
      target,
      actual,
      gap: status === "unknown" ? 0 : row.gap,
      surplus: status === "unknown" ? 0 : row.surplus,
      status,
    };
  });

  const isBiologicallyComplete =
    unresolvedNutrients.length === 0 &&
    rows.every((row) => row.status === "covered" || row.status === "monitor_only" || row.status === "no_requirement");

  return {
    isBiologicallyComplete,
    unresolvedNutrients: [...new Set(unresolvedNutrients)].sort(),
    monitorOnlyNutrients: [...new Set(monitorOnlyNutrients)].sort(),
    rows,
    phytonutrientDiversity: args.phytonutrientDiversity ?? null,
  };
}
