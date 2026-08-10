import { z } from "zod";
import { ALLERGENS, FOOD_SLOTS } from "@/lib/nutrition/plan-engine";
import { SCREENING_FLAGS } from "@/lib/nutrition/screening";

export const CONSENT_VERSION = "health-data-consent-v2";

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
} as const;

export const TRAINING_FREQUENCIES = [
  "none",
  "one_two",
  "three_four",
  "five_plus",
] as const;

export const WORK_SCHEDULES = [
  "regular_day",
  "shift_work",
  "flexible",
  "remote",
] as const;

export const INTOLERANCES = [
  "lactose",
  "fructose",
  "histamine",
  "fodmap",
  "gluten_sensitivity",
] as const;

export const DIETARY_PATTERNS = [
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "other",
] as const;

export const COOKING_ABILITIES = [
  "beginner",
  "intermediate",
  "confident",
] as const;

export const EAT_OUT_FREQUENCIES = [
  "rarely",
  "once_week",
  "two_three_week",
  "most_days",
] as const;

export const CHECK_IN_BARRIERS = [
  "time",
  "cost",
  "food_preferences",
  "social_events",
  "travel",
  "hunger",
  "preparation",
  "nothing",
] as const;

export const lifestyleSchema = z.object({
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]),
  trainingFrequency: z.enum(TRAINING_FREQUENCIES),
  wakeTime: z.string().max(10).optional(),
  sleepTime: z.string().max(10).optional(),
  workSchedule: z.enum(WORK_SCHEDULES),
});

export const foodPreferencesSchema = z.object({
  likes: z.string().max(1000).optional(),
  dislikes: z.string().max(1000).optional(),
  intolerances: z.array(z.enum(INTOLERANCES)).max(5),
  dietaryPattern: z.enum(DIETARY_PATTERNS),
  refusedFoods: z.string().max(1000).optional(),
});

export const practicalSchema = z.object({
  weeklyBudgetEur: z.number().int().min(0).max(2000).optional(),
  cookingAbility: z.enum(COOKING_ABILITIES),
  kitchenAvailable: z.boolean(),
  cookingTimeMinutes: z.number().int().min(0).max(180),
  eatOutFrequency: z.enum(EAT_OUT_FREQUENCIES),
  countryRegion: z.string().max(100).optional(),
});

export const householdSchema = z.object({
  cookingForSelf: z.boolean(),
  cookingForPartner: z.boolean(),
  cookingForFamily: z.boolean(),
});

export const intakeBodySchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  age: z.number().int().min(16).max(100),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(300),
  sex: z.enum(["female", "male"]),
  goal: z.enum(["REDUCE", "MAINTAIN", "INCREASE"]),
  unitSystem: z.enum(["METRIC", "HOUSEHOLD", "SIMPLE"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]),
  declaredAllergens: z.array(z.enum(ALLERGENS)).max(14),
  excludedSlots: z.array(z.enum(FOOD_SLOTS)).max(13),
  swapRequests: z.array(z.enum(FOOD_SLOTS)).max(6),
  screeningFlags: z.array(z.enum(SCREENING_FLAGS)).max(6),
  lifestyle: lifestyleSchema,
  foodPreferences: foodPreferencesSchema,
  practical: practicalSchema,
  household: householdSchema,
  notesForCoach: z.string().max(2000).optional(),
  consentHealthData: z.literal(true),
  marketingOptIn: z.boolean(),
});

export type IntakeBody = z.infer<typeof intakeBodySchema>;

/** Client wizard state before consent is confirmed. */
export type IntakeDraft = Omit<IntakeBody, "consentHealthData"> & {
  consentHealthData: boolean;
  displayName: string;
};

export const defaultIntakeDraft = (): IntakeDraft => ({
  displayName: "",
  age: 30,
  heightCm: 165,
  weightKg: 65,
  sex: "female",
  goal: "MAINTAIN",
  unitSystem: "HOUSEHOLD",
  activityLevel: "light",
  declaredAllergens: [],
  excludedSlots: [],
  swapRequests: [],
  screeningFlags: [],
  lifestyle: {
    activityLevel: "light",
    trainingFrequency: "none",
    wakeTime: "07:00",
    sleepTime: "23:00",
    workSchedule: "regular_day",
  },
  foodPreferences: {
    likes: "",
    dislikes: "",
    intolerances: [],
    dietaryPattern: "omnivore",
    refusedFoods: "",
  },
  practical: {
    weeklyBudgetEur: undefined,
    cookingAbility: "intermediate",
    kitchenAvailable: true,
    cookingTimeMinutes: 30,
    eatOutFrequency: "once_week",
    countryRegion: "",
  },
  household: {
    cookingForSelf: true,
    cookingForPartner: false,
    cookingForFamily: false,
  },
  notesForCoach: "",
  consentHealthData: false,
  marketingOptIn: false,
});

export const replaceReasonSchema = z.enum([
  "dont_like",
  "dont_have",
  "too_expensive",
  "eating_out",
  "traveling",
  "not_hungry",
  "need_faster",
]);
export type ReplaceReason = z.infer<typeof replaceReasonSchema>;

export const lifeHappenedReasonSchema = z.enum([
  "ate_different",
  "skipped_meal",
  "restaurant",
  "traveling",
  "missing_ingredients",
  "overate",
  "still_hungry",
]);
export type LifeHappenedReason = z.infer<typeof lifeHappenedReasonSchema>;

export const weeklyCheckInSchema = z.object({
  energy: z.number().int().min(1).max(5),
  hunger: z.number().int().min(1).max(5),
  satisfaction: z.number().int().min(1).max(5),
  adherence: z.number().int().min(1).max(5),
  difficulty: z.number().int().min(1).max(5),
  barriers: z.array(z.enum(CHECK_IN_BARRIERS)).max(8),
  weightKg: z.number().min(35).max(300).optional(),
});
