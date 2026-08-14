import { z } from "zod";
import { reviewStatusSchema } from "./food-record";

export const activityIntensitySchema = z.enum(["easy", "moderate", "hard", "not_applicable"]);

export const activityRecordSchema = z.object({
  metCode: z.string().min(1),
  label: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  category: z.string().nullable().optional(),
  intensity: activityIntensitySchema.optional(),
  metValue: z.number().positive(),
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  reviewStatus: reviewStatusSchema,
});

export const metReferenceSchema = z.object({
  version: z.string().min(1),
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  reviewStatus: reviewStatusSchema,
  notes: z.string().optional(),
  occupationPal: z.record(z.string(), z.number().positive()),
  activities: z.array(activityRecordSchema).min(1),
  fallbackMet: z
    .object({
      metCode: z.string().min(1),
      metValue: z.number().positive(),
      mustBeExplicitToUser: z.boolean(),
    })
    .optional(),
});

export type ActivityRecordContract = z.infer<typeof activityRecordSchema>;
export type MetReferenceContract = z.infer<typeof metReferenceSchema>;
