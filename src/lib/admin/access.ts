import { z } from "zod";

/** Product access flags staff may set. Labels are UI-facing, not schema names. */
export const accessFlagsSchema = z.object({
  corePlan: z.boolean(),
  weeklyRotation: z.boolean(),
  labReference: z.boolean(),
  coaching: z.boolean(),
  hormoneModule: z.boolean(),
  nervousModule: z.boolean(),
});

export type AccessFlags = z.infer<typeof accessFlagsSchema>;

export const ACCESS_FLAG_LABELS: { key: keyof AccessFlags; label: string; hint: string }[] = [
  { key: "corePlan", label: "Daily plan", hint: "Intake and generated daily plan" },
  { key: "weeklyRotation", label: "Weekly list", hint: "Rotation emails and weekly view" },
  { key: "labReference", label: "Biomarker reference", hint: "Read-only lab ranges" },
  { key: "coaching", label: "Coaching", hint: "Flag for human coaching follow-up" },
  { key: "hormoneModule", label: "Hormone module", hint: "Reserved; product not shipped" },
  { key: "nervousModule", label: "Nervous system module", hint: "Reserved; product not shipped" },
];

export function emptyAccessFlags(): AccessFlags {
  return {
    corePlan: false,
    weeklyRotation: false,
    labReference: false,
    coaching: false,
    hormoneModule: false,
    nervousModule: false,
  };
}

export function accessFlagsFromRecord(
  row:
    | {
        corePlan: boolean;
        weeklyRotation: boolean;
        labReference: boolean;
        coaching: boolean;
        hormoneModule: boolean;
        nervousModule: boolean;
      }
    | null
    | undefined,
): AccessFlags {
  if (!row) return emptyAccessFlags();
  return {
    corePlan: row.corePlan,
    weeklyRotation: row.weeklyRotation,
    labReference: row.labReference,
    coaching: row.coaching,
    hormoneModule: row.hormoneModule,
    nervousModule: row.nervousModule,
  };
}
