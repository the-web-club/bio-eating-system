import type { DataSourceStatus } from "@/generated/prisma/client";
import { SOURCE_KEYS } from "@/lib/nutrition-data/constants";

export type SourceRegistryEntry = {
  sourceKey: string;
  name: string;
  provider: string;
  datasetName: string;
  licenseStatus: DataSourceStatus;
  licenseUrl: string | null;
  termsUrl: string | null;
  commercialUseAllowed: boolean;
  redistributionAllowed: boolean;
  derivativeUseAllowed: boolean;
  attributionRequired: boolean;
  verifiedAt: string | null;
  verificationNotes: string;
  importerStatus: "implemented" | "stub" | "none";
  productionEligible: boolean;
};

const TERMS_VERIFIED_AT = "2026-08-12T00:00:00.000Z";

/**
 * Static mirror of `seedDataSourceRegistry()` for code-side gates and documentation.
 * Database remains authoritative at import time.
 */
export const SOURCE_REGISTRY: SourceRegistryEntry[] = [
  {
    sourceKey: SOURCE_KEYS.usda,
    name: "USDA FoodData Central",
    provider: "USDA ARS",
    datasetName: "FoodData Central Foundation Foods",
    licenseStatus: "APPROVED",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    termsUrl: "https://fdc.nal.usda.gov/api-guide.html",
    commercialUseAllowed: true,
    redistributionAllowed: true,
    derivativeUseAllowed: true,
    attributionRequired: true,
    verifiedAt: TERMS_VERIFIED_AT,
    verificationNotes: "CC0 / public domain per USDA FDC API guide.",
    importerStatus: "implemented",
    productionEligible: true,
  },
  {
    sourceKey: SOURCE_KEYS.fineli,
    name: "Fineli Finnish Food Composition Database",
    provider: "Fineli / THL",
    datasetName: "Fineli",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    termsUrl: "https://fineli.fi/fineli/en/avoin-data",
    commercialUseAllowed: true,
    redistributionAllowed: true,
    derivativeUseAllowed: true,
    attributionRequired: true,
    verifiedAt: TERMS_VERIFIED_AT,
    verificationNotes: "CC BY 4.0 appears permissive; THL endorsement copy needs review.",
    importerStatus: "stub",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.eurofir,
    name: "EuroFIR / FoodEXplorer",
    provider: "EuroFIR AISBL",
    datasetName: "FoodEXplorer",
    licenseStatus: "FUTURE_OPTION",
    licenseUrl: "https://www.eurofir.org/",
    termsUrl: "https://www.eurofir.org/",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes: "Membership terms and commercial redistribution not verified.",
    importerStatus: "stub",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.nnr2023,
    name: "Nordic Nutrition Recommendations 2023",
    provider: "NNR committee",
    datasetName: "NNR2023",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: null,
    termsUrl: "https://nordicnutrition.org/",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes: "Numeric table commercial redistribution not verified.",
    importerStatus: "none",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.foodhub,
    name: "PhytoHub",
    provider: "PhytoHub consortium",
    datasetName: "PhytoHub",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: null,
    termsUrl: "https://phytohub.eu/",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes:
      "Commercial reuse terms not verified. Adapter reserved; production import blocked until legal audit.",
    importerStatus: "stub",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.foodb,
    name: "FooDB",
    provider: "University of Alberta / Wishart Research Group",
    datasetName: "FooDB",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: null,
    termsUrl: "https://foodb.ca/about",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes:
      "Commercial redistribution terms not verified. Adapter reserved; production import blocked until legal audit.",
    importerStatus: "stub",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.afcd,
    name: "Australian Food Composition Database",
    provider: "FSANZ",
    datasetName: "AFCD",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: null,
    termsUrl: "https://www.foodstandards.gov.au/science/monitoringnutrients/afcd",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes: "Official FSANZ terms require explicit commercial reuse audit.",
    importerStatus: "stub",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.cnf,
    name: "Canadian Nutrient File",
    provider: "Health Canada",
    datasetName: "CNF",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: null,
    termsUrl: "https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data.html",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes: "Open Government terms require explicit commercial reuse audit.",
    importerStatus: "stub",
    productionEligible: false,
  },
  {
    sourceKey: SOURCE_KEYS.ciqual,
    name: "Ciqual",
    provider: "ANSES",
    datasetName: "Ciqual",
    licenseStatus: "REVIEW_REQUIRED",
    licenseUrl: null,
    termsUrl: "https://ciqual.anses.fr/",
    commercialUseAllowed: false,
    redistributionAllowed: false,
    derivativeUseAllowed: false,
    attributionRequired: true,
    verifiedAt: null,
    verificationNotes: "ANSES open-data licence requires explicit commercial reuse audit.",
    importerStatus: "stub",
    productionEligible: false,
  },
];

export function getSourceRegistryEntry(sourceKey: string): SourceRegistryEntry | undefined {
  return SOURCE_REGISTRY.find((row) => row.sourceKey === sourceKey);
}

export function productionEligibleSourceKeys(): string[] {
  return SOURCE_REGISTRY.filter((row) => row.productionEligible).map((row) => row.sourceKey);
}
