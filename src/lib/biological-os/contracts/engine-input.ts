import { z } from "zod";
import { ALLERGENS } from "@/lib/nutrition/plan-engine";

export const activityResolutionSchema = z.enum([
  "exact",
  "category_match",
  "unresolved_pending",
  "fallback_explicit",
]);

export const engineActivityRowSchema = z.object({
  label: z.string().min(1),
  minutesPerSession: z.number().positive(),
  sessionsPerWeek: z.number().nonnegative(),
  metCode: z.string().min(1).optional(),
  metValue: z.number().positive().optional(),
  resolution: activityResolutionSchema.optional(),
});

export const engineDailyLifeSchema = z.object({
  occupationMovement: z.string().min(1),
  baselineOccupationPal: z.number().positive(),
});

export const engineProfileContractSchema = z.object({
  sex: z.enum(["female", "male"]),
  ageYears: z.number().int().min(18).max(120),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  proteinPreference: z
    .enum([
      "g_per_kg_0_7",
      "g_per_kg_1_0",
      "g_per_kg_1_6",
      "g_per_kg_2_2",
      "no_preference",
      "custom",
    ])
    .optional(),
  allergens: z.array(z.enum(ALLERGENS)).optional(),
  excludedFoods: z.array(z.string()).optional(),
  favoriteFoods: z.array(z.string()).optional(),
});

export const engineInputContractSchema = z.object({
  profile: engineProfileContractSchema,
  dailyLife: engineDailyLifeSchema,
  activities: z.array(engineActivityRowSchema).default([]),
});

export type EngineInputContract = z.infer<typeof engineInputContractSchema>;
export type EngineActivityRowContract = z.infer<typeof engineActivityRowSchema>;
