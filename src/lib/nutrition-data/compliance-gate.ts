import type { DataSourceStatus } from "@/generated/prisma/client";

export const SOURCE_COMPLIANCE_IMPORT_BLOCKED =
  "Production import blocked: data source failed legal compliance gate";

export type SourceComplianceRecord = {
  sourceKey: string;
  status: DataSourceStatus;
  devOnly: boolean;
  commercialUseAllowed: boolean;
  storageAllowed: boolean;
  transformationAllowed: boolean;
  customerDisplayAllowed: boolean;
  redistributionAllowed: boolean;
  licenseVerified: boolean;
  termsVerifiedAt: Date | null;
  termsUrl: string | null;
};

export type SourceComplianceResult = {
  eligible: boolean;
  failures: string[];
};

export function evaluateSourceCompliance(
  source: SourceComplianceRecord,
): SourceComplianceResult {
  const failures: string[] = [];

  if (source.devOnly) {
    failures.push("Source is marked devOnly and cannot power production imports.");
  }

  if (source.status !== "APPROVED") {
    failures.push(`Source status is ${source.status}; APPROVED is required.`);
  }

  if (!source.licenseVerified) {
    failures.push("licenseVerified must be true.");
  }

  if (!source.commercialUseAllowed) {
    failures.push("commercialUseAllowed must be true.");
  }

  if (!source.storageAllowed) {
    failures.push("storageAllowed must be true.");
  }

  if (!source.transformationAllowed) {
    failures.push("transformationAllowed must be true.");
  }

  if (!source.customerDisplayAllowed) {
    failures.push("customerDisplayAllowed must be true.");
  }

  if (!source.redistributionAllowed) {
    failures.push("redistributionAllowed must be true.");
  }

  if (!source.termsVerifiedAt) {
    failures.push("termsVerifiedAt is required.");
  }

  if (!source.termsUrl?.trim()) {
    failures.push("termsUrl is required.");
  }

  return {
    eligible: failures.length === 0,
    failures,
  };
}

export function assertSourceEligibleForProductionImport(
  source: SourceComplianceRecord,
): void {
  const result = evaluateSourceCompliance(source);
  if (!result.eligible) {
    throw new Error(
      `${SOURCE_COMPLIANCE_IMPORT_BLOCKED} (${source.sourceKey}): ${result.failures.join(" ")}`,
    );
  }
}

export function assertDevOnlyImportAllowed(
  bundleDevOnly: boolean,
  source: Pick<SourceComplianceRecord, "sourceKey" | "devOnly">,
): void {
  if (source.devOnly && !bundleDevOnly) {
    throw new Error(
      `Import blocked: ${source.sourceKey} is dev-only and cannot be imported without devOnly=true on the bundle.`,
    );
  }
}
