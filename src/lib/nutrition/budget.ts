/**
 * Estimated weekly cost per food portion (EUR). Content-reviewed placeholders.
 * Phase D: move to content/pricing catalogue.
 */
import type { FoodSlot } from "@/lib/nutrition/plan-engine";

export const SLOT_WEEKLY_COST_EUR: Record<FoodSlot, number> = {
  eggs: 4,
  organ_meat: 3,
  small_fish: 8,
  bivalves: 6,
  muscle_meat: 12,
  tubers: 3,
  cruciferous: 4,
  berries: 5,
  olive_oil: 2,
  fermented: 3,
  kiwi: 3,
  mushrooms: 4,
  aromatics: 1,
};

export function estimateWeeklyCostEur(slots: readonly { slot: FoodSlot }[]): number {
  return slots.reduce((sum, s) => sum + (SLOT_WEEKLY_COST_EUR[s.slot] ?? 0), 0);
}

export function estimateCookingHours(
  practical: { cookingTimeMinutes?: number } | null | undefined,
  mealCount = 21,
): number {
  const daily = practical?.cookingTimeMinutes ?? 30;
  return Math.round(((daily * 7) / 60) * 10) / 10;
}
