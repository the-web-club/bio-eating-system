import { z } from "zod";

export const reviewStatusSchema = z.enum(["REVIEW_REQUIRED", "APPROVED", "REJECTED"]);

export const servingBasisSchema = z.object({
  amount: z.number().positive(),
  unit: z.string().min(1),
});

export const foodNutrientRowSchema = z.object({
  nutrientCode: z.string().min(1),
  amount: z.number(),
  unit: z.string().min(1),
  basis: z.string().nullable().optional(),
  sourceValueId: z.string().nullable().optional(),
});

export const foodRecordSchema = z.object({
  foodId: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  category: z.string().nullable().optional(),
  preparation: z.string().nullable().optional(),
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  sourceRecordId: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  attributionRequired: z.boolean().optional(),
  devOnly: z.boolean(),
  reviewStatus: reviewStatusSchema,
  servingBasis: servingBasisSchema,
  allergens: z.array(z.string()).optional(),
  dietTags: z.array(z.string()).optional(),
  nutrients: z.array(foodNutrientRowSchema).min(1),
});

export type FoodRecordContract = z.infer<typeof foodRecordSchema>;
