import type { ReplaceReason } from "@/lib/intake/schema";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";

export type ReplaceMealRequest = {
  slot: FoodSlot;
  reason: ReplaceReason;
  replacementSlot?: FoodSlot;
};

export async function postReplaceMeal(body: ReplaceMealRequest) {
  return fetch("/api/portal/adapt/replace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
