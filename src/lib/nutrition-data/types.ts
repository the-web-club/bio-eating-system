import type { NutrientUnit } from "@/generated/prisma/client";

export type NutrientContributionRow = {
  nutrientCode: string;
  unit: NutrientUnit;
  amount: number;
  perAmountG: number;
  source: string;
  sourceVersion: string;
};

export type FoodContributionProfile = {
  foodId: string;
  externalId: string;
  name: string;
  nutrients: NutrientContributionRow[];
};

export type FoodPortion = {
  foodId: string;
  grams: number;
};

export type NutrientTotal = {
  nutrientCode: string;
  unit: NutrientUnit;
  total: number;
};

export type RequirementProfile = {
  age: number;
  sex: "female" | "male";
};

export type DailyRequirement = {
  nutrientCode: string;
  unit: NutrientUnit;
  value: number;
};

export type CoverageRow = {
  nutrientCode: string;
  unit: NutrientUnit;
  target: number;
  actual: number;
  gap: number;
  surplus: number;
};

export type RemovalDelta = {
  nutrientCode: string;
  unit: NutrientUnit;
  lost: number;
};
