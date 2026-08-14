import type { Allergen } from "@/lib/nutrition/plan-engine";
import type { FoodSourceRecord } from "../../schema";

export type UsdaSliceEntry = {
  fdcId: number;
  biologicalCategory: FoodSourceRecord["biologicalCategory"];
  preparationState: NonNullable<FoodSourceRecord["preparationState"]>;
  displayName?: string;
  allergens: Allergen[];
  foodCategories: string[];
};

/** Hand-reviewed v1 production slice (26 foods). */
export { USDA_SLICE_OVERRIDES_V1 as USDA_PRODUCTION_SLICE } from "./slice-overrides";

export const USDA_SLICE_VERSION_V1 = "2025-04-24-production-slice-v1";
export const USDA_SLICE_VERSION_V2 = "2025-04-24-production-slice-v2";
export const USDA_SLICE_VERSION_V3 = "2026-04-30-production-slice-v3";

/** Default import and engine production version. */
export const USDA_SLICE_VERSION = USDA_SLICE_VERSION_V3;

export const USDA_ATTRIBUTION =
  "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019. fdc.nal.usda.gov.";
