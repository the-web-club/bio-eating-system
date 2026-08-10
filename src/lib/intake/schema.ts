import { z } from "zod";
import { ALLERGENS, FOOD_SLOTS } from "@/lib/nutrition/plan-engine";
import { SCREENING_FLAGS } from "@/lib/nutrition/screening";

export const CONSENT_VERSION = "health-data-consent-v1";

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
} as const;

export const intakeBodySchema = z.object({
  age: z.number().int().min(16).max(100),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(300),
  sex: z.enum(["female", "male"]),
  goal: z.enum(["REDUCE", "MAINTAIN", "INCREASE"]),
  unitSystem: z.enum(["METRIC", "HOUSEHOLD"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]),
  declaredAllergens: z.array(z.enum(ALLERGENS)).max(14),
  excludedSlots: z.array(z.enum(FOOD_SLOTS)).max(13),
  swapRequests: z.array(z.enum(FOOD_SLOTS)).max(6),
  screeningFlags: z.array(z.enum(SCREENING_FLAGS)).max(6),
  notesForCoach: z.string().max(2000).optional(),
  consentHealthData: z.literal(true),
  /** Separate from health consent. Required for weekly shopping-list email. */
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
  notesForCoach: "",
  consentHealthData: false,
  marketingOptIn: false,
});
