import type { FoodSourceBundle } from "./schema";

export type ImportValidationIssue = {
  outcome: "rejected" | "warning";
  entityType: string;
  externalId?: string;
  message: string;
};

export type ImportValidationReport = {
  rowsReceived: number;
  rowsImported: number;
  rowsRejected: number;
  rowsWarning: number;
  issues: ImportValidationIssue[];
};

export function validateFoodSourceBundle(bundle: FoodSourceBundle): ImportValidationReport {
  const issues: ImportValidationIssue[] = [];
  const nutrientCodes = new Set(bundle.nutrients.map((row) => row.code));
  let rowsReceived = bundle.nutrients.length;

  for (const nutrient of bundle.nutrients) {
    if (!nutrient.code.trim()) {
      issues.push({
        outcome: "rejected",
        entityType: "nutrient",
        message: "Nutrient code is required",
      });
    }
  }

  for (const food of bundle.foods) {
    rowsReceived += 1 + food.nutrients.length + food.allergens.length;

    if (!food.externalId.trim()) {
      issues.push({
        outcome: "rejected",
        entityType: "food",
        message: "Food externalId is required",
      });
    }

    if (!food.preparationState) {
      issues.push({
        outcome: "warning",
        entityType: "food",
        externalId: food.externalId,
        message: "Missing preparationState; defaulting to RAW during import",
      });
    }

    if (food.nutrients.length === 0) {
      issues.push({
        outcome: "rejected",
        entityType: "food",
        externalId: food.externalId,
        message: "Food must contain at least one nutrient row",
      });
    }

    for (const row of food.nutrients) {
      if (!nutrientCodes.has(row.code)) {
        issues.push({
          outcome: "rejected",
          entityType: "food_nutrient",
          externalId: food.externalId,
          message: `Unknown nutrient code ${row.code}`,
        });
      }
      if (row.amount < 0 || !Number.isFinite(row.amount)) {
        issues.push({
          outcome: "rejected",
          entityType: "food_nutrient",
          externalId: food.externalId,
          message: `Invalid amount for nutrient ${row.code}`,
        });
      }
      if (row.perAmountG <= 0) {
        issues.push({
          outcome: "rejected",
          entityType: "food_nutrient",
          externalId: food.externalId,
          message: `Invalid basis amount for nutrient ${row.code}`,
        });
      }
    }
  }

  const foodIds = new Set(bundle.foods.map((food) => food.externalId));
  for (const sub of bundle.substitutions) {
    rowsReceived += 1;
    if (!foodIds.has(sub.fromExternalId) || !foodIds.has(sub.toExternalId)) {
      issues.push({
        outcome: "rejected",
        entityType: "substitution",
        message: `Substitution references unknown food: ${sub.fromExternalId} -> ${sub.toExternalId}`,
      });
    }
  }

  rowsReceived += bundle.requirementSet.requirements.length;
  for (const req of bundle.requirementSet.requirements) {
    if (!nutrientCodes.has(req.nutrientCode)) {
      issues.push({
        outcome: "rejected",
        entityType: "requirement",
        message: `Requirement references unknown nutrient ${req.nutrientCode}`,
      });
    }
    if (req.referenceType === "UL" && req.value !== null && req.value !== undefined) {
      issues.push({
        outcome: "warning",
        entityType: "requirement",
        message: `UL row for ${req.nutrientCode} must be reviewed before production use`,
      });
    }
  }

  const rowsRejected = issues.filter((issue) => issue.outcome === "rejected").length;
  const rowsWarning = issues.filter((issue) => issue.outcome === "warning").length;

  return {
    rowsReceived,
    rowsImported: Math.max(rowsReceived - rowsRejected, 0),
    rowsRejected,
    rowsWarning,
    issues,
  };
}

export function bundleHasBlockingValidationIssues(report: ImportValidationReport): boolean {
  return report.rowsRejected > 0;
}
