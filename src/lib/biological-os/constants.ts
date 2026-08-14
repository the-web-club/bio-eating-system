export const BIOLOGICAL_OS_ENGINE_VERSION = "biological-os-engine-0.1.0";
export const ENERGY_CALCULATION_VERSION = "energy-mifflin-met-v1" as const;
export const MET_REFERENCE_VERSION = "met-reference-v1" as const;
export const PHYTONUTRIENT_CATALOG_VERSION = "phytonutrient-catalog-v2" as const;

export const APPROVED_FOOD_SOURCE = "usda-fdc" as const;
/** Default import snapshot pin for reproducibility, not an architecture limit on approved sources. */
export const APPROVED_FOOD_SOURCE_VERSION = "2026-04-30-production-slice-v3" as const;
export const APPROVED_REQUIREMENT_SET_VERSION = "efsa-drv-eu-2017-v2" as const;
export const OPTIMIZER_POLICY_VERSION = "optimizer-policy-v1" as const;
export const PHYTONUTRIENT_POLICY_VERSION = "phytonutrient-policy-v1" as const;

/** Default edible portion used by the v1 heuristic optimizer (grams). */
export const DEFAULT_PORTION_GRAMS = 100;

/** Nutrients compared for grain redundancy detection in v1. */
export const GRAIN_OVERLAP_NUTRIENTS = ["fiber", "carbohydrate"] as const;
