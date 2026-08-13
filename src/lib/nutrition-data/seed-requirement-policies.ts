import type { PrismaClient } from "@/generated/prisma/client";
import { REQUIREMENT_POLICY_KEYS } from "./requirements/constants";

export async function seedRequirementSourcePolicies(prisma: PrismaClient) {
  const policies = [
    {
      code: REQUIREMENT_POLICY_KEYS.pendingReview,
      name: "Pending professional requirement source policy",
      authority: "REVIEW_REQUIRED",
      version: "0.0.0",
      jurisdiction: "INTERNAL" as const,
      populationScope: "No production population until approved",
      priority: 0,
      reviewStatus: "REVIEW_REQUIRED" as const,
      devOnly: true,
      conflictResolution:
        "Do not average conflicting sources. Retain both values and route to professional review.",
      notes: "Placeholder until an approved requirement source policy is signed off.",
    },
    {
      code: REQUIREMENT_POLICY_KEYS.efsaEuV1,
      name: "EFSA Dietary Reference Values (EU production)",
      authority: "EFSA",
      version: "2017-e15121",
      jurisdiction: "EU" as const,
      populationScope:
        "Healthy adults aged 18-49 years without clinical conditions",
      sourceUrl:
        "https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf",
      termsUrl: "https://www.efsa.europa.eu/en/legalnotice",
      license:
        "© European Food Safety Authority, 2017 — Reproduction is authorised provided the source is acknowledged.",
      licenseName: "EFSA 2017 DRV Summary Report copyright notice",
      licenseVersion: "2017-e15121",
      licenseUrl: "https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf",
      commercialUseAllowed: true,
      storageAllowed: true,
      transformationAllowed: true,
      customerDisplayAllowed: true,
      redistributionAllowed: true,
      licenseVerified: true,
      termsVerifiedAt: new Date("2026-08-12T00:00:00.000Z"),
      verifiedBy: "phase2-official-terms-review",
      verificationMethod: "official-document-copyright-notice",
      verificationNotes:
        "EFSA 2017 DRV Summary Report (e15121) states: 'Reproduction is authorised provided the source is acknowledged.' EFSA legal notice states: 'Re-use is authorised, provided that EFSA is acknowledged as the source of the material.' Numeric values imported only from official summary report tables.",
      attributionText:
        "EFSA (European Food Safety Authority), 2017. Dietary reference values for nutrients: Summary report. EFSA supporting publication 2017:e15121.",
      citationRequirement:
        "Acknowledge EFSA as source. Suggested citation in report: doi:10.2903/sp.efsa.2017.e15121",
      reviewStatus: "APPROVED" as const,
      priority: 10,
      conflictResolution:
        "V1 primary source for EU jurisdiction. NNR and US DRI remain reference-only. Never average conflicting values.",
      notes:
        "Production requirement source for healthy adults 18-49. Sodium DRV not imported (ongoing at time of 2017 report). Energy and E% AMDR handled outside scalar requirement rows.",
    },
    {
      code: REQUIREMENT_POLICY_KEYS.nnr2023Nordic,
      name: "Nordic Nutrition Recommendations 2023 (reference only)",
      authority: "NNR committee",
      version: "2023",
      jurisdiction: "NORDIC" as const,
      populationScope: "Nordic populations — reference comparison only",
      sourceUrl: "https://nordicnutrition.org/",
      termsUrl: "https://nordicnutrition.org/",
      license: "Publication copyright — numeric commercial redistribution not verified",
      commercialUseAllowed: false,
      storageAllowed: false,
      transformationAllowed: false,
      customerDisplayAllowed: false,
      redistributionAllowed: false,
      licenseVerified: false,
      reviewStatus: "REVIEW_REQUIRED" as const,
      priority: 5,
      conflictResolution:
        "Fallback/reference only. Never averaged with EFSA or US DRI without explicit approved policy.",
      notes: "Reference framework only. Not imported.",
    },
    {
      code: REQUIREMENT_POLICY_KEYS.usDriV1,
      name: "US National Academies Dietary Reference Intakes (reference only)",
      authority: "US National Academies",
      version: "DRI framework",
      jurisdiction: "US" as const,
      populationScope: "US populations — reference comparison only",
      sourceUrl: "https://www.nationalacademies.org/our-work/summary-report-of-dietary-reference-intakes",
      termsUrl: "https://www.nationalacademies.org/about/terms-of-use",
      license: "National Academies terms — numeric commercial redistribution not verified",
      commercialUseAllowed: false,
      storageAllowed: false,
      transformationAllowed: false,
      customerDisplayAllowed: false,
      redistributionAllowed: false,
      licenseVerified: false,
      reviewStatus: "REVIEW_REQUIRED" as const,
      priority: 5,
      conflictResolution:
        "Fallback/reference only for future US RequirementSet. Never averaged with EU values.",
      notes: "Future US jurisdiction set. Not imported.",
    },
  ];

  for (const policy of policies) {
    await prisma.requirementSourcePolicy.upsert({
      where: { code: policy.code },
      create: policy,
      update: {
        name: policy.name,
        authority: policy.authority,
        version: policy.version,
        jurisdiction: policy.jurisdiction,
        populationScope: policy.populationScope,
        sourceUrl: policy.sourceUrl ?? null,
        termsUrl: policy.termsUrl ?? null,
        license: policy.license ?? null,
        licenseName: policy.licenseName ?? null,
        licenseVersion: policy.licenseVersion ?? null,
        licenseUrl: policy.licenseUrl ?? null,
        commercialUseAllowed: policy.commercialUseAllowed,
        storageAllowed: policy.storageAllowed,
        transformationAllowed: policy.transformationAllowed,
        customerDisplayAllowed: policy.customerDisplayAllowed,
        redistributionAllowed: policy.redistributionAllowed,
        licenseVerified: policy.licenseVerified,
        termsVerifiedAt: policy.termsVerifiedAt ?? null,
        verifiedBy: policy.verifiedBy ?? null,
        verificationMethod: policy.verificationMethod ?? null,
        verificationNotes: policy.verificationNotes ?? null,
        attributionText: policy.attributionText ?? null,
        citationRequirement: policy.citationRequirement ?? null,
        reviewStatus: policy.reviewStatus,
        priority: policy.priority,
        conflictResolution: policy.conflictResolution,
        notes: policy.notes,
        devOnly: policy.devOnly ?? false,
      },
    });
  }

  await prisma.energyMethod.upsert({
    where: { code: "pending-energy-method" },
    create: {
      code: "pending-energy-method",
      version: "0.0.0",
      source: "REVIEW_REQUIRED",
      description:
        "Placeholder energy estimation method. Energy remains an estimate, not exact metabolism.",
      formulaDescription: null,
      assumptions:
        "No production formula selected. Mifflin/activity equations are not finalized in Phase 2.",
      reviewStatus: "REVIEW_REQUIRED",
    },
    update: {
      reviewStatus: "REVIEW_REQUIRED",
      assumptions:
        "No production formula selected. Mifflin/activity equations are not finalized in Phase 2.",
    },
  });
}

export async function seedRequirementConflicts(prisma: PrismaClient) {
  const efsa = await prisma.requirementSourcePolicy.findUnique({
    where: { code: REQUIREMENT_POLICY_KEYS.efsaEuV1 },
  });
  const nnr = await prisma.requirementSourcePolicy.findUnique({
    where: { code: REQUIREMENT_POLICY_KEYS.nnr2023Nordic },
  });

  if (!efsa || !nnr) return;

  const existing = await prisma.requirementConflict.findFirst({
    where: {
      nutrientCode: "vitamin_d",
      primaryPolicyId: efsa.id,
      secondaryPolicyId: nnr.id,
    },
  });

  if (existing) return;

  await prisma.requirementConflict.create({
    data: {
      nutrientCode: "vitamin_d",
      primaryPolicyId: efsa.id,
      secondaryPolicyId: nnr.id,
      primaryValue: 15,
      secondaryValue: 10,
      unit: "mcg",
      resolution:
        "Documented example conflict only. Do not average. Await approved production import for both sources.",
      reviewStatus: "REVIEW_REQUIRED",
    },
  });
}
