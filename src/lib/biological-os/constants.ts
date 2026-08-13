export const BIOLOGICAL_OS_ENGINE_VERSION = "biological-os-engine-0.1.0";

export const APPROVED_FOOD_SOURCE = "usda-fdc" as const;
export const APPROVED_FOOD_SOURCE_VERSION = "2025-04-24-production-slice-v2" as const;
export const APPROVED_REQUIREMENT_SET_VERSION = "efsa-drv-eu-2017-v2" as const;

/** Default edible portion used by the v1 heuristic optimizer (grams). */
export const DEFAULT_PORTION_GRAMS = 100;

/** Nutrients compared for grain redundancy detection in v1. */
export const GRAIN_OVERLAP_NUTRIENTS = ["fiber", "carbohydrate"] as const;
