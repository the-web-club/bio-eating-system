import type { ProteinPreferenceType } from "@/generated/prisma/client";
import type { EngineProfile, ProteinPreferenceInput } from "@/lib/biological-os/types";

const PROTEIN_RATES: Record<
  Exclude<ProteinPreferenceType, "no_preference" | "custom">,
  number
> = {
  g_per_kg_0_7: 0.7,
  g_per_kg_1_0: 1.0,
  g_per_kg_1_6: 1.6,
  g_per_kg_2_2: 2.2,
};

export function resolveProteinTargetGrams(args: {
  profile: EngineProfile;
  preference?: ProteinPreferenceInput;
}): number | null {
  const preference = args.preference?.preference ?? "no_preference";

  if (preference === "no_preference") {
    return null;
  }

  if (preference === "custom") {
    const value = args.preference?.customValue;
    if (value === null || value === undefined || value <= 0) {
      throw new Error("Custom protein preference requires a positive customValue.");
    }
    return value;
  }

  const rate = PROTEIN_RATES[preference];
  return Math.round(args.profile.bodyWeightKg * rate * 10) / 10;
}

export function applyProteinTargetToRequirements(args: {
  requirements: Array<{ nutrientCode: string; unit: string; value: number }>;
  proteinTargetGrams: number | null;
}): Array<{ nutrientCode: string; unit: string; value: number }> {
  if (args.proteinTargetGrams === null) {
    return args.requirements;
  }

  return args.requirements.map((row) =>
    row.nutrientCode === "protein"
      ? { ...row, value: args.proteinTargetGrams as number }
      : row,
  );
}
