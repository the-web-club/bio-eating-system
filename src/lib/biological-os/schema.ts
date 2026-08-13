import { z } from "zod";
import { ALLERGENS } from "@/lib/nutrition/plan-engine";

const proteinPreferenceSchema = z.object({
  preference: z.enum([
    "g_per_kg_0_7",
    "g_per_kg_1_0",
    "g_per_kg_1_6",
    "g_per_kg_2_2",
    "no_preference",
    "custom",
  ]),
  customValue: z.number().positive().optional(),
});

const redundancyChoiceSchema = z.object({
  foodAId: z.string().uuid(),
  foodBId: z.string().uuid(),
  decision: z.enum(["keep_both", "remove_a", "remove_b", "review"]),
});

export const biologicalOsEngineRunBodySchema = z
  .object({
    age: z.number().int().min(18).max(49),
    sex: z.enum(["female", "male"]),
    bodyWeightKg: z.number().positive().max(300),
    excludedAllergens: z.array(z.enum(ALLERGENS)).optional(),
    requiredFoodIds: z.array(z.string().uuid()).optional(),
    hardExcludedFoodIds: z.array(z.string().uuid()).optional(),
    proteinPreference: proteinPreferenceSchema.optional(),
    redundancyChoices: z.array(redundancyChoiceSchema).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.proteinPreference?.preference === "custom" && !value.proteinPreference.customValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "customValue is required when protein preference is custom.",
        path: ["proteinPreference", "customValue"],
      });
    }
  });

export type BiologicalOsEngineRunBody = z.infer<typeof biologicalOsEngineRunBodySchema>;
