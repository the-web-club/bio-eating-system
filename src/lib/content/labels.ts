import type { Allergen, FoodSlot } from "@/lib/nutrition/plan-engine";
import type { ScreeningFlag } from "@/lib/nutrition/screening";

/** Short UI labels for enums. Not science copy — catalogue keys hold that. */
export const SLOT_LABELS: Record<FoodSlot, string> = {
  eggs: "Eggs",
  organ_meat: "Organ meat",
  small_fish: "Small fish",
  bivalves: "Bivalves",
  muscle_meat: "Muscle meat",
  tubers: "Tubers",
  cruciferous: "Cruciferous vegetables",
  berries: "Berries",
  olive_oil: "Olive oil",
  fermented: "Fermented foods",
  kiwi: "Kiwi",
  mushrooms: "Mushrooms",
  aromatics: "Aromatics",
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  egg: "Egg",
  fish: "Fish",
  crustaceans: "Crustaceans",
  molluscs: "Molluscs",
  milk: "Milk",
  soy: "Soy",
  gluten: "Gluten",
  tree_nuts: "Tree nuts",
  peanuts: "Peanuts",
  sesame: "Sesame",
  celery: "Celery",
  mustard: "Mustard",
  sulphites: "Sulphites",
  lupin: "Lupin",
};

export const GOAL_LABELS = {
  REDUCE: "Reduce energy intake",
  MAINTAIN: "Maintain",
  INCREASE: "Increase energy intake",
} as const;

export const ACTIVITY_LABELS = {
  sedentary: "Mostly seated",
  light: "Light movement",
  moderate: "Moderate activity",
  active: "High activity",
} as const;

export const SCREENING_LABELS: Record<ScreeningFlag, string> = {
  under_18: "Under 18",
  pregnant_or_breastfeeding: "Pregnant or breastfeeding",
  eating_disorder_history: "History of disordered eating",
  medically_supervised_diet: "On a medically supervised diet",
  diabetes_or_metabolic_condition: "Diabetes or a metabolic condition",
  prefers_not_to_say: "Prefer not to say",
};

export const SCREENING_REASON_COPY: Record<string, string> = {
  under_minimum_age:
    "A plan is not generated for people under 18. Please speak with a qualified clinician.",
  bmi_below_refuse:
    "A plan is not generated at this body-mass index. Please speak with a qualified clinician.",
  bmi_below_deficit_threshold:
    "Your plan stays at maintenance energy. A deficit is not offered at this body-mass index.",
  screening_flag_blocks_deficit:
    "Your answers mean the product will not generate an energy deficit. You receive a maintenance plan instead.",
  goal_maintain: "Your plan matches a maintain goal.",
};

export function humanizeKey(key: string): string {
  const leaf = key.includes(".") ? key.split(".").pop()! : key;
  return leaf.replace(/_/g, " ");
}
