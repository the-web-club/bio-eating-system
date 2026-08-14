import type { NutrientUnit, ReferenceValueType } from "@/generated/prisma/client";
import { contributionRowsFromProfile } from "@/lib/nutrition/contribution";
import { FOOD_SLOTS } from "@/lib/nutrition/plan-engine";
import {
  APPROVED_FOOD_SOURCE,
  APPROVED_FOOD_SOURCE_VERSION,
  APPROVED_REQUIREMENT_SET_VERSION,
} from "@/lib/biological-os/constants";
import type {
  CategoryCandidateMap,
  EngineFoodCandidate,
  EngineProfile,
} from "@/lib/biological-os/types";
import type { StoredRequirementRow } from "@/lib/nutrition/requirements";
import efsaBundle from "../../../../content/requirements/efsa-drv-eu-2017-v2.json";

const SOURCE = APPROVED_FOOD_SOURCE;
const SOURCE_VERSION = APPROVED_FOOD_SOURCE_VERSION;

function nutrient(
  code: string,
  unit: NutrientUnit,
  amount: number,
): {
  code: string;
  unit: NutrientUnit;
  amount: number;
  perAmountG: number;
  source: string;
  sourceVersion: string;
} {
  return {
    code,
    unit,
    amount,
    perAmountG: 100,
    source: SOURCE,
    sourceVersion: SOURCE_VERSION,
  };
}

function makeFood(args: {
  foodId: string;
  externalId: string;
  name: string;
  biologicalCategory: EngineFoodCandidate["biologicalCategory"];
  allergens?: string[];
  nutrients: ReturnType<typeof nutrient>[];
  devOnly?: boolean;
}): EngineFoodCandidate {
  return {
    foodId: args.foodId,
    externalId: args.externalId,
    name: args.name,
    biologicalCategory: args.biologicalCategory,
    allergens: args.allergens ?? [],
    nutrients: contributionRowsFromProfile({
      foodId: args.foodId,
      externalId: args.externalId,
      name: args.name,
      rows: args.nutrients,
    }),
    source: SOURCE,
    sourceVersion: SOURCE_VERSION,
    devOnly: args.devOnly ?? false,
  };
}

export const TEST_PROFILE_FEMALE: EngineProfile = {
  age: 30,
  sex: "female",
  bodyWeightKg: 65,
};

export const TEST_PROFILE_MALE: EngineProfile = {
  age: 30,
  sex: "male",
  bodyWeightKg: 75,
};

export const EFSA_REQUIREMENT_ROWS: StoredRequirementRow[] = efsaBundle.requirements.map(
  (row) => ({
    nutrientCode: row.nutrientCode,
    ageMin: row.ageMin,
    ageMax: row.ageMax,
    sex: row.sex as "female" | "male" | null,
    lifeStage: row.lifeStage ?? null,
    referenceType: row.referenceType as ReferenceValueType,
    value: row.value,
    valueMin: null,
    valueMax: null,
    unit: row.unit as NutrientUnit,
    sourcePolicyCode: efsaBundle.policyCode,
    sourceVersion: efsaBundle.sourceVersion,
  }),
);

export const FOOD_EGGS = makeFood({
  foodId: "food-eggs",
  externalId: "fdc-748967",
  name: "Eggs, whole",
  biologicalCategory: "eggs",
  allergens: ["egg"],
  nutrients: [
    nutrient("protein", "g", 13),
    nutrient("iron", "mg", 2),
    nutrient("vitamin_a", "mcg", 200),
    nutrient("vitamin_b12", "mcg", 2),
    nutrient("zinc", "mg", 1.5),
  ],
});

export const FOOD_LIVER = makeFood({
  foodId: "food-liver",
  externalId: "fdc-organ-liver",
  name: "Beef liver, raw",
  biologicalCategory: "organ_meat",
  nutrients: [
    nutrient("protein", "g", 15),
    nutrient("iron", "mg", 7),
    nutrient("vitamin_a", "mcg", 500),
    nutrient("folate", "mcg", 150),
    nutrient("vitamin_b12", "mcg", 3),
  ],
});

export const FOOD_BEEF = makeFood({
  foodId: "food-beef",
  externalId: "fdc-2514743",
  name: "Beef, ground, 90% lean, raw",
  biologicalCategory: "muscle_meat",
  nutrients: [
    nutrient("protein", "g", 20),
    nutrient("iron", "mg", 4),
    nutrient("zinc", "mg", 5),
    nutrient("calcium", "mg", 200),
    nutrient("potassium", "mg", 400),
    nutrient("folate", "mcg", 30),
    nutrient("vitamin_a", "mcg", 20),
  ],
});

export const FOOD_SALMON = makeFood({
  foodId: "food-salmon",
  externalId: "fdc-2684440",
  name: "Salmon, sockeye, wild, raw",
  biologicalCategory: "small_fish",
  allergens: ["fish"],
  nutrients: [
    nutrient("protein", "g", 22),
    nutrient("omega3", "g", 0.3),
    nutrient("vitamin_d", "mcg", 5),
    nutrient("potassium", "mg", 400),
  ],
});

export const FOOD_MUSSELS = makeFood({
  foodId: "food-mussels",
  externalId: "fdc-bivalve-mussels",
  name: "Mussels, raw",
  biologicalCategory: "bivalves",
  allergens: ["molluscs"],
  nutrients: [
    nutrient("protein", "g", 12),
    nutrient("iron", "mg", 5),
    nutrient("vitamin_b12", "mcg", 3),
    nutrient("zinc", "mg", 2),
  ],
});

export const FOOD_POTATO = makeFood({
  foodId: "food-potato",
  externalId: "fdc-2346401",
  name: "Potato, russet, raw",
  biologicalCategory: "tubers",
  nutrients: [
    nutrient("potassium", "mg", 1700),
    nutrient("vitamin_c", "mg", 25),
    nutrient("fiber", "g", 3),
    nutrient("magnesium", "mg", 80),
  ],
});

export const FOOD_BROCCOLI = makeFood({
  foodId: "food-broccoli",
  externalId: "fdc-747447",
  name: "Broccoli, raw",
  biologicalCategory: "cruciferous",
  nutrients: [
    nutrient("vitamin_c", "mg", 60),
    nutrient("folate", "mcg", 200),
    nutrient("fiber", "g", 4),
    nutrient("calcium", "mg", 150),
  ],
});

export const FOOD_BLUEBERRIES = makeFood({
  foodId: "food-blueberries",
  externalId: "fdc-2346411",
  name: "Blueberries, raw",
  biologicalCategory: "berries",
  nutrients: [
    nutrient("vitamin_c", "mg", 15),
    nutrient("fiber", "g", 5),
    nutrient("potassium", "mg", 200),
  ],
});

export const FOOD_OATS = makeFood({
  foodId: "food-oats",
  externalId: "fdc-2346396",
  name: "Oats, rolled, old fashioned",
  biologicalCategory: "olive_oil",
  allergens: ["gluten"],
  nutrients: [
    nutrient("fiber", "g", 15),
    nutrient("carbohydrate", "g", 66),
    nutrient("magnesium", "mg", 200),
    nutrient("iron", "mg", 4),
  ],
});

export const FOOD_BREAD = makeFood({
  foodId: "food-bread",
  externalId: "fdc-790085",
  name: "Flour, whole wheat, unenriched",
  biologicalCategory: "olive_oil",
  allergens: ["gluten"],
  nutrients: [
    nutrient("fiber", "g", 7),
    nutrient("carbohydrate", "g", 45),
    nutrient("folate", "mcg", 80),
  ],
});

export const FOOD_OLIVE_OIL = makeFood({
  foodId: "food-olive-oil",
  externalId: "fdc-748608",
  name: "Olive oil, extra virgin",
  biologicalCategory: "olive_oil",
  nutrients: [
    nutrient("carbohydrate", "g", 0),
    nutrient("fiber", "g", 0),
  ],
});

export const FOOD_YOGURT = makeFood({
  foodId: "food-yogurt",
  externalId: "fdc-2259793",
  name: "Yogurt, plain, whole milk",
  biologicalCategory: "fermented",
  allergens: ["milk"],
  nutrients: [
    nutrient("protein", "g", 10),
    nutrient("calcium", "mg", 500),
    nutrient("vitamin_b12", "mcg", 1),
    nutrient("potassium", "mg", 300),
  ],
});

export const FOOD_KIWI = makeFood({
  foodId: "food-kiwi",
  externalId: "fdc-327046",
  name: "Kiwifruit, green, raw",
  biologicalCategory: "kiwi",
  nutrients: [
    nutrient("vitamin_c", "mg", 80),
    nutrient("fiber", "g", 4),
    nutrient("folate", "mcg", 50),
  ],
});

export const FOOD_MUSHROOMS = makeFood({
  foodId: "food-mushrooms",
  externalId: "fdc-1999629",
  name: "Mushrooms, white button",
  biologicalCategory: "mushrooms",
  nutrients: [
    nutrient("vitamin_d", "mcg", 10),
    nutrient("potassium", "mg", 400),
    nutrient("magnesium", "mg", 20),
  ],
});

export const FOOD_GARLIC = makeFood({
  foodId: "food-garlic",
  externalId: "fdc-1104647",
  name: "Garlic, raw",
  biologicalCategory: "aromatics",
  nutrients: [
    nutrient("magnesium", "mg", 50),
    nutrient("potassium", "mg", 200),
    nutrient("calcium", "mg", 100),
  ],
});

export const FOOD_EGG_BACKUP = makeFood({
  foodId: "food-egg-backup",
  externalId: "fdc-egg-backup",
  name: "Eggs, backup candidate",
  biologicalCategory: "eggs",
  allergens: ["egg"],
  nutrients: [
    nutrient("protein", "g", 11),
    nutrient("iron", "mg", 1.5),
    nutrient("vitamin_a", "mcg", 140),
  ],
});

export const FOOD_FIXTURE_DEV = makeFood({
  foodId: "food-fixture-dev",
  externalId: "fixture-dev-1",
  name: "Fixture dev food",
  biologicalCategory: "eggs",
  nutrients: [nutrient("protein", "g", 10)],
  devOnly: true,
});

export const ALL_TEST_FOODS: EngineFoodCandidate[] = [
  FOOD_EGGS,
  FOOD_LIVER,
  FOOD_BEEF,
  FOOD_SALMON,
  FOOD_MUSSELS,
  FOOD_POTATO,
  FOOD_BROCCOLI,
  FOOD_BLUEBERRIES,
  FOOD_OATS,
  FOOD_BREAD,
  FOOD_OLIVE_OIL,
  FOOD_YOGURT,
  FOOD_KIWI,
  FOOD_MUSHROOMS,
  FOOD_GARLIC,
];

export function buildCategoryCandidates(
  foods: EngineFoodCandidate[] = ALL_TEST_FOODS,
): CategoryCandidateMap {
  const map = Object.fromEntries(
    FOOD_SLOTS.map((slot) => [slot, [] as EngineFoodCandidate[]]),
  ) as CategoryCandidateMap;

  for (const food of foods) {
    map[food.biologicalCategory].push(food);
  }

  for (const slot of FOOD_SLOTS) {
    map[slot].sort((a, b) => a.foodId.localeCompare(b.foodId));
  }

  return map;
}

export const APPROVED_REQUIREMENT_SET = APPROVED_REQUIREMENT_SET_VERSION;

export const FIXED_TIMESTAMP = "2026-08-12T18:00:00.000Z";
