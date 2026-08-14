import { z } from "zod";
import { reviewStatusSchema } from "./food-record";

export const referenceTypeSchema = z.enum([
  "AR",
  "PRI",
  "AI",
  "RI",
  "UL",
  "AMDR",
  "OTHER_REVIEWED_REFERENCE",
]);

export const requirementPopulationSchema = z.object({
  sex: z.enum(["female", "male", "all"]),
  ageMinYears: z.number().nonnegative(),
  ageMaxYears: z.number().positive(),
});

export const requirementRecordSchema = z.object({
  requirementId: z.string().min(1),
  setId: z.string().min(1),
  setVersion: z.string().min(1),
  nutrientCode: z.string().min(1),
  referenceType: referenceTypeSchema,
  value: z.number().nullable().optional(),
  valueMin: z.number().nullable().optional(),
  valueMax: z.number().nullable().optional(),
  unit: z.string().min(1),
  population: requirementPopulationSchema,
  source: z.string().nullable().optional(),
  sourceVersion: z.string().nullable().optional(),
  reviewStatus: reviewStatusSchema,
  devOnly: z.boolean(),
});

export type RequirementRecordContract = z.infer<typeof requirementRecordSchema>;
