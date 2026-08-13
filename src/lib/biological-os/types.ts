import type {
  BiologicalCategorySlug,
  PreferenceKind,
  RedundancyDecision,
  ProteinPreferenceType,
} from "@/generated/prisma/client";
import type { NutrientUnit } from "@/generated/prisma/client";
import type { CoverageRow, DailyRequirement, NutrientContributionRow } from "@/lib/nutrition-data/types";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";

export type EngineProfile = {
  age: number;
  sex: "female" | "male";
  bodyWeightKg: number;
};

export type ProteinPreferenceInput = {
  preference: ProteinPreferenceType;
  customValue?: number | null;
};

export type EngineDataVersions = {
  foodSource: string;
  foodSourceVersion: string;
  requirementSetVersion: string;
  constraintVersion: string;
};

export type EngineFoodCandidate = {
  foodId: string;
  externalId: string;
  name: string;
  biologicalCategory: FoodSlot;
  allergens: string[];
  nutrients: NutrientContributionRow[];
  source: string;
  sourceVersion: string;
  devOnly: boolean;
};

export type CategoryCandidateMap = Record<FoodSlot, EngineFoodCandidate[]>;

export type RedundancyChoiceRecord = {
  foodAId: string;
  foodBId: string;
  decision: RedundancyDecision;
};

export type FoodMatrixDraftItem = {
  foodId: string;
  biologicalCategorySlug: BiologicalCategorySlug;
  portionGrams: number;
  preference: PreferenceKind;
  sortOrder: number;
};

export type FoodMatrixDraft = {
  items: FoodMatrixDraftItem[];
};

export type ChangeReasonCode =
  | "category_seed"
  | "coverage_fill"
  | "optimizer_prune"
  | "user_required"
  | "redundancy_keep_both"
  | "replacement_ranked"
  | "user_removed";

export type ChangeReason = {
  code: ChangeReasonCode;
  foodId: string;
  detail?: string;
};

export type OptimizerStatus = "ok" | "infeasible" | "maintenance_only";

export type InfeasibleReason =
  | "no_candidate_for_category"
  | "required_food_infeasible"
  | "uncovered_nutrients";

export type OptimizerResult = {
  status: OptimizerStatus;
  infeasibleReason?: InfeasibleReason;
  uncoveredNutrients?: string[];
  missingCategories?: FoodSlot[];
  draft: FoodMatrixDraft;
  coverage: CoverageRow[];
  changeReasons: ChangeReason[];
  engineVersion: string;
  dataVersions: EngineDataVersions;
};

export type RedundancyAssessmentRecord = {
  foodAId: string;
  foodBId: string;
  overlapNutrients: string[];
  level: "POTENTIAL" | "INTENTIONAL";
};

export type RedundancyProposal = {
  assessment: RedundancyAssessmentRecord;
  suggestedActions: RedundancyDecision[];
};

export type ReplacementCandidate = {
  foodId: string;
  name: string;
  score: number;
  nutrientsFilled: string[];
};

export type RemovalRecalculation = {
  removedFoodId: string;
  coverageAfterRemoval: CoverageRow[];
  lostNutrients: Array<{ nutrientCode: string; unit: NutrientUnit; lost: number }>;
  replacementCandidates: ReplacementCandidate[];
};

export type FoodMatrixSnapshot = {
  userId: string;
  version: number;
  status: "DRAFT";
  engineVersion: string;
  foodDatasetVersion: string;
  requirementSetVersion: string;
  calculationVersion: string;
  draft: FoodMatrixDraft;
  coverage: CoverageRow[];
  changeReasons: ChangeReason[];
  redundancyAssessments: RedundancyAssessmentRecord[];
  redundancyChoices: RedundancyChoiceRecord[];
  createdAtIso: string;
};

export type EnginePipelineInput = {
  userId: string;
  profile: EngineProfile;
  requirementRows: Array<{
    nutrientCode: string;
    ageMin: number;
    ageMax: number;
    sex: "female" | "male" | null;
    referenceType: string;
    value: number | null;
    valueMin: number | null;
    valueMax: number | null;
    unit: NutrientUnit;
  }>;
  proteinPreference?: ProteinPreferenceInput;
  candidates: EngineFoodCandidate[];
  categoryCandidates: CategoryCandidateMap;
  excludedAllergens?: string[];
  hardExcludedFoodIds?: string[];
  requiredFoodIds?: string[];
  redundancyChoices?: RedundancyChoiceRecord[];
  matrixVersion?: number;
  timestampIso?: string;
};

export type EnginePipelineResult = {
  requirements: DailyRequirement[];
  optimizer: OptimizerResult;
  redundancyProposals: RedundancyProposal[];
  snapshot: FoodMatrixSnapshot;
};
