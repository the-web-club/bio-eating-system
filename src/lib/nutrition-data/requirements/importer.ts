import type { PrismaClient } from "@/generated/prisma/client";
import {
  assertRequirementPolicyEligibleForProductionImport,
  evaluateRequirementPolicyCompliance,
} from "./compliance-gate";
import { parseRequirementSetBundle, type RequirementSetBundle } from "./schema";
import {
  bundleHasBlockingRequirementIssues,
  validateRequirementSetBundle,
} from "./validate-import";

export type RequirementImportResult = {
  setVersion: string;
  policyCode: string;
  rowsReceived: number;
  rowsImported: number;
  rowsRejected: number;
  rowsWarning: number;
  devOnly: boolean;
  reviewStatus: "REVIEW_REQUIRED" | "APPROVED";
};

export async function importRequirementSetBundle(
  prisma: PrismaClient,
  raw: unknown,
): Promise<RequirementImportResult> {
  const bundle = parseRequirementSetBundle(raw);
  const validation = validateRequirementSetBundle(bundle);

  if (bundleHasBlockingRequirementIssues(validation)) {
    throw new Error(
      `Requirement import validation failed with ${validation.rowsRejected} rejected rows`,
    );
  }

  const policy = await prisma.requirementSourcePolicy.findUnique({
    where: { code: bundle.policyCode },
  });

  if (!policy) {
    throw new Error(`Unknown requirement source policy: ${bundle.policyCode}`);
  }

  const isProductionImport = !bundle.devOnly && !policy.devOnly;
  if (isProductionImport) {
    assertRequirementPolicyEligibleForProductionImport(policy);
  } else {
    const compliance = evaluateRequirementPolicyCompliance(policy);
    if (!compliance.eligible && !bundle.devOnly) {
      throw new Error(
        `Requirement policy ${bundle.policyCode} is not eligible for non-dev import: ${compliance.failures.join(" ")}`,
      );
    }
  }

  const existing = await prisma.requirementSet.findUnique({
    where: { version: bundle.setVersion },
    select: { reviewStatus: true, devOnly: true },
  });

  if (
    existing &&
    existing.reviewStatus === "APPROVED" &&
    !existing.devOnly &&
    !bundle.devOnly
  ) {
    throw new Error(
      `Refusing to overwrite approved production requirement set ${bundle.setVersion}`,
    );
  }

  const nutrientRows = await prisma.nutrient.findMany({ select: { id: true, code: true } });
  const nutrientIdByCode = new Map(nutrientRows.map((row) => [row.code, row.id]));

  const set = await prisma.requirementSet.upsert({
    where: { version: bundle.setVersion },
    create: {
      version: bundle.setVersion,
      name: bundle.name,
      jurisdiction: bundle.jurisdiction,
      populationScope: bundle.populationScope,
      source: bundle.source,
      sourceVersion: bundle.sourceVersion,
      effectiveDate: bundle.effectiveDate ? new Date(bundle.effectiveDate) : null,
      sourceUrl: bundle.sourceUrl ?? null,
      termsUrl: bundle.termsUrl ?? null,
      sourcePolicyId: policy.id,
      reviewStatus: bundle.devOnly ? "REVIEW_REQUIRED" : bundle.setReviewStatus,
      devOnly: bundle.devOnly || policy.devOnly,
      importedAt: new Date(),
    },
    update: {
      name: bundle.name,
      jurisdiction: bundle.jurisdiction,
      populationScope: bundle.populationScope,
      source: bundle.source,
      sourceVersion: bundle.sourceVersion,
      effectiveDate: bundle.effectiveDate ? new Date(bundle.effectiveDate) : null,
      sourceUrl: bundle.sourceUrl ?? null,
      termsUrl: bundle.termsUrl ?? null,
      sourcePolicyId: policy.id,
      reviewStatus: bundle.devOnly ? "REVIEW_REQUIRED" : bundle.setReviewStatus,
      devOnly: bundle.devOnly || policy.devOnly,
      importedAt: new Date(),
    },
  });

  await prisma.nutrientRequirement.deleteMany({ where: { setId: set.id } });

  let rowsImported = 0;
  for (const req of bundle.requirements) {
    const nutrientId = nutrientIdByCode.get(req.nutrientCode);
    if (!nutrientId) {
      throw new Error(`Missing nutrient for requirement ${req.nutrientCode}`);
    }

    const scalarValue = req.value ?? req.valueMin ?? req.valueMax;
    if (scalarValue === null || scalarValue === undefined) {
      throw new Error(`Requirement ${req.nutrientCode} missing numeric value`);
    }

    await prisma.nutrientRequirement.create({
      data: {
        setId: set.id,
        nutrientId,
        ageMin: req.ageMin,
        ageMax: req.ageMax,
        sex: req.sex,
        lifeStage: req.lifeStage ?? null,
        referenceType: req.referenceType,
        value: req.value ?? null,
        valueMin: req.valueMin ?? null,
        valueMax: req.valueMax ?? null,
        unit: req.unit,
        sourcePolicyCode: bundle.policyCode,
        sourceVersion: bundle.sourceVersion,
        reviewStatus: req.reviewStatus ?? "REVIEW_REQUIRED",
        devOnly: bundle.devOnly || policy.devOnly,
      },
    });
    rowsImported += 1;
  }

  return {
    setVersion: bundle.setVersion,
    policyCode: bundle.policyCode,
    rowsReceived: validation.rowsReceived,
    rowsImported,
    rowsRejected: validation.rowsRejected,
    rowsWarning: validation.rowsWarning,
    devOnly: set.devOnly,
    reviewStatus: set.reviewStatus === "APPROVED" ? "APPROVED" : "REVIEW_REQUIRED",
  };
}

export async function loadRequirementSetBundleFromFile(
  path: string,
): Promise<RequirementSetBundle> {
  const { readFileSync } = await import("node:fs");
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return parseRequirementSetBundle(raw);
}
