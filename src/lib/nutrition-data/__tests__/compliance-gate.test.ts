import { describe, expect, it } from "vitest";
import {
  assertDevOnlyImportAllowed,
  assertSourceEligibleForProductionImport,
  evaluateSourceCompliance,
  SOURCE_COMPLIANCE_IMPORT_BLOCKED,
} from "@/lib/nutrition-data/compliance-gate";

const approvedSource = {
  sourceKey: "usda-fdc",
  status: "APPROVED" as const,
  devOnly: false,
  commercialUseAllowed: true,
  storageAllowed: true,
  transformationAllowed: true,
  customerDisplayAllowed: true,
  redistributionAllowed: true,
  licenseVerified: true,
  termsVerifiedAt: new Date("2026-08-12"),
  termsUrl: "https://fdc.nal.usda.gov/api-guide.html",
};

describe("source compliance gate", () => {
  it("passes when all compliance fields are satisfied", () => {
    const result = evaluateSourceCompliance(approvedSource);
    expect(result.eligible).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("fails when status is not APPROVED", () => {
    const result = evaluateSourceCompliance({
      ...approvedSource,
      status: "CANDIDATE",
    });
    expect(result.eligible).toBe(false);
    expect(result.failures.some((row) => row.includes("APPROVED"))).toBe(true);
  });

  it("fails when any required permission is false", () => {
    const result = evaluateSourceCompliance({
      ...approvedSource,
      redistributionAllowed: false,
    });
    expect(result.eligible).toBe(false);
    expect(result.failures.some((row) => row.includes("redistributionAllowed"))).toBe(true);
  });

  it("fails when termsVerifiedAt or termsUrl is missing", () => {
    const missingDate = evaluateSourceCompliance({
      ...approvedSource,
      termsVerifiedAt: null,
    });
    expect(missingDate.eligible).toBe(false);

    const missingUrl = evaluateSourceCompliance({
      ...approvedSource,
      termsUrl: null,
    });
    expect(missingUrl.eligible).toBe(false);
  });

  it("throws on assertSourceEligibleForProductionImport", () => {
    expect(() =>
      assertSourceEligibleForProductionImport({
        ...approvedSource,
        licenseVerified: false,
      }),
    ).toThrow(SOURCE_COMPLIANCE_IMPORT_BLOCKED);
  });

  it("blocks dev-only source without bundle devOnly flag", () => {
    expect(() =>
      assertDevOnlyImportAllowed(false, { sourceKey: "fixture-v1", devOnly: true }),
    ).toThrow(/dev-only/);
  });
});
