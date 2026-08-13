import type { NutrientDefRecord } from "../../schema";

/** USDA FoodData Central nutrient.id -> internal nutrient definition. */
export const USDA_NUTRIENT_CATALOG: NutrientDefRecord[] = [
  { code: "energy_kcal", name: "Energy", unit: "kcal", nutrientClass: "ENERGY" },
  { code: "protein", name: "Protein", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "fat", name: "Total fat", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "carbohydrate", name: "Carbohydrate", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "fiber", name: "Dietary fiber", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "omega3", name: "Omega-3 fatty acids", unit: "g", nutrientClass: "FATTY_ACID" },
  { code: "calcium", name: "Calcium", unit: "mg", nutrientClass: "MINERAL" },
  { code: "phosphorus", name: "Phosphorus", unit: "mg", nutrientClass: "MINERAL" },
  { code: "magnesium", name: "Magnesium", unit: "mg", nutrientClass: "MINERAL" },
  { code: "sodium", name: "Sodium", unit: "mg", nutrientClass: "MINERAL" },
  { code: "potassium", name: "Potassium", unit: "mg", nutrientClass: "MINERAL" },
  { code: "iron", name: "Iron", unit: "mg", nutrientClass: "MINERAL" },
  { code: "zinc", name: "Zinc", unit: "mg", nutrientClass: "MINERAL" },
  { code: "copper", name: "Copper", unit: "mg", nutrientClass: "MINERAL" },
  { code: "manganese", name: "Manganese", unit: "mg", nutrientClass: "MINERAL" },
  { code: "selenium", name: "Selenium", unit: "mcg", nutrientClass: "MINERAL" },
  { code: "iodine", name: "Iodine", unit: "mcg", nutrientClass: "MINERAL" },
  { code: "molybdenum", name: "Molybdenum", unit: "mcg", nutrientClass: "MINERAL" },
  { code: "fluoride", name: "Fluoride", unit: "mcg", nutrientClass: "MINERAL" },
  { code: "chromium", name: "Chromium", unit: "mcg", nutrientClass: "MINERAL" },
  { code: "vitamin_a", name: "Vitamin A", unit: "mcg", nutrientClass: "VITAMIN" },
  { code: "vitamin_c", name: "Vitamin C", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "vitamin_d", name: "Vitamin D", unit: "mcg", nutrientClass: "VITAMIN" },
  { code: "vitamin_e", name: "Vitamin E", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "vitamin_k", name: "Vitamin K", unit: "mcg", nutrientClass: "VITAMIN" },
  { code: "thiamin", name: "Thiamin", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "riboflavin", name: "Riboflavin", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "niacin", name: "Niacin", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "vitamin_b6", name: "Vitamin B6", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "folate", name: "Folate", unit: "mcg", nutrientClass: "VITAMIN" },
  { code: "vitamin_b12", name: "Vitamin B12", unit: "mcg", nutrientClass: "VITAMIN" },
  { code: "biotin", name: "Biotin", unit: "mcg", nutrientClass: "VITAMIN" },
  { code: "pantothenic_acid", name: "Pantothenic acid", unit: "mg", nutrientClass: "VITAMIN" },
  { code: "choline", name: "Choline", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
];

type NutrientMapping = {
  code: string;
  /** Multiply USDA amount by this factor to reach the internal catalog unit. */
  scale?: number;
};

const USDA_NUTRIENT_MAPPINGS: Record<number, NutrientMapping> = {
  1008: { code: "energy_kcal" },
  2047: { code: "energy_kcal" },
  2048: { code: "energy_kcal" },
  1003: { code: "protein" },
  1004: { code: "fat" },
  1005: { code: "carbohydrate" },
  1079: { code: "fiber" },
  1272: { code: "omega3" },
  1087: { code: "calcium" },
  1091: { code: "phosphorus" },
  1090: { code: "magnesium" },
  1093: { code: "sodium" },
  1092: { code: "potassium" },
  1089: { code: "iron" },
  1095: { code: "zinc" },
  1098: { code: "copper" },
  1101: { code: "manganese" },
  1103: { code: "selenium" },
  1100: { code: "iodine" },
  1104: { code: "molybdenum" },
  1105: { code: "fluoride" },
  1096: { code: "chromium" },
  1106: { code: "vitamin_a" },
  1162: { code: "vitamin_c" },
  1114: { code: "vitamin_d" },
  1109: { code: "vitamin_e" },
  1185: { code: "vitamin_k" },
  1165: { code: "thiamin" },
  1166: { code: "riboflavin" },
  1167: { code: "niacin" },
  1175: { code: "vitamin_b6" },
  1177: { code: "folate" },
  1178: { code: "vitamin_b12" },
  1176: { code: "biotin" },
  1170: { code: "pantothenic_acid" },
  1180: { code: "choline" },
};

export const USDA_NUTRIENT_ID_TO_CODE: Record<number, string> = Object.fromEntries(
  Object.entries(USDA_NUTRIENT_MAPPINGS).map(([nutrientId, mapping]) => [
    Number(nutrientId),
    mapping.code,
  ]),
);

export function mapUsdaNutrientAmount(
  nutrientId: number,
  amount: number | null | undefined,
): { code: string; amount: number } | null {
  const mapping = USDA_NUTRIENT_MAPPINGS[nutrientId];
  if (!mapping || amount === null || amount === undefined || !Number.isFinite(amount)) {
    return null;
  }
  if (amount < 0) return null;

  const scaledAmount = amount * (mapping.scale ?? 1);
  return { code: mapping.code, amount: scaledAmount };
}
