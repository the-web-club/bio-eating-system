import type { ReferenceValueType } from "@/generated/prisma/client";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
  BIOLOGICAL_OS_ENGINE_VERSION,
  DEFAULT_PORTION_GRAMS,
} from "@/lib/biological-os/constants";
import { buildFilteredCandidateSet } from "@/lib/biological-os/candidate-set";
import {
  buildEngineDataVersions,
  nextMatrixVersion,
  snapshotFromOptimizer,
} from "@/lib/biological-os/matrix-versioning";
import { optimizeMinimalFoodSet } from "@/lib/biological-os/optimizer";
import {
  buildRedundancyProposals,
  detectRedundancyPairs,
} from "@/lib/biological-os/redundancy";
import { resolveEngineRequirements } from "@/lib/biological-os/requirement-resolution";
import type {
  EnginePipelineInput,
  EnginePipelineResult,
  FoodMatrixDraftItem,
} from "@/lib/biological-os/types";
import type { StoredRequirementRow } from "@/lib/nutrition/requirements";

export function runBiologicalOsEnginePipeline(
  input: EnginePipelineInput,
): EnginePipelineResult {
  const requirementRows: StoredRequirementRow[] = input.requirementRows.map((row) => ({
    ...row,
    referenceType: row.referenceType as ReferenceValueType,
    lifeStage: null,
  }));

  const requirements = resolveEngineRequirements({
    profile: input.profile,
    rows: requirementRows,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
    proteinPreference: input.proteinPreference,
  });

  const filtered = buildFilteredCandidateSet({
    categoryCandidates: input.categoryCandidates,
    excludedAllergens: input.excludedAllergens,
    hardExcludedFoodIds: input.hardExcludedFoodIds,
  });

  const dataVersions = buildEngineDataVersions(BIOLOGICAL_OS_ENGINE_VERSION);
  const redundancyChoices = input.redundancyChoices ?? [];

  const extraItems: FoodMatrixDraftItem[] = [];

  const optimizer = optimizeMinimalFoodSet({
    categoryCandidates: filtered.categoryCandidates,
    candidates: filtered.candidates,
    requirements,
    dataVersions,
    requiredFoodIds: input.requiredFoodIds,
    redundancyChoices,
    portionGrams: DEFAULT_PORTION_GRAMS,
    extraItems,
  });

  const candidatesById = new Map(
    filtered.candidates.map((candidate) => [candidate.foodId, candidate]),
  );

  const redundancyAssessments = detectRedundancyPairs({
    draft: optimizer.draft,
    candidatesById,
    redundancyChoices,
    portionGrams: DEFAULT_PORTION_GRAMS,
  });

  const redundancyProposals = buildRedundancyProposals(redundancyAssessments);

  const snapshot = snapshotFromOptimizer({
    userId: input.userId,
    version: nextMatrixVersion(input.matrixVersion),
    optimizer,
    redundancyAssessments,
    redundancyChoices,
    createdAtIso: input.timestampIso,
  });

  return {
    requirements,
    optimizer,
    redundancyProposals,
    snapshot,
  };
}

export function runDeterministicEnginePipeline(
  input: EnginePipelineInput,
): EnginePipelineResult {
  return runBiologicalOsEnginePipeline({
    ...input,
    timestampIso: input.timestampIso ?? "1970-01-01T00:00:00.000Z",
  });
}
