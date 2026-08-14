import { z } from "zod";

export const evidenceStatusSchema = z.enum([
  "COMPOSITION_ONLY",
  "REVIEWED_ASSOCIATION",
  "REVIEWED_REFERENCE",
]);

export const phytonutrientConcentrationSchema = z.object({
  foodId: z.string().min(1),
  amount: z.number(),
  unit: z.string().min(1),
  basis: z.string().nullable().optional(),
});

export const phytonutrientRecordSchema = z.object({
  compoundId: z.string().min(1),
  name: z.string().min(1),
  class: z.string().min(1),
  subclass: z.string().nullable().optional(),
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  nutrientCode: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  foodConcentrations: z.array(phytonutrientConcentrationSchema).optional(),
  evidenceStatus: evidenceStatusSchema,
  healthEffectClaimsAllowed: z.boolean(),
});

export const phytonutrientCatalogSchema = z.object({
  version: z.string().min(1),
  source: z.string().min(1),
  sourceVersion: z.string().min(1),
  reviewStatus: z.enum(["REVIEW_REQUIRED", "APPROVED", "REJECTED"]),
  notes: z.string().optional(),
  compounds: z.array(phytonutrientRecordSchema).min(1),
});

export type PhytonutrientRecordContract = z.infer<typeof phytonutrientRecordSchema>;
export type PhytonutrientCatalogContract = z.infer<typeof phytonutrientCatalogSchema>;
