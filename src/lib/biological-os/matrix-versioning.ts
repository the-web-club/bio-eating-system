import {
  APPROVED_FOOD_SOURCE_VERSION,
  APPROVED_REQUIREMENT_SET_VERSION,
  BIOLOGICAL_OS_ENGINE_VERSION,
  ENERGY_CALCULATION_VERSION,
  MET_REFERENCE_VERSION,
  PHYTONUTRIENT_CATALOG_VERSION,
  OPTIMIZER_POLICY_VERSION,
  PHYTONUTRIENT_POLICY_VERSION,
} from "@/lib/biological-os/constants";
import type {
  ChangeReason,
  EngineDataVersions,
  FoodMatrixDraft,
  FoodMatrixSnapshot,
  OptimizerResult,
  RedundancyAssessmentRecord,
  RedundancyChoiceRecord,
} from "@/lib/biological-os/types";
import type { CoverageRow } from "@/lib/nutrition-data/types";

export function buildEngineDataVersions(
  constraintVersion: string = BIOLOGICAL_OS_ENGINE_VERSION,
): EngineDataVersions {
  return {
    foodSource: "usda-fdc",
    foodSourceVersion: APPROVED_FOOD_SOURCE_VERSION,
    requirementSetVersion: APPROVED_REQUIREMENT_SET_VERSION,
    constraintVersion,
    energyCalculationVersion: ENERGY_CALCULATION_VERSION,
    metReferenceVersion: MET_REFERENCE_VERSION,
    phytonutrientCatalogVersion: PHYTONUTRIENT_CATALOG_VERSION,
    optimizerPolicyVersion: OPTIMIZER_POLICY_VERSION,
    phytonutrientPolicyVersion: PHYTONUTRIENT_POLICY_VERSION,
  };
}

export function createFoodMatrixSnapshot(args: {
  userId: string;
  version: number;
  draft: FoodMatrixDraft;
  coverage: CoverageRow[];
  changeReasons: ChangeReason[];
  redundancyAssessments: RedundancyAssessmentRecord[];
  redundancyChoices: RedundancyChoiceRecord[];
  dataVersions?: EngineDataVersions;
  createdAtIso?: string;
}): FoodMatrixSnapshot {
  const dataVersions = args.dataVersions ?? buildEngineDataVersions();

  return {
    userId: args.userId,
    version: args.version,
    status: "DRAFT",
    engineVersion: BIOLOGICAL_OS_ENGINE_VERSION,
    foodDatasetVersion: dataVersions.foodSourceVersion,
    requirementSetVersion: dataVersions.requirementSetVersion,
    calculationVersion: dataVersions.energyCalculationVersion,
    draft: args.draft,
    coverage: args.coverage,
    changeReasons: args.changeReasons,
    redundancyAssessments: args.redundancyAssessments,
    redundancyChoices: args.redundancyChoices,
    createdAtIso: args.createdAtIso ?? new Date(0).toISOString(),
  };
}

export function nextMatrixVersion(current?: number): number {
  return (current ?? 0) + 1;
}

export function snapshotFromOptimizer(args: {
  userId: string;
  version: number;
  optimizer: OptimizerResult;
  redundancyAssessments: RedundancyAssessmentRecord[];
  redundancyChoices: RedundancyChoiceRecord[];
  createdAtIso?: string;
}): FoodMatrixSnapshot {
  return createFoodMatrixSnapshot({
    userId: args.userId,
    version: args.version,
    draft: args.optimizer.draft,
    coverage: args.optimizer.coverage,
    changeReasons: args.optimizer.changeReasons,
    redundancyAssessments: args.redundancyAssessments,
    redundancyChoices: args.redundancyChoices,
    dataVersions: args.optimizer.dataVersions,
    createdAtIso: args.createdAtIso,
  });
}

export function appendChangeReasons(
  existing: ChangeReason[],
  added: ChangeReason[],
): ChangeReason[] {
  return [...existing, ...added];
}
