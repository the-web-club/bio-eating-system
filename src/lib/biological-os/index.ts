export {
  APPROVED_FOOD_SOURCE,
  APPROVED_FOOD_SOURCE_VERSION,
  APPROVED_REQUIREMENT_SET_VERSION,
  BIOLOGICAL_OS_ENGINE_VERSION,
  DEFAULT_PORTION_GRAMS,
  GRAIN_OVERLAP_NUTRIENTS,
} from "@/lib/biological-os/constants";

export {
  buildFilteredCandidateSet,
  flattenCandidates,
  missingCategories,
} from "@/lib/biological-os/candidate-set";

export {
  buildNutrientProfileMap,
  coverageForDraft,
  uncoveredNutrientCodes,
} from "@/lib/biological-os/coverage-engine";

export {
  ApprovedDataError,
  assertApprovedFoodCandidate,
  filterApprovedCandidates,
  filterExcludedCandidates,
} from "@/lib/biological-os/filter-exclusions";

export {
  appendChangeReasons,
  buildEngineDataVersions,
  createFoodMatrixSnapshot,
  nextMatrixVersion,
  snapshotFromOptimizer,
} from "@/lib/biological-os/matrix-versioning";

export {
  categorySlugForFood,
  optimizeMinimalFoodSet,
} from "@/lib/biological-os/optimizer";

export {
  runBiologicalOsEnginePipeline,
  runDeterministicEnginePipeline,
} from "@/lib/biological-os/pipeline";

export {
  applyProteinTargetToRequirements,
  resolveProteinTargetGrams,
} from "@/lib/biological-os/protein-target";

export {
  recalculateAfterAdd,
  recalculateAfterRemoval,
} from "@/lib/biological-os/recalculate";

export {
  applyRedundancyChoice,
  applyRedundancyDecisionsToDraft,
  buildRedundancyProposals,
  detectRedundancyPairs,
  isProtectedByKeepBoth,
  overlapNutrients,
} from "@/lib/biological-os/redundancy";

export {
  RequirementResolutionError,
  assertApprovedRequirementSetVersion,
  resolveEngineRequirements,
} from "@/lib/biological-os/requirement-resolution";

export { isBiologicalOsEngineAllowlisted } from "@/lib/biological-os/engine-allowlist";

export {
  buildCategoryCandidateMap,
  buildProductionEngineDataset,
  loadProductionEngineDataset,
  mapDbFoodToEngineCandidate,
  ProductionLoaderError,
} from "@/lib/biological-os/production-loader";

export {
  buildMatrixPersistencePayload,
  getLatestMatrixVersionNumber,
  persistFoodMatrixSnapshot,
} from "@/lib/biological-os/persist-matrix";

export { runBiologicalOsEngineForUser } from "@/lib/biological-os/run-engine";

export {
  biologicalOsEngineRunBodySchema,
  type BiologicalOsEngineRunBody,
} from "@/lib/biological-os/schema";

export type { PersistedMatrixResult } from "@/lib/biological-os/persist-matrix";
export type { ProductionEngineDataset } from "@/lib/biological-os/production-loader";
export type { RunBiologicalOsEngineArgs } from "@/lib/biological-os/run-engine";

export type {
  CategoryCandidateMap,
  ChangeReason,
  ChangeReasonCode,
  EngineDataVersions,
  EngineFoodCandidate,
  EnginePipelineInput,
  EnginePipelineResult,
  EngineProfile,
  FoodMatrixDraft,
  FoodMatrixDraftItem,
  FoodMatrixSnapshot,
  InfeasibleReason,
  OptimizerResult,
  OptimizerStatus,
  ProteinPreferenceInput,
  RedundancyAssessmentRecord,
  RedundancyChoiceRecord,
  RedundancyProposal,
  RemovalRecalculation,
  ReplacementCandidate,
} from "@/lib/biological-os/types";
