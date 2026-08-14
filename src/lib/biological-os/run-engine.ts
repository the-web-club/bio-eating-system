import type { PrismaClient } from "@/generated/prisma/client";
import { loadProductionEngineDataset } from "@/lib/biological-os/production-loader";
import {
  getLatestMatrixVersionNumber,
  persistFoodMatrixSnapshot,
  type PersistedMatrixResult,
} from "@/lib/biological-os/persist-matrix";
import { runBiologicalOsEnginePipeline } from "@/lib/biological-os/pipeline";
import type {
  EngineActivityInput,
  EngineDailyLifeInput,
  EngineProfile,
  ProteinPreferenceInput,
  RedundancyChoiceRecord,
} from "@/lib/biological-os/types";

export type RunBiologicalOsEngineArgs = {
  db: PrismaClient;
  userId: string;
  profile: EngineProfile;
  excludedAllergens?: string[];
  requiredFoodIds?: string[];
  hardExcludedFoodIds?: string[];
  favoriteFoodIds?: string[];
  proteinPreference?: ProteinPreferenceInput;
  redundancyChoices?: RedundancyChoiceRecord[];
  dailyLife?: EngineDailyLifeInput;
  activities?: EngineActivityInput[];
  timestampIso?: string;
};

export async function runBiologicalOsEngineForUser(
  args: RunBiologicalOsEngineArgs,
): Promise<PersistedMatrixResult> {
  const dataset = await loadProductionEngineDataset(args.db);
  const matrixVersion = await getLatestMatrixVersionNumber({
    db: args.db,
    userId: args.userId,
  });

  const pipeline = runBiologicalOsEnginePipeline({
    userId: args.userId,
    profile: args.profile,
    requirementRows: dataset.requirementRows,
    candidates: dataset.candidates,
    categoryCandidates: dataset.categoryCandidates,
    excludedAllergens: args.excludedAllergens,
    requiredFoodIds: args.requiredFoodIds,
    hardExcludedFoodIds: args.hardExcludedFoodIds,
    favoriteFoodIds: args.favoriteFoodIds,
    proteinPreference: args.proteinPreference,
    redundancyChoices: args.redundancyChoices,
    dailyLife: args.dailyLife,
    activities: args.activities,
    matrixVersion,
    timestampIso: args.timestampIso,
  });

  return persistFoodMatrixSnapshot({
    db: args.db,
    snapshot: pipeline.snapshot,
    pipeline,
  });
}
