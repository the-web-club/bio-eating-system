import { z } from "zod";

const nutrientUnitSchema = z.enum(["g", "mg", "mcg", "kcal", "iu"]);
const referenceTypeSchema = z.enum([
  "AR",
  "PRI",
  "AI",
  "RI",
  "UL",
  "AMDR",
  "OTHER_REVIEWED_REFERENCE",
]);

export const requirementRowSchema = z.object({
  nutrientCode: z.string().min(1),
  ageMin: z.number().int().nonnegative(),
  ageMax: z.number().int().positive(),
  sex: z.enum(["female", "male"]).nullable(),
  lifeStage: z.string().nullable().optional(),
  referenceType: referenceTypeSchema.default("OTHER_REVIEWED_REFERENCE"),
  value: z.number().finite().nonnegative().nullable().optional(),
  valueMin: z.number().finite().nonnegative().nullable().optional(),
  valueMax: z.number().finite().nonnegative().nullable().optional(),
  unit: nutrientUnitSchema,
  reviewStatus: z.enum(["REVIEW_REQUIRED", "APPROVED"]).optional(),
});

export const requirementSetBundleSchema = z.object({
  policyCode: z.string().min(1),
  setVersion: z.string().min(1),
  name: z.string().min(1),
  jurisdiction: z.enum(["GLOBAL", "INTERNAL", "EU", "US", "NORDIC"]),
  populationScope: z.string().min(1),
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  effectiveDate: z.string().nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  termsUrl: z.string().url().nullable().optional(),
  devOnly: z.boolean().default(false),
  setReviewStatus: z.enum(["REVIEW_REQUIRED", "APPROVED"]).default("REVIEW_REQUIRED"),
  requirements: z.array(requirementRowSchema).min(1),
});

export type RequirementSetBundle = z.infer<typeof requirementSetBundleSchema>;
export type RequirementRowRecord = z.infer<typeof requirementRowSchema>;

export function parseRequirementSetBundle(input: unknown): RequirementSetBundle {
  return requirementSetBundleSchema.parse(input);
}
