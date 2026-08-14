import type { NutrientDefRecord } from "../../schema";
import { FLAVONOID_NUTRIENT_DEFINITIONS } from "./flavonoid-nutrients";

const FOUNDATION_NUTRIENT_CATALOG: NutrientDefRecord[] = [
  { code: "energy_kcal", name: "Energy", unit: "kcal", nutrientClass: "ENERGY" },
  { code: "protein", name: "Protein", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "fat", name: "Total fat", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "saturated_fat", name: "Saturated fat", unit: "g", nutrientClass: "FATTY_ACID" },
  { code: "carbohydrate", name: "Carbohydrate", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "sugar", name: "Total sugars", unit: "g", nutrientClass: "MACRONUTRIENT" },
  { code: "starch", name: "Starch", unit: "g", nutrientClass: "MACRONUTRIENT" },
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
  { code: "beta_carotene", name: "Beta-carotene", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "carotene_alpha", name: "Carotene, alpha", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "carotene_gamma", name: "Carotene, gamma", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "zeaxanthin", name: "Zeaxanthin", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "cryptoxanthin_beta", name: "Cryptoxanthin, beta", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "cryptoxanthin_alpha", name: "Cryptoxanthin, alpha", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "lutein", name: "Lutein", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "lycopene", name: "Lycopene", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "lutein_zeaxanthin", name: "Lutein plus zeaxanthin", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "cis_beta_carotene", name: "cis-beta-Carotene", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "trans_beta_carotene", name: "trans-beta-Carotene", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "cis_lycopene", name: "cis-Lycopene", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "trans_lycopene", name: "trans-Lycopene", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "cis_lutein_zeaxanthin", name: "cis-Lutein/Zeaxanthin", unit: "mcg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocopherol_beta", name: "Tocopherol, beta", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocopherol_gamma", name: "Tocopherol, gamma", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocopherol_delta", name: "Tocopherol, delta", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocotrienol_alpha", name: "Tocotrienol, alpha", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocotrienol_beta", name: "Tocotrienol, beta", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocotrienol_gamma", name: "Tocotrienol, gamma", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "tocotrienol_delta", name: "Tocotrienol, delta", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "choline_free", name: "Choline, free", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "choline_phosphocholine", name: "Choline, from phosphocholine", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  {
    code: "choline_phosphatidylcholine",
    name: "Choline, from phosphotidyl choline",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  {
    code: "choline_glycerophosphocholine",
    name: "Choline, from glycerophosphocholine",
    unit: "mg",
    nutrientClass: "OTHER_NUTRIENT",
  },
  { code: "choline_sphingomyelin", name: "Choline, from sphingomyelin", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "betaine", name: "Betaine", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
  { code: "phytosterols_other", name: "Phytosterols, other", unit: "mg", nutrientClass: "OTHER_NUTRIENT" },
];

/** USDA FoodData Central nutrient.id -> internal nutrient definition. */
export const USDA_NUTRIENT_CATALOG: NutrientDefRecord[] = [
  ...FOUNDATION_NUTRIENT_CATALOG,
  ...FLAVONOID_NUTRIENT_DEFINITIONS,
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
  1258: { code: "saturated_fat" },
  1005: { code: "carbohydrate" },
  1063: { code: "sugar" },
  1009: { code: "starch" },
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
  1107: { code: "beta_carotene" },
  1108: { code: "carotene_alpha" },
  1118: { code: "carotene_gamma" },
  1119: { code: "zeaxanthin" },
  1120: { code: "cryptoxanthin_beta" },
  1121: { code: "lutein" },
  1122: { code: "lycopene" },
  1123: { code: "lutein_zeaxanthin" },
  1125: { code: "tocopherol_beta" },
  1126: { code: "tocopherol_gamma" },
  1127: { code: "tocopherol_delta" },
  1128: { code: "tocotrienol_alpha" },
  1129: { code: "tocotrienol_beta" },
  1130: { code: "tocotrienol_gamma" },
  1131: { code: "tocotrienol_delta" },
  1159: { code: "cis_beta_carotene" },
  1160: { code: "cis_lycopene" },
  1161: { code: "cis_lutein_zeaxanthin" },
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
  1194: { code: "choline_free" },
  1195: { code: "choline_phosphocholine" },
  1196: { code: "choline_phosphatidylcholine" },
  1197: { code: "choline_glycerophosphocholine" },
  1198: { code: "betaine" },
  1199: { code: "choline_sphingomyelin" },
  1298: { code: "phytosterols_other" },
  2028: { code: "trans_beta_carotene" },
  2029: { code: "trans_lycopene" },
  2032: { code: "cryptoxanthin_alpha" },
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

export const FOUNDATION_PHYTONUTRIENT_CODES = [
  "beta_carotene",
  "carotene_alpha",
  "carotene_gamma",
  "zeaxanthin",
  "cryptoxanthin_beta",
  "cryptoxanthin_alpha",
  "lutein",
  "lycopene",
  "lutein_zeaxanthin",
  "cis_beta_carotene",
  "trans_beta_carotene",
  "cis_lycopene",
  "trans_lycopene",
  "cis_lutein_zeaxanthin",
  "tocopherol_beta",
  "tocopherol_gamma",
  "tocopherol_delta",
  "tocotrienol_alpha",
  "tocotrienol_beta",
  "tocotrienol_gamma",
  "tocotrienol_delta",
  "choline_free",
  "choline_phosphocholine",
  "choline_phosphatidylcholine",
  "choline_glycerophosphocholine",
  "choline_sphingomyelin",
  "betaine",
  "phytosterols_other",
] as const;

export const FLAVONOID_PHYTONUTRIENT_CODES = FLAVONOID_NUTRIENT_DEFINITIONS.map(
  (row) => row.code,
) as readonly string[];

export const ALL_PHYTONUTRIENT_CODES = [
  ...FOUNDATION_PHYTONUTRIENT_CODES,
  ...FLAVONOID_PHYTONUTRIENT_CODES,
] as const;
