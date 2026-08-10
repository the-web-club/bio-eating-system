import type { FoodSlot } from "@/lib/nutrition/plan-engine";

export type GroceryCategory = "produce" | "protein" | "pantry";

export const SLOT_GROCERY_CATEGORY: Record<FoodSlot, GroceryCategory> = {
  eggs: "protein",
  organ_meat: "protein",
  small_fish: "protein",
  bivalves: "protein",
  muscle_meat: "protein",
  tubers: "produce",
  cruciferous: "produce",
  berries: "produce",
  kiwi: "produce",
  mushrooms: "produce",
  olive_oil: "pantry",
  fermented: "pantry",
  aromatics: "pantry",
};

export const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: "Produce",
  protein: "Protein",
  pantry: "Pantry",
};

/** Human-friendly shopping line from grams/household display. */
export function humanShoppingLine(name: string, amount: string): string {
  if (!amount || amount === "—") return name;
  return `${amount} ${name}`.trim();
}
