import {
  APPROVED_REQUIREMENT_SET_VERSION,
} from "@/lib/biological-os/constants";
import {
  applyProteinTargetToRequirements,
  resolveProteinTargetGrams,
} from "@/lib/biological-os/protein-target";
import type {
  EngineProfile,
  ProteinPreferenceInput,
} from "@/lib/biological-os/types";
import type { DailyRequirement } from "@/lib/nutrition-data/types";
import {
  resolveDailyRequirements,
  type StoredRequirementRow,
} from "@/lib/nutrition/requirements";

export class RequirementResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequirementResolutionError";
  }
}

export function assertApprovedRequirementSetVersion(version: string): void {
  if (version !== APPROVED_REQUIREMENT_SET_VERSION) {
    throw new RequirementResolutionError(
      `Requirement set version ${version} is not approved for Biological OS engine.`,
    );
  }
}

export function resolveEngineRequirements(args: {
  profile: EngineProfile;
  rows: StoredRequirementRow[];
  requirementSetVersion: string;
  proteinPreference?: ProteinPreferenceInput;
}): DailyRequirement[] {
  assertApprovedRequirementSetVersion(args.requirementSetVersion);

  const base = resolveDailyRequirements({
    profile: { age: args.profile.age, sex: args.profile.sex },
    rows: args.rows,
  });

  const proteinTarget = resolveProteinTargetGrams({
    profile: args.profile,
    preference: args.proteinPreference,
  });

  return applyProteinTargetToRequirements({
    requirements: base,
    proteinTargetGrams: proteinTarget,
  }) as DailyRequirement[];
}
