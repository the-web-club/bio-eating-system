import { describe, expect, it } from "vitest";
import {
  assertRequirementPolicyEligibleForProductionImport,
  assertRequirementSetProductionReady,
  evaluateRequirementPolicyCompliance,
  evaluateRequirementSetProductionReady,
  REQUIREMENT_COMPLIANCE_IMPORT_BLOCKED,
} from "@/lib/nutrition-data/requirements/compliance-gate";
import {
  detectRequirementConflicts,
  validateRequirementSetBundle,
} from "@/lib/nutrition-data/requirements/validate-import";
import { parseRequirementSetBundle } from "@/lib/nutrition-data/requirements/schema";
import {
  filterRequirementsByAge,
  filterRequirementsBySex,
  mapDbRequirementRows,
  normalizeRequirementUnit,
  resolveDailyRequirements,
  selectRequirementByReferenceType,
} from "@/lib/nutrition-data/requirements/lookup";
import { compareCoverage } from "@/lib/nutrition/coverage";
import { nutrientAmountForPortion, totalsForPortions } from "@/lib/nutrition/contribution";
import type { NutrientContributionRow } from "@/lib/nutrition-data/types";

const approvedPolicy = {
  code: "efsa-drv-eu-v1",
  reviewStatus: "APPROVED" as const,
  devOnly: false,
  commercialUseAllowed: true,
  storageAllowed: true,
  transformationAllowed: true,
  customerDisplayAllowed: true,
  redistributionAllowed: true,
  licenseVerified: true,
  termsVerifiedAt: new Date("2026-08-12"),
  termsUrl: "https://www.efsa.europa.eu/en/legalnotice",
  sourceUrl: "https://www.efsa.europa.eu/",
};

const sampleRows = [
  {
    nutrientCode: "protein",
    ageMin: 19,
    ageMax: 50,
    sex: "female" as const,
    referenceType: "PRI" as const,
    value: 45,
    valueMin: null,
    valueMax: null,
    unit: "g" as const,
  },
  {
    nutrientCode: "protein",
    ageMin: 19,
    ageMax: 50,
    sex: "male" as const,
    referenceType: "PRI" as const,
    value: 56,
    valueMin: null,
    valueMax: null,
    unit: "g" as const,
  },
  {
    nutrientCode: "iron",
    ageMin: 19,
    ageMax: 50,
    sex: "female" as const,
    referenceType: "PRI" as const,
    value: 15,
    valueMin: null,
    valueMax: null,
    unit: "mg" as const,
  },
  {
    nutrientCode: "iron",
    ageMin: 19,
    ageMax: 50,
    sex: "female" as const,
    referenceType: "UL" as const,
    value: 40,
    valueMin: null,
    valueMax: null,
    unit: "mg" as const,
  },
  {
    nutrientCode: "carbohydrate",
    ageMin: 19,
    ageMax: 50,
    sex: null,
    referenceType: "AMDR" as const,
    value: null,
    valueMin: 45,
    valueMax: 60,
    unit: "g" as const,
  },
  {
    nutrientCode: "zinc",
    ageMin: 19,
    ageMax: 50,
    sex: null,
    referenceType: "PRI" as const,
    value: 8,
    valueMin: null,
    valueMax: null,
    unit: "mg" as const,
  },
];

describe("requirement source compliance gate", () => {
  it("passes when all compliance fields are satisfied", () => {
    const result = evaluateRequirementPolicyCompliance(approvedPolicy);
    expect(result.eligible).toBe(true);
  });

  it("blocks unapproved source from production import", () => {
    const result = evaluateRequirementPolicyCompliance({
      ...approvedPolicy,
      reviewStatus: "REVIEW_REQUIRED",
      licenseVerified: false,
      commercialUseAllowed: false,
    });
    expect(result.eligible).toBe(false);
    expect(() =>
      assertRequirementPolicyEligibleForProductionImport({
        ...approvedPolicy,
        reviewStatus: "REVIEW_REQUIRED",
      }),
    ).toThrow(REQUIREMENT_COMPLIANCE_IMPORT_BLOCKED);
  });
});

describe("requirement set production gate", () => {
  const approvedSet = {
    version: "efsa-drv-eu-v1",
    devOnly: false,
    reviewStatus: "APPROVED" as const,
    source: "EFSA",
    sourceVersion: "2017",
    sourceUrl: "https://www.efsa.europa.eu/",
    termsUrl: "https://www.efsa.europa.eu/en/legalnotice",
    jurisdiction: "EU" as const,
    requirements: [
      {
        nutrientCode: "protein",
        reviewStatus: "APPROVED" as const,
        devOnly: false,
        referenceType: "PRI",
        value: 45,
        valueMin: null,
        valueMax: null,
        unit: "g",
      },
    ],
  };

  it("blocks dev-only requirement set from production", () => {
    const result = evaluateRequirementSetProductionReady({
      ...approvedSet,
      devOnly: true,
    });
    expect(result.eligible).toBe(false);
  });

  it("blocks missing requirement rows from production", () => {
    const result = evaluateRequirementSetProductionReady({
      ...approvedSet,
      requirements: [],
    });
    expect(result.eligible).toBe(false);
  });

  it("passes when all rows are approved", () => {
    expect(() => assertRequirementSetProductionReady(approvedSet)).not.toThrow();
  });
});

describe("requirement lookup", () => {
  it("persists source metadata through mapDbRequirementRows", () => {
    const mapped = mapDbRequirementRows([
      {
        nutrient: { code: "protein" },
        ageMin: 19,
        ageMax: 50,
        sex: "female",
        lifeStage: null,
        referenceType: "PRI",
        value: 45,
        valueMin: null,
        valueMax: null,
        unit: "g",
        sourcePolicyCode: "efsa-drv-eu-v1",
        sourceVersion: "2017",
      },
    ]);
    expect(mapped[0]?.sourcePolicyCode).toBe("efsa-drv-eu-v1");
    expect(mapped[0]?.sourceVersion).toBe("2017");
  });

  it("filters by age", () => {
    const rows = filterRequirementsByAge({ rows: sampleRows, age: 30 });
    expect(rows.every((row) => row.ageMin <= 30 && row.ageMax >= 30)).toBe(true);
    expect(filterRequirementsByAge({ rows: sampleRows, age: 10 })).toHaveLength(0);
  });

  it("filters by sex", () => {
    const femaleRows = filterRequirementsBySex({ rows: sampleRows, sex: "female" });
    expect(femaleRows.some((row) => row.nutrientCode === "protein" && row.sex === "female")).toBe(
      true,
    );
    expect(femaleRows.some((row) => row.sex === "male")).toBe(false);
  });

  it("selects reference type by priority", () => {
    const chosen = selectRequirementByReferenceType({
      rows: sampleRows,
      nutrientCode: "iron",
      preferredTypes: ["PRI", "UL"],
    });
    expect(chosen?.referenceType).toBe("PRI");
    expect(chosen?.value).toBe(15);
  });

  it("normalizes units without mutation", () => {
    expect(normalizeRequirementUnit("mg")).toBe("mg");
  });

  it("resolves daily requirements for profile", () => {
    const resolved = resolveDailyRequirements({
      profile: { age: 30, sex: "female" },
      rows: sampleRows,
    });
    expect(resolved.find((row) => row.nutrientCode === "protein")?.value).toBe(45);
    expect(resolved.find((row) => row.nutrientCode === "carbohydrate")?.value).toBe(45);
  });
});

describe("requirement conflict detection", () => {
  it("detects conflicts without averaging", () => {
    const primary = [
      {
        nutrientCode: "vitamin_d",
        sex: null,
        ageMin: 19,
        ageMax: 50,
        value: 15,
        unit: "mcg",
      },
    ];
    const secondary = [
      {
        nutrientCode: "vitamin_d",
        sex: null,
        ageMin: 19,
        ageMax: 50,
        value: 10,
        unit: "mcg",
      },
    ];
    const conflicts = detectRequirementConflicts(primary, secondary);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.primaryValue).toBe(15);
    expect(conflicts[0]?.secondaryValue).toBe(10);
  });
});

describe("requirement import validation", () => {
  it("rejects malformed AMDR rows", () => {
    const report = validateRequirementSetBundle({
      policyCode: "policy-pending-review",
      setVersion: "test-v1",
      name: "Test",
      jurisdiction: "INTERNAL",
      populationScope: "Test",
      source: "internal",
      sourceVersion: "0.0.0",
      devOnly: true,
      setReviewStatus: "REVIEW_REQUIRED",
      requirements: [
        {
          nutrientCode: "fat",
          ageMin: 19,
          ageMax: 50,
          sex: null,
          referenceType: "AMDR",
          unit: "g",
        },
      ],
    });
    expect(report.rowsRejected).toBeGreaterThan(0);
  });

  it("does not allow self-approved production bundles", () => {
    const report = validateRequirementSetBundle({
      policyCode: "efsa-drv-eu-v1",
      setVersion: "efsa-v1",
      name: "EFSA",
      jurisdiction: "EU",
      populationScope: "Adults",
      source: "EFSA",
      sourceVersion: "2017",
      devOnly: false,
      setReviewStatus: "APPROVED",
      requirements: [
        {
          nutrientCode: "protein",
          ageMin: 19,
          ageMax: 50,
          sex: "female",
          referenceType: "PRI",
          value: 45,
          unit: "g",
        },
      ],
    });
    expect(report.rowsWarning).toBeGreaterThan(0);
  });
});

describe("EFSA production bundle", () => {
  it("parses the v1 regression requirement slice", async () => {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    const raw = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "content/requirements/efsa-drv-eu-2017-v1.json"),
        "utf8",
      ),
    );
    const bundle = parseRequirementSetBundle(raw);
    expect(bundle.setVersion).toBe("efsa-drv-eu-2017-v1");
    expect(bundle.setReviewStatus).toBe("APPROVED");
    expect(bundle.requirements).toHaveLength(20);
  });

  it("parses the v2 full micronutrient production slice", async () => {
    const { readFileSync } = await import("node:fs");
    const path = await import("node:path");
    const raw = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "content/requirements/efsa-drv-eu-2017-v2.json"),
        "utf8",
      ),
    );
    const bundle = parseRequirementSetBundle(raw);
    expect(bundle.setVersion).toBe("efsa-drv-eu-2017-v2");
    expect(bundle.requirements).toHaveLength(42);
    expect(new Set(bundle.requirements.map((row) => row.nutrientCode)).size).toBe(29);
  });

  it("accepts EFSA policy when official reuse terms are recorded", () => {
    const result = evaluateRequirementPolicyCompliance({
      code: "efsa-drv-eu-v1",
      reviewStatus: "APPROVED",
      devOnly: false,
      commercialUseAllowed: true,
      storageAllowed: true,
      transformationAllowed: true,
      customerDisplayAllowed: true,
      redistributionAllowed: true,
      licenseVerified: true,
      termsVerifiedAt: new Date("2026-08-12"),
      termsUrl: "https://www.efsa.europa.eu/en/legalnotice",
      sourceUrl:
        "https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf",
    });
    expect(result.eligible).toBe(true);
  });
});

describe("food contribution against requirement target", () => {
  it("compares real nutrient contribution to a requirement target", () => {
    const rows: NutrientContributionRow[] = [
      {
        nutrientCode: "protein",
        unit: "g",
        amount: 20,
        perAmountG: 100,
        source: "usda-fdc",
        sourceVersion: "2025-04-24-production-slice-v1",
      },
    ];
    const totals = totalsForPortions({
      portions: [{ foodId: "food-1", grams: 150 }],
      profiles: new Map([["food-1", rows]]),
    });
    const requirements = resolveDailyRequirements({
      profile: { age: 30, sex: "female" },
      rows: sampleRows,
    });
    const coverage = compareCoverage({ requirements, totals });
    const protein = coverage.find((row) => row.nutrientCode === "protein");
    expect(protein?.target).toBe(45);
    expect(protein?.actual).toBeCloseTo(30, 5);
    expect(nutrientAmountForPortion(rows[0]!, 150)).toBeCloseTo(30, 5);
  });
});
