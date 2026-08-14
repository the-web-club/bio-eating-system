import type { UsdaSliceEntry } from "./slice-config";

/**
 * Hand-reviewed overrides for the v1 production slice.
 * These take precedence over automatic inference in slice v2.
 */
export const USDA_SLICE_OVERRIDES_V1: UsdaSliceEntry[] = [
  { fdcId: 748967, biologicalCategory: "eggs", preparationState: "RAW", displayName: "Eggs, whole", allergens: ["egg"], foodCategories: ["animal_protein"] },
  { fdcId: 2514743, biologicalCategory: "muscle_meat", preparationState: "RAW", displayName: "Beef, ground, 90% lean, raw", allergens: [], foodCategories: ["red_meat"] },
  { fdcId: 2727570, biologicalCategory: "muscle_meat", preparationState: "RAW", displayName: "Lamb, ground, raw", allergens: [], foodCategories: ["red_meat"] },
  { fdcId: 2727571, biologicalCategory: "muscle_meat", preparationState: "RAW", displayName: "Bison, ground, raw", allergens: [], foodCategories: ["game_meat"] },
  { fdcId: 2684440, biologicalCategory: "small_fish", preparationState: "RAW", displayName: "Salmon, sockeye, wild, raw", allergens: ["fish"], foodCategories: ["seafood"] },
  { fdcId: 2684441, biologicalCategory: "small_fish", preparationState: "RAW", displayName: "Salmon, Atlantic, farm raised, raw", allergens: ["fish"], foodCategories: ["seafood"] },
  { fdcId: 2346404, biologicalCategory: "tubers", preparationState: "RAW", displayName: "Sweet potato, raw", allergens: [], foodCategories: ["tubers"] },
  { fdcId: 2346401, biologicalCategory: "tubers", preparationState: "RAW", displayName: "Potato, russet, raw", allergens: [], foodCategories: ["tubers"] },
  { fdcId: 747447, biologicalCategory: "cruciferous", preparationState: "RAW", displayName: "Broccoli, raw", allergens: [], foodCategories: ["vegetables"] },
  { fdcId: 323505, biologicalCategory: "cruciferous", preparationState: "RAW", displayName: "Kale, raw", allergens: [], foodCategories: ["vegetables"] },
  { fdcId: 2346411, biologicalCategory: "berries", preparationState: "RAW", displayName: "Blueberries, raw", allergens: [], foodCategories: ["fruit"] },
  { fdcId: 2727581, biologicalCategory: "berries", preparationState: "RAW", displayName: "Blackberries, raw", allergens: [], foodCategories: ["fruit"] },
  { fdcId: 2346396, biologicalCategory: "olive_oil", preparationState: "DRIED", displayName: "Oats, rolled, old fashioned", allergens: ["gluten"], foodCategories: ["grains"] },
  { fdcId: 790085, biologicalCategory: "olive_oil", preparationState: "DRIED", displayName: "Flour, whole wheat, unenriched", allergens: ["gluten"], foodCategories: ["grains"] },
  { fdcId: 1750339, biologicalCategory: "berries", preparationState: "RAW", displayName: "Apple, red delicious, raw", allergens: [], foodCategories: ["fruit"] },
  { fdcId: 2259793, biologicalCategory: "fermented", preparationState: "OTHER", displayName: "Yogurt, plain, whole milk", allergens: ["milk"], foodCategories: ["dairy"] },
  { fdcId: 748608, biologicalCategory: "olive_oil", preparationState: "RAW", displayName: "Olive oil, extra virgin", allergens: [], foodCategories: ["oils"] },
  { fdcId: 327046, biologicalCategory: "kiwi", preparationState: "RAW", displayName: "Kiwifruit, green, raw", allergens: [], foodCategories: ["fruit"] },
  { fdcId: 1999629, biologicalCategory: "mushrooms", preparationState: "RAW", displayName: "Mushrooms, white button", allergens: [], foodCategories: ["vegetables"] },
  { fdcId: 321360, biologicalCategory: "mushrooms", preparationState: "RAW", displayName: "Tomatoes, grape, raw", allergens: [], foodCategories: ["vegetables"] },
  { fdcId: 1104647, biologicalCategory: "aromatics", preparationState: "RAW", displayName: "Garlic, raw", allergens: [], foodCategories: ["aromatics"] },
  { fdcId: 325524, biologicalCategory: "olive_oil", preparationState: "DRIED", displayName: "Sunflower seeds, dry roasted", allergens: [], foodCategories: ["seeds"] },
  { fdcId: 2515380, biologicalCategory: "olive_oil", preparationState: "DRIED", displayName: "Pumpkin seeds, raw", allergens: [], foodCategories: ["seeds"] },
  { fdcId: 2646170, biologicalCategory: "muscle_meat", preparationState: "RAW", displayName: "Chicken breast, raw", allergens: [], foodCategories: ["poultry"] },
  { fdcId: 331960, biologicalCategory: "muscle_meat", preparationState: "ROASTED", displayName: "Chicken breast, cooked", allergens: [], foodCategories: ["poultry"] },
  { fdcId: 2514747, biologicalCategory: "muscle_meat", preparationState: "RAW", displayName: "Turkey, ground, raw", allergens: [], foodCategories: ["poultry"] },
  { fdcId: 2747666, biologicalCategory: "bivalves", preparationState: "RAW", displayName: "Scallops, bay, Patagonian, frozen, wild caught", allergens: ["molluscs"], foodCategories: ["seafood"] },
  { fdcId: 2747667, biologicalCategory: "bivalves", preparationState: "RAW", displayName: "Scallops, sea, frozen, wild caught", allergens: ["molluscs"], foodCategories: ["seafood"] },
  { fdcId: 2747671, biologicalCategory: "bivalves", preparationState: "RAW", displayName: "Squid (calamari), frozen, tubes only", allergens: ["molluscs"], foodCategories: ["seafood"] },
  { fdcId: 2684443, biologicalCategory: "bivalves", preparationState: "RAW", displayName: "Shrimp, farm raised, raw", allergens: ["crustaceans"], foodCategories: ["seafood"] },
  { fdcId: 2747657, biologicalCategory: "bivalves", preparationState: "RAW", displayName: "Lobster, tail only, frozen, wild caught", allergens: ["crustaceans"], foodCategories: ["seafood"] },
  { fdcId: 2684444, biologicalCategory: "small_fish", preparationState: "RAW", displayName: "Cod, Atlantic, wild caught, raw", allergens: ["fish"], foodCategories: ["seafood"] },
  { fdcId: 2747654, biologicalCategory: "small_fish", preparationState: "RAW", displayName: "Cod, Pacific or Alaskan, frozen, wild caught", allergens: ["fish"], foodCategories: ["seafood"] },
  { fdcId: 2747652, biologicalCategory: "small_fish", preparationState: "CANNED", displayName: "Anchovies, canned in olive oil, with salt, drained", allergens: ["fish"], foodCategories: ["seafood"] },
];

export const USDA_SLICE_OVERRIDE_BY_FDC_ID = new Map(
  USDA_SLICE_OVERRIDES_V1.map((entry) => [entry.fdcId, entry]),
);
