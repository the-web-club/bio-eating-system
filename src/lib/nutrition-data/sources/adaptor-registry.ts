import { SOURCE_KEYS } from "@/lib/nutrition-data/constants";
import { createUsdaAdaptor } from "./usda";
import { createUnimplementedAdaptor, type FoodSourceAdaptor } from "./types";

export const FOOD_SOURCE_ADAPTORS: Record<string, () => FoodSourceAdaptor> = {
  [SOURCE_KEYS.usda]: createUsdaAdaptor,
  [SOURCE_KEYS.fineli]: () => createUnimplementedAdaptor(SOURCE_KEYS.fineli),
  [SOURCE_KEYS.eurofir]: () => createUnimplementedAdaptor(SOURCE_KEYS.eurofir),
  [SOURCE_KEYS.foodhub]: () => createUnimplementedAdaptor(SOURCE_KEYS.foodhub),
  [SOURCE_KEYS.foodb]: () => createUnimplementedAdaptor(SOURCE_KEYS.foodb),
  [SOURCE_KEYS.afcd]: () => createUnimplementedAdaptor(SOURCE_KEYS.afcd),
  [SOURCE_KEYS.cnf]: () => createUnimplementedAdaptor(SOURCE_KEYS.cnf),
  [SOURCE_KEYS.ciqual]: () => createUnimplementedAdaptor(SOURCE_KEYS.ciqual),
};

export function getFoodSourceAdaptor(sourceKey: string): FoodSourceAdaptor {
  const factory = FOOD_SOURCE_ADAPTORS[sourceKey];
  if (!factory) {
    throw new Error(`No food source adaptor registered for ${sourceKey}.`);
  }
  return factory();
}

export function listRegisteredFoodSourceKeys(): string[] {
  return Object.keys(FOOD_SOURCE_ADAPTORS).sort();
}
