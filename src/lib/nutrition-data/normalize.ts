import type { FoodSourceBundle } from "./schema";

export function assertBundleSourceMetadata(bundle: FoodSourceBundle) {
  for (const food of bundle.foods) {
    for (const nutrient of food.nutrients) {
      if (!Number.isFinite(nutrient.amount) || nutrient.amount < 0) {
        throw new Error(`Invalid nutrient amount for ${food.externalId}/${nutrient.code}`);
      }
    }
  }

  const nutrientCodes = new Set(bundle.nutrients.map((row) => row.code));
  for (const food of bundle.foods) {
    for (const nutrient of food.nutrients) {
      if (!nutrientCodes.has(nutrient.code)) {
        throw new Error(`Unknown nutrient code ${nutrient.code} on ${food.externalId}`);
      }
    }
  }

  const foodIds = new Set(bundle.foods.map((food) => food.externalId));
  for (const sub of bundle.substitutions) {
    if (!foodIds.has(sub.fromExternalId) || !foodIds.has(sub.toExternalId)) {
      throw new Error(
        `Substitution references unknown food: ${sub.fromExternalId} -> ${sub.toExternalId}`,
      );
    }
  }
}

export function countImportRows(bundle: FoodSourceBundle) {
  const nutrientRows = bundle.nutrients.length;
  const foodRows = bundle.foods.length;
  const foodNutrientRows = bundle.foods.reduce((sum, food) => sum + food.nutrients.length, 0);
  const allergenRows = bundle.foods.reduce((sum, food) => sum + food.allergens.length, 0);
  const substitutionRows = bundle.substitutions.length;
  const requirementRows = bundle.requirementSet.requirements.length;
  const biologicalDefaultRows = bundle.foods.length;

  return (
    nutrientRows +
    foodRows +
    foodNutrientRows +
    allergenRows +
    substitutionRows +
    requirementRows +
    biologicalDefaultRows
  );
}
