import { z } from "zod";
import { ALLERGENS, FOOD_SLOTS } from "@/lib/nutrition/plan-engine";

const nutrientUnitSchema = z.enum(["g", "mg", "mcg", "kcal", "iu"]);
const preparationStateSchema = z.enum([
  "RAW",
  "BOILED",
  "STEAMED",
  "BAKED",
  "ROASTED",
  "GRILLED",
  "FRIED",
  "CANNED",
  "FERMENTED",
  "DRIED",
  "COOKED",
  "OTHER",
]);
const referenceTypeSchema = z.enum([
  "AR",
  "PRI",
  "AI",
  "RI",
  "UL",
  "AMDR",
  "OTHER_REVIEWED_REFERENCE",
]);

const nutrientDefSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  unit: nutrientUnitSchema,
  nutrientClass: z
    .enum(["ENERGY", "MACRONUTRIENT", "FATTY_ACID", "VITAMIN", "MINERAL", "OTHER_NUTRIENT"])
    .optional(),
});

const foodNutrientSchema = z.object({
  code: z.string().min(1),
  amount: z.number().finite().nonnegative(),
  perAmountG: z.number().finite().positive().default(100),
  basisAmount: z.number().finite().positive().optional(),
  basisUnit: z.string().min(1).default("g"),
});

const foodRecordSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  canonicalName: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  preparationState: preparationStateSchema.optional(),
  nutrients: z.array(foodNutrientSchema).min(1),
  allergens: z.array(z.enum(ALLERGENS)).default([]),
  biologicalCategory: z.enum(FOOD_SLOTS),
  foodCategories: z.array(z.string().min(1)).default([]),
});

const substitutionSchema = z.object({
  fromExternalId: z.string().min(1),
  toExternalId: z.string().min(1),
  rank: z.number().int().nonnegative().default(0),
  reasonTags: z.array(z.string()).default([]),
});

const requirementRowSchema = z.object({
  nutrientCode: z.string().min(1),
  ageMin: z.number().int().nonnegative(),
  ageMax: z.number().int().positive(),
  sex: z.enum(["female", "male"]).nullable(),
  referenceType: referenceTypeSchema.default("OTHER_REVIEWED_REFERENCE"),
  value: z.number().finite().nonnegative().nullable().optional(),
  valueMin: z.number().finite().nonnegative().nullable().optional(),
  valueMax: z.number().finite().nonnegative().nullable().optional(),
  unit: nutrientUnitSchema,
});

export const foodSourceBundleSchema = z.object({
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  devOnly: z.boolean().default(false),
  nutrients: z.array(nutrientDefSchema).min(1),
  foods: z.array(foodRecordSchema).min(1),
  substitutions: z.array(substitutionSchema).default([]),
  requirementSet: z.object({
    version: z.string().min(1),
    devOnly: z.boolean().default(false),
    reviewer: z.string().nullable().optional(),
    requirements: z.array(requirementRowSchema).default([]),
  }),
}).superRefine((bundle, ctx) => {
  if (!bundle.devOnly && !bundle.requirementSet.devOnly && bundle.requirementSet.requirements.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Production bundles require an approved requirement set or devOnly requirementSet.",
      path: ["requirementSet", "requirements"],
    });
  }
});

export type FoodSourceBundle = z.infer<typeof foodSourceBundleSchema>;
export type FoodSourceRecord = z.infer<typeof foodRecordSchema>;
export type NutrientDefRecord = z.infer<typeof nutrientDefSchema>;

export function parseFoodSourceBundle(input: unknown): FoodSourceBundle {
  return foodSourceBundleSchema.parse(input);
}
