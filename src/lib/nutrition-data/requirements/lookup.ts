import type { NutrientUnit, ReferenceValueType } from "@/generated/prisma/client";
import type { DailyRequirement, RequirementProfile } from "@/lib/nutrition-data/types";

export type StoredRequirementRow = {
  nutrientCode: string;
  ageMin: number;
  ageMax: number;
  sex: "female" | "male" | null;
  lifeStage?: string | null;
  referenceType: ReferenceValueType;
  value: number | null;
  valueMin: number | null;
  valueMax: number | null;
  unit: NutrientUnit;
  sourcePolicyCode?: string | null;
  sourceVersion?: string | null;
};

export const DEFAULT_REFERENCE_TYPE_PRIORITY: ReferenceValueType[] = [
  "PRI",
  "RI",
  "AR",
  "AI",
  "AMDR",
  "OTHER_REVIEWED_REFERENCE",
  "UL",
];

export function normalizeRequirementUnit(unit: NutrientUnit): NutrientUnit {
  return unit;
}

export function requirementScalarValue(row: StoredRequirementRow): number | null {
  if (row.value !== null && row.value !== undefined) return row.value;
  if (row.valueMin !== null && row.valueMin !== undefined) return row.valueMin;
  if (row.valueMax !== null && row.valueMax !== undefined) return row.valueMax;
  return null;
}

export function filterRequirementsByAge(args: {
  rows: StoredRequirementRow[];
  age: number;
}): StoredRequirementRow[] {
  return args.rows.filter((row) => args.age >= row.ageMin && args.age <= row.ageMax);
}

export function filterRequirementsBySex(args: {
  rows: StoredRequirementRow[];
  sex: RequirementProfile["sex"];
}): StoredRequirementRow[] {
  return args.rows.filter((row) => row.sex === null || row.sex === args.sex);
}

export function selectRequirementByReferenceType(args: {
  rows: StoredRequirementRow[];
  nutrientCode: string;
  preferredTypes?: ReferenceValueType[];
}): StoredRequirementRow | null {
  const preferred = args.preferredTypes ?? DEFAULT_REFERENCE_TYPE_PRIORITY;
  const candidates = args.rows.filter((row) => row.nutrientCode === args.nutrientCode);

  for (const referenceType of preferred) {
    const match = candidates.find((row) => row.referenceType === referenceType);
    if (match && requirementScalarValue(match) !== null) return match;
  }

  return candidates.find((row) => requirementScalarValue(row) !== null) ?? null;
}

export function resolveDailyRequirements(args: {
  profile: RequirementProfile;
  rows: StoredRequirementRow[];
  preferredReferenceTypes?: ReferenceValueType[];
}): DailyRequirement[] {
  const applicable = filterRequirementsByAge({ rows: args.rows, age: args.profile.age });
  const sexScoped = filterRequirementsBySex({ rows: applicable, sex: args.profile.sex });

  const nutrientCodes = [...new Set(sexScoped.map((row) => row.nutrientCode))];
  const results: DailyRequirement[] = [];

  for (const nutrientCode of nutrientCodes) {
    const chosen = selectRequirementByReferenceType({
      rows: sexScoped,
      nutrientCode,
      preferredTypes: args.preferredReferenceTypes,
    });
    const scalar = chosen ? requirementScalarValue(chosen) : null;
    if (!chosen || scalar === null) continue;

    results.push({
      nutrientCode,
      unit: chosen.unit,
      value: scalar,
    });
  }

  return results.sort((a, b) => a.nutrientCode.localeCompare(b.nutrientCode));
}

export function mapDbRequirementRows(
  rows: Array<{
    nutrient: { code: string };
    ageMin: number;
    ageMax: number;
    sex: "female" | "male" | null;
    lifeStage: string | null;
    referenceType: ReferenceValueType;
    value: number | null;
    valueMin: number | null;
    valueMax: number | null;
    unit: NutrientUnit;
    sourcePolicyCode: string | null;
    sourceVersion: string | null;
  }>,
): StoredRequirementRow[] {
  return rows.map((row) => ({
    nutrientCode: row.nutrient.code,
    ageMin: row.ageMin,
    ageMax: row.ageMax,
    sex: row.sex,
    lifeStage: row.lifeStage,
    referenceType: row.referenceType,
    value: row.value,
    valueMin: row.valueMin,
    valueMax: row.valueMax,
    unit: row.unit,
    sourcePolicyCode: row.sourcePolicyCode,
    sourceVersion: row.sourceVersion,
  }));
}
