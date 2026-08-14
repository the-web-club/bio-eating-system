import type {
  BiologicalCategorySlug,
  DeclaredAllergen,
  PrismaClient,
  RecordReviewStatus,
  ReferenceValueType,
  RequirementJurisdiction,
} from "@/generated/prisma/client";
import {
  APPROVED_REQUIREMENT_SET_VERSION,
} from "@/lib/biological-os/constants";
import type {
  CategoryCandidateMap,
  EngineFoodCandidate,
  EnginePipelineInput,
} from "@/lib/biological-os/types";
import { assertApprovedFoodCandidate } from "@/lib/biological-os/filter-exclusions";
import { buildExpandedFoodUniverse } from "@/lib/biological-os/food-universe";
import { evaluateRequirementSetProductionReady } from "@/lib/nutrition-data/requirements/compliance-gate";
import { assertProductionNutritionDataset } from "@/lib/nutrition-data/production-gate";
import { mapDbRequirementRows } from "@/lib/nutrition/requirements";
import { FOOD_SLOTS, type FoodSlot } from "@/lib/nutrition/plan-engine";
import type { NutrientContributionRow } from "@/lib/nutrition-data/types";

export class ProductionLoaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionLoaderError";
  }
}

type LoadedFoodRow = {
  id: string;
  externalId: string;
  name: string;
  displayName: string | null;
  source: string;
  sourceVersion: string;
  devOnly: boolean;
  biologicalCategory: { slug: BiologicalCategorySlug } | null;
  nutrients: Array<{
    amount: number;
    unit: NutrientContributionRow["unit"];
    perAmountG: number;
    source: string;
    sourceVersion: string;
    nutrient: { code: string };
  }>;
  allergens: Array<{ allergen: DeclaredAllergen }>;
  categoryCandidates: Array<{
    priority: number;
    category: { slug: BiologicalCategorySlug };
  }>;
};

export type ProductionEngineDataset = {
  requirementSetVersion: string;
  requirementRows: EnginePipelineInput["requirementRows"];
  candidates: EngineFoodCandidate[];
  categoryCandidates: CategoryCandidateMap;
};

function foodSlotFromSlug(slug: BiologicalCategorySlug): FoodSlot {
  if (!FOOD_SLOTS.includes(slug as FoodSlot)) {
    throw new ProductionLoaderError(`Unsupported biological category slug: ${slug}`);
  }
  return slug as FoodSlot;
}

export function mapDbFoodToEngineCandidate(food: LoadedFoodRow): EngineFoodCandidate | null {
  const categorySlug =
    food.biologicalCategory?.slug ??
    food.categoryCandidates.sort((a, b) => a.priority - b.priority)[0]?.category.slug;

  if (!categorySlug) {
    return null;
  }

  const candidate: EngineFoodCandidate = {
    foodId: food.id,
    externalId: food.externalId,
    name: food.displayName ?? food.name,
    biologicalCategory: foodSlotFromSlug(categorySlug),
    allergens: food.allergens.map((row) => row.allergen),
    nutrients: food.nutrients.map((row) => ({
      nutrientCode: row.nutrient.code,
      unit: row.unit,
      amount: row.amount,
      perAmountG: row.perAmountG,
      source: row.source,
      sourceVersion: row.sourceVersion,
    })),
    source: food.source,
    sourceVersion: food.sourceVersion,
    devOnly: food.devOnly,
  };

  try {
    assertApprovedFoodCandidate(candidate);
  } catch {
    return null;
  }

  return candidate;
}

export function buildProductionEngineDataset(args: {
  foods: LoadedFoodRow[];
  requirementSet: {
    version: string;
    devOnly: boolean;
    reviewStatus: RecordReviewStatus;
    source: string;
    sourceVersion: string;
    sourceUrl: string | null;
    termsUrl: string | null;
    jurisdiction: RequirementJurisdiction;
    requirements: Array<{
      nutrient: { code: string };
      ageMin: number;
      ageMax: number;
      sex: "female" | "male" | null;
      referenceType: string;
      value: number | null;
      valueMin: number | null;
      valueMax: number | null;
      unit: NutrientContributionRow["unit"];
      reviewStatus: RecordReviewStatus;
      devOnly: boolean;
    }>;
  };
}): ProductionEngineDataset {
  if (args.requirementSet.version !== APPROVED_REQUIREMENT_SET_VERSION) {
    throw new ProductionLoaderError(
      `Requirement set ${args.requirementSet.version} is not the approved production version.`,
    );
  }

  const gate = evaluateRequirementSetProductionReady({
    version: args.requirementSet.version,
    devOnly: args.requirementSet.devOnly,
    reviewStatus: args.requirementSet.reviewStatus,
    source: args.requirementSet.source,
    sourceVersion: args.requirementSet.sourceVersion,
    sourceUrl: args.requirementSet.sourceUrl,
    termsUrl: args.requirementSet.termsUrl,
    jurisdiction: args.requirementSet.jurisdiction,
    requirements: args.requirementSet.requirements.map((row) => ({
      nutrientCode: row.nutrient.code,
      reviewStatus: row.reviewStatus,
      devOnly: row.devOnly,
      referenceType: row.referenceType,
      value: row.value,
      valueMin: row.valueMin,
      valueMax: row.valueMax,
      unit: row.unit,
    })),
  });

  if (!gate.eligible) {
    throw new ProductionLoaderError(gate.failures.join("; "));
  }

  const candidates = args.foods
    .map(mapDbFoodToEngineCandidate)
    .filter((row): row is EngineFoodCandidate => row !== null)
    .sort((a, b) => a.foodId.localeCompare(b.foodId));

  if (candidates.length === 0) {
    throw new ProductionLoaderError("No approved production foods available for the engine.");
  }

  const storedRows = mapDbRequirementRows(
    args.requirementSet.requirements.map((row) => ({
      nutrient: { code: row.nutrient.code },
      ageMin: row.ageMin,
      ageMax: row.ageMax,
      sex: row.sex,
      lifeStage: null,
      referenceType: row.referenceType as ReferenceValueType,
      value: row.value,
      valueMin: row.valueMin,
      valueMax: row.valueMax,
      unit: row.unit,
      sourcePolicyCode: null,
      sourceVersion: args.requirementSet.sourceVersion,
    })),
  );

  const universe = buildExpandedFoodUniverse({ candidates });

  return {
    requirementSetVersion: args.requirementSet.version,
    requirementRows: storedRows.map((row) => ({
      nutrientCode: row.nutrientCode,
      ageMin: row.ageMin,
      ageMax: row.ageMax,
      sex: row.sex,
      referenceType: row.referenceType,
      value: row.value,
      valueMin: row.valueMin,
      valueMax: row.valueMax,
      unit: row.unit,
    })),
    candidates: universe.candidates,
    categoryCandidates: universe.categoryCandidates,
  };
}

export async function loadProductionEngineDataset(
  db: PrismaClient,
): Promise<ProductionEngineDataset> {
  await assertProductionNutritionDataset(db);

  const [foods, requirementSet] = await Promise.all([
    db.food.findMany({
      where: {
        devOnly: false,
        active: true,
        foodDataSource: {
          status: "APPROVED",
          devOnly: false,
        },
      },
      include: {
        biologicalCategory: true,
        nutrients: {
          include: { nutrient: true },
        },
        allergens: true,
        categoryCandidates: {
          include: { category: true },
          orderBy: { priority: "asc" },
        },
      },
      orderBy: { id: "asc" },
    }),
    db.requirementSet.findUnique({
      where: { version: APPROVED_REQUIREMENT_SET_VERSION },
      include: {
        requirements: {
          include: { nutrient: true },
        },
      },
    }),
  ]);

  if (!requirementSet) {
    throw new ProductionLoaderError(
      `Approved requirement set ${APPROVED_REQUIREMENT_SET_VERSION} is not loaded.`,
    );
  }

  return buildProductionEngineDataset({
    foods,
    requirementSet: {
      version: requirementSet.version,
      devOnly: requirementSet.devOnly,
      reviewStatus: requirementSet.reviewStatus,
      source: requirementSet.source,
      sourceVersion: requirementSet.sourceVersion,
      sourceUrl: requirementSet.sourceUrl,
      termsUrl: requirementSet.termsUrl,
      jurisdiction: requirementSet.jurisdiction,
      requirements: requirementSet.requirements.map((row) => ({
        nutrient: { code: row.nutrient.code },
        ageMin: row.ageMin,
        ageMax: row.ageMax,
        sex: row.sex,
        referenceType: row.referenceType,
        value: row.value,
        valueMin: row.valueMin,
        valueMax: row.valueMax,
        unit: row.unit,
        reviewStatus: row.reviewStatus,
        devOnly: row.devOnly,
      })),
    },
  });
}
