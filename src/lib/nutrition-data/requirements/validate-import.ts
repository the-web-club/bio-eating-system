import type { RequirementSetBundle } from "./schema";

export type RequirementValidationIssue = {
  outcome: "rejected" | "warning";
  entityType: string;
  nutrientCode?: string;
  message: string;
};

export type RequirementValidationReport = {
  rowsReceived: number;
  rowsRejected: number;
  rowsWarning: number;
  issues: RequirementValidationIssue[];
};

export function validateRequirementSetBundle(
  bundle: RequirementSetBundle,
): RequirementValidationReport {
  const issues: RequirementValidationIssue[] = [];
  const rowsReceived = bundle.requirements.length;

  if (!bundle.devOnly && bundle.setReviewStatus === "APPROVED") {
    issues.push({
      outcome: "warning",
      entityType: "requirement_set",
      message: "Production bundles must not self-approve without policy compliance review",
    });
  }

  for (const row of bundle.requirements) {
    const scalar = row.value ?? row.valueMin ?? row.valueMax;
    if (scalar === null || scalar === undefined) {
      issues.push({
        outcome: "rejected",
        entityType: "requirement",
        nutrientCode: row.nutrientCode,
        message: "Requirement row must include value, valueMin, or valueMax",
      });
    }

    if (row.ageMin >= row.ageMax) {
      issues.push({
        outcome: "rejected",
        entityType: "requirement",
        nutrientCode: row.nutrientCode,
        message: "ageMin must be less than ageMax",
      });
    }

    if (row.referenceType === "UL" && row.value !== null && row.value !== undefined) {
      issues.push({
        outcome: "warning",
        entityType: "requirement",
        nutrientCode: row.nutrientCode,
        message: "UL rows require professional review before production use",
      });
    }

    if (row.referenceType === "AMDR" && row.valueMin === null && row.valueMax === null) {
      issues.push({
        outcome: "rejected",
        entityType: "requirement",
        nutrientCode: row.nutrientCode,
        message: "AMDR rows require valueMin and/or valueMax",
      });
    }
  }

  const rowsRejected = issues.filter((issue) => issue.outcome === "rejected").length;
  const rowsWarning = issues.filter((issue) => issue.outcome === "warning").length;

  return { rowsReceived, rowsRejected, rowsWarning, issues };
}

export function bundleHasBlockingRequirementIssues(report: RequirementValidationReport): boolean {
  return report.rowsRejected > 0;
}

export type RequirementConflictCandidate = {
  nutrientCode: string;
  primaryValue: number;
  secondaryValue: number;
  unit: string;
};

export function detectRequirementConflicts(
  primary: Array<{ nutrientCode: string; sex: "female" | "male" | null; ageMin: number; ageMax: number; value: number; unit: string }>,
  secondary: Array<{ nutrientCode: string; sex: "female" | "male" | null; ageMin: number; ageMax: number; value: number; unit: string }>,
): RequirementConflictCandidate[] {
  const conflicts: RequirementConflictCandidate[] = [];

  for (const a of primary) {
    for (const b of secondary) {
      if (a.nutrientCode !== b.nutrientCode) continue;
      if (a.unit !== b.unit) continue;
      if (a.sex !== b.sex) continue;
      if (a.ageMin !== b.ageMin || a.ageMax !== b.ageMax) continue;
      if (Math.abs(a.value - b.value) < 0.0001) continue;
      conflicts.push({
        nutrientCode: a.nutrientCode,
        primaryValue: a.value,
        secondaryValue: b.value,
        unit: a.unit,
      });
    }
  }

  return conflicts;
}
