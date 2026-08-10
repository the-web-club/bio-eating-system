import type { Allergen, FoodSlot } from "@/lib/nutrition/plan-engine";
import type { ScreeningFlag } from "@/lib/nutrition/screening";

/** Short UI labels for enums. Not science copy - catalogue keys hold that. */
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
  REDUCE: "Fat loss",
  MAINTAIN: "Maintain",
  INCREASE: "Build energy intake",
} as const;

export const GOAL_APPROACH_LABELS = {
  REDUCE: "Moderate calorie deficit",
  MAINTAIN: "Maintenance energy",
  INCREASE: "Gradual energy increase",
} as const;

export const TRAINING_LABELS = {
  none: "No structured training",
  one_two: "1-2 sessions per week",
  three_four: "3-4 sessions per week",
  five_plus: "5 or more sessions per week",
} as const;

export const WORK_SCHEDULE_LABELS = {
  regular_day: "Regular daytime hours",
  shift_work: "Shift work",
  flexible: "Flexible hours",
  remote: "Mostly remote",
} as const;

export const INTOLERANCE_LABELS = {
  lactose: "Lactose",
  fructose: "Fructose",
  histamine: "Histamine",
  fodmap: "FODMAP",
  gluten_sensitivity: "Gluten sensitivity",
} as const;

export const DIETARY_PATTERN_LABELS = {
  omnivore: "Omnivore",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  other: "Other",
} as const;

export const COOKING_ABILITY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  confident: "Confident cook",
} as const;

export const EAT_OUT_LABELS = {
  rarely: "Rarely",
  once_week: "About once a week",
  two_three_week: "2-3 times per week",
  most_days: "Most days",
} as const;

export const UNIT_LABELS = {
  METRIC: "Grams",
  HOUSEHOLD: "Household measurements",
  SIMPLE: "Simple portions",
} as const;

export const REPLACE_REASON_LABELS = {
  dont_like: "Don't like it",
  dont_have: "Don't have it",
  too_expensive: "Too expensive",
  eating_out: "Eating out",
  traveling: "Traveling",
  not_hungry: "Not hungry",
  need_faster: "Need something faster",
} as const;

export const LIFE_HAPPENED_LABELS = {
  ate_different: "I ate something different",
  skipped_meal: "I skipped a meal",
  restaurant: "I'm eating at a restaurant",
  traveling: "I'm traveling",
  missing_ingredients: "I don't have the ingredients",
  overate: "I overate",
  still_hungry: "I'm still hungry",
} as const;

export const LIFE_HAPPENED_NEXT = {
  ate_different: "You don't need to compensate. Continue with your next planned meal.",
  skipped_meal: "You don't need to compensate. Continue with your next planned meal.",
  restaurant: "Choose what fits your plan as closely as you can. Continue tomorrow as usual.",
  traveling: "Do your best with what's available. Your plan will adapt when you're back.",
  missing_ingredients: "Use Replace on the affected meal to find an alternative.",
  overate: "You don't need to compensate. Continue with your next planned meal.",
  still_hungry: "Add a small protein-rich snack if needed. Continue with your plan tomorrow.",
} as const;

export const CHECK_IN_BARRIER_LABELS = {
  time: "Time",
  cost: "Cost",
  food_preferences: "Food preferences",
  social_events: "Social events",
  travel: "Travel",
  hunger: "Hunger",
  preparation: "Preparation",
  nothing: "Nothing",
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
