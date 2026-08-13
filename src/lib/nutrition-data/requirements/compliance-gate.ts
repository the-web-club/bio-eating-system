import type { RecordReviewStatus, RequirementJurisdiction } from "@/generated/prisma/client";

export const REQUIREMENT_COMPLIANCE_IMPORT_BLOCKED =
  "Production requirement import blocked: source policy failed legal compliance gate";

export type RequirementPolicyComplianceRecord = {
  code: string;
  reviewStatus: RecordReviewStatus;
  devOnly: boolean;
  commercialUseAllowed: boolean;
  storageAllowed: boolean;
  transformationAllowed: boolean;
  customerDisplayAllowed: boolean;
  redistributionAllowed: boolean;
  licenseVerified: boolean;
  termsVerifiedAt: Date | null;
  termsUrl: string | null;
  sourceUrl: string | null;
};

export type RequirementPolicyComplianceResult = {
  eligible: boolean;
  failures: string[];
};

export function evaluateRequirementPolicyCompliance(
  policy: RequirementPolicyComplianceRecord,
): RequirementPolicyComplianceResult {
  const failures: string[] = [];

  if (policy.devOnly) {
    failures.push("Requirement source policy is devOnly.");
  }

  if (policy.reviewStatus !== "APPROVED") {
    failures.push(`Policy reviewStatus is ${policy.reviewStatus}; APPROVED is required.`);
  }

  if (!policy.licenseVerified) {
    failures.push("licenseVerified must be true.");
  }

  for (const field of [
    "commercialUseAllowed",
    "storageAllowed",
    "transformationAllowed",
    "customerDisplayAllowed",
    "redistributionAllowed",
  ] as const) {
    if (!policy[field]) {
      failures.push(`${field} must be true.`);
    }
  }

  if (!policy.termsVerifiedAt) {
    failures.push("termsVerifiedAt is required.");
  }

  if (!policy.termsUrl?.trim()) {
    failures.push("termsUrl is required.");
  }

  if (!policy.sourceUrl?.trim()) {
    failures.push("sourceUrl is required.");
  }

  return { eligible: failures.length === 0, failures };
}

export function assertRequirementPolicyEligibleForProductionImport(
  policy: RequirementPolicyComplianceRecord,
): void {
  const result = evaluateRequirementPolicyCompliance(policy);
  if (!result.eligible) {
    throw new Error(
      `${REQUIREMENT_COMPLIANCE_IMPORT_BLOCKED} (${policy.code}): ${result.failures.join(" ")}`,
    );
  }
}

export type RequirementSetProductionRecord = {
  version: string;
  devOnly: boolean;
  reviewStatus: RecordReviewStatus;
  source: string;
  sourceVersion: string;
  sourceUrl: string | null;
  termsUrl: string | null;
  jurisdiction: RequirementJurisdiction;
  requirements: Array<{
    nutrientCode: string;
    reviewStatus: RecordReviewStatus;
    devOnly: boolean;
    referenceType: string;
    value: number | null;
    valueMin: number | null;
    valueMax: number | null;
    unit: string;
  }>;
};

export function evaluateRequirementSetProductionReady(
  set: RequirementSetProductionRecord,
): RequirementPolicyComplianceResult {
  const failures: string[] = [];

  if (set.devOnly) {
    failures.push("RequirementSet is devOnly.");
  }

  if (set.reviewStatus !== "APPROVED") {
    failures.push(`RequirementSet reviewStatus is ${set.reviewStatus}; APPROVED is required.`);
  }

  if (!set.source.trim()) {
    failures.push("source is required.");
  }

  if (!set.sourceVersion.trim()) {
    failures.push("sourceVersion is required.");
  }

  if (!set.sourceUrl?.trim()) {
    failures.push("sourceUrl is required.");
  }

  if (!set.termsUrl?.trim()) {
    failures.push("termsUrl is required.");
  }

  if (set.requirements.length === 0) {
    failures.push("RequirementSet has no requirement rows.");
  }

  for (const row of set.requirements) {
    if (row.devOnly) {
      failures.push(`Requirement row ${row.nutrientCode} is devOnly.`);
    }
    if (row.reviewStatus !== "APPROVED") {
      failures.push(`Requirement row ${row.nutrientCode} is not APPROVED.`);
    }
    const scalar = row.value ?? row.valueMin ?? row.valueMax;
    if (scalar === null || scalar === undefined) {
      failures.push(`Requirement row ${row.nutrientCode} has no numeric value.`);
    }
  }

  return { eligible: failures.length === 0, failures };
}

export function assertRequirementSetProductionReady(set: RequirementSetProductionRecord): void {
  const result = evaluateRequirementSetProductionReady(set);
  if (!result.eligible) {
    throw new Error(
      `Production requirement set blocked (${set.version}): ${result.failures.join(" ")}`,
    );
  }
}
