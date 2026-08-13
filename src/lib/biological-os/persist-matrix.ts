import type { Prisma, PrismaClient, RedundancyLevel } from "@/generated/prisma/client";
import type {
  EnginePipelineResult,
  FoodMatrixSnapshot,
  RedundancyAssessmentRecord,
  RedundancyChoiceRecord,
} from "@/lib/biological-os/types";

export type PersistedMatrixResult = {
  matrixVersionId: string;
  version: number;
  pipeline: EnginePipelineResult;
};

function normalizeRedundancyPair(foodAId: string, foodBId: string): {
  foodAId: string;
  foodBId: string;
} {
  return foodAId < foodBId ? { foodAId, foodBId } : { foodAId: foodBId, foodBId: foodAId };
}

function mapAssessmentLevel(level: RedundancyAssessmentRecord["level"]): RedundancyLevel {
  return level === "INTENTIONAL" ? "INTENTIONAL" : "POTENTIAL";
}

export function buildMatrixPersistencePayload(args: {
  snapshot: FoodMatrixSnapshot;
  pipeline: EnginePipelineResult;
}): {
  matrixVersion: {
    userId: string;
    version: number;
    status: "DRAFT";
    engineVersion: string;
    foodDatasetVersion: string;
    requirementSetVersion: string;
    calculationVersion: string;
  };
  items: Array<{
    foodId: string;
    biologicalCategorySlug: FoodMatrixSnapshot["draft"]["items"][number]["biologicalCategorySlug"];
    portionGrams: number;
    preference: FoodMatrixSnapshot["draft"]["items"][number]["preference"];
    sortOrder: number;
  }>;
  assessments: Array<{
    foodAId: string;
    foodBId: string;
    level: RedundancyLevel;
    overlapNutrients: string[];
  }>;
  choices: RedundancyChoiceRecord[];
  auditDetail: Prisma.InputJsonValue;
} {
  const assessments = args.snapshot.redundancyAssessments.map((assessment) => {
    const pair = normalizeRedundancyPair(assessment.foodAId, assessment.foodBId);
    return {
      foodAId: pair.foodAId,
      foodBId: pair.foodBId,
      level: mapAssessmentLevel(assessment.level),
      overlapNutrients: assessment.overlapNutrients,
    };
  });

  const choices = args.snapshot.redundancyChoices.map((choice) => {
    const pair = normalizeRedundancyPair(choice.foodAId, choice.foodBId);
    return {
      foodAId: pair.foodAId,
      foodBId: pair.foodBId,
      decision: choice.decision,
    };
  });

  return {
    matrixVersion: {
      userId: args.snapshot.userId,
      version: args.snapshot.version,
      status: "DRAFT",
      engineVersion: args.snapshot.engineVersion,
      foodDatasetVersion: args.snapshot.foodDatasetVersion,
      requirementSetVersion: args.snapshot.requirementSetVersion,
      calculationVersion: args.snapshot.calculationVersion,
    },
    items: args.snapshot.draft.items.map((item) => ({
      foodId: item.foodId,
      biologicalCategorySlug: item.biologicalCategorySlug,
      portionGrams: item.portionGrams,
      preference: item.preference,
      sortOrder: item.sortOrder,
    })),
    assessments,
    choices,
    auditDetail: {
      matrixVersion: args.snapshot.version,
      optimizerStatus: args.pipeline.optimizer.status,
      infeasibleReason: args.pipeline.optimizer.infeasibleReason ?? null,
      missingCategories: args.pipeline.optimizer.missingCategories ?? [],
      uncoveredNutrients: args.pipeline.optimizer.uncoveredNutrients ?? [],
      changeReasons: args.snapshot.changeReasons,
      coverage: args.snapshot.coverage,
      redundancyProposalCount: args.pipeline.redundancyProposals.length,
    },
  };
}

export async function persistFoodMatrixSnapshot(args: {
  db: PrismaClient;
  snapshot: FoodMatrixSnapshot;
  pipeline: EnginePipelineResult;
}): Promise<PersistedMatrixResult> {
  const payload = buildMatrixPersistencePayload(args);

  const created = await args.db.$transaction(async (tx) => {
    const matrixVersion = await tx.foodMatrixVersion.create({
      data: payload.matrixVersion,
    });

    if (payload.items.length > 0) {
      await tx.foodMatrixItem.createMany({
        data: payload.items.map((item) => ({
          matrixVersionId: matrixVersion.id,
          ...item,
        })),
      });
    }

    if (payload.assessments.length > 0) {
      await tx.redundancyAssessment.createMany({
        data: payload.assessments.map((assessment) => ({
          matrixVersionId: matrixVersion.id,
          foodAId: assessment.foodAId,
          foodBId: assessment.foodBId,
          level: assessment.level,
          overlapNutrients: assessment.overlapNutrients,
        })),
      });
    }

    if (payload.choices.length > 0) {
      await tx.redundancyChoice.createMany({
        data: payload.choices.map((choice) => ({
          matrixVersionId: matrixVersion.id,
          foodAId: choice.foodAId,
          foodBId: choice.foodBId,
          decision: choice.decision,
        })),
      });
    }

    await tx.auditEvent.create({
      data: {
        userId: args.snapshot.userId,
        action: "biological_os.matrix_generated",
        actor: "engine",
        detail: {
          matrixVersionId: matrixVersion.id,
          ...(payload.auditDetail as Record<string, unknown>),
        },
      },
    });

    return matrixVersion;
  });

  return {
    matrixVersionId: created.id,
    version: created.version,
    pipeline: args.pipeline,
  };
}

export async function getLatestMatrixVersionNumber(args: {
  db: PrismaClient;
  userId: string;
}): Promise<number> {
  const latest = await args.db.foodMatrixVersion.findFirst({
    where: { userId: args.userId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return latest?.version ?? 0;
}
