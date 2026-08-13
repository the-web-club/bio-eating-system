export const REQUIREMENT_POLICY_KEYS = {
  pendingReview: "policy-pending-review",
  efsaEuV1: "efsa-drv-eu-v1",
  nnr2023Nordic: "nnr2023-nordic-v1",
  usDriV1: "us-dri-v1",
} as const;

/** V1 intended commercial population scope (documented, not assumed universal). */
export const V1_POPULATION_SCOPE =
  "Healthy adults aged 18-49 years without clinical conditions";

/** Energy and macronutrients tracked alongside micronutrients. */
export const MACRONUTRIENT_SCOPE = [
  "energy_kcal",
  "protein",
  "carbohydrate",
  "fat",
  "fiber",
  "omega3",
] as const;

/** Thirteen EFSA vitamins with scalar DRV rows in the 2017 summary report slice. */
export const VITAMIN_MICRONUTRIENT_SCOPE = [
  "vitamin_a",
  "vitamin_c",
  "vitamin_d",
  "vitamin_e",
  "vitamin_k",
  "thiamin",
  "riboflavin",
  "niacin",
  "vitamin_b6",
  "folate",
  "vitamin_b12",
  "biotin",
  "pantothenic_acid",
] as const;

/** Essential minerals with scalar DRV rows in the 2017 summary report slice. */
export const MINERAL_MICRONUTRIENT_SCOPE = [
  "calcium",
  "phosphorus",
  "magnesium",
  "potassium",
  "iron",
  "zinc",
  "copper",
  "manganese",
  "selenium",
  "iodine",
  "molybdenum",
  "fluoride",
] as const;

/** Other reviewed nutrients imported from USDA Foundation but without EFSA scalar rows. */
export const MONITOR_ONLY_NUTRIENT_SCOPE = ["sodium", "chromium"] as const;

/** Reviewed essential nutrients with EFSA AI rows outside the classic 13 vitamins. */
export const OTHER_MICRONUTRIENT_SCOPE = ["choline"] as const;

/** Full Biological OS nutrient tracking scope once food + requirement data both exist. */
export const BIOLOGICAL_OS_NUTRIENT_SCOPE = [
  ...MACRONUTRIENT_SCOPE,
  ...VITAMIN_MICRONUTRIENT_SCOPE,
  ...OTHER_MICRONUTRIENT_SCOPE,
  ...MINERAL_MICRONUTRIENT_SCOPE,
  ...MONITOR_ONLY_NUTRIENT_SCOPE,
] as const;

export type BiologicalOsNutrientCode = (typeof BIOLOGICAL_OS_NUTRIENT_SCOPE)[number];

/** Nutrients with food-composition rows but no imported EFSA requirement row yet. */
export const PARTIALLY_SUPPORTED_NUTRIENTS = [...MONITOR_ONLY_NUTRIENT_SCOPE] as const;

/** @deprecated Use empty list; USDA catalog now imports the full micronutrient set. */
export const UNSUPPORTED_IN_USDA_SLICE = [] as const;

/** EFSA reference energy used to convert thiamin and niacin PRI from mg/MJ to mg/day. */
export const EFSA_REFERENCE_ENERGY_MJ = {
  male: 11.2,
  female: 9.0,
} as const;
