import { FIXTURE_FOOD_SOURCE } from "./constants";

export const PRODUCTION_DATASET_MISSING =
  "Production nutrition dataset not yet approved";

export type ProductionDatasetStatus = {
  ready: boolean;
  approvedFoodSources: number;
  approvedRequirementSets: number;
  devOnlyFoodCount: number;
  message: string;
};

type ProductionGateDb = {
  foodDataSource: {
    count(args: { where: { status: "APPROVED"; devOnly: false } }): Promise<number>;
  };
  requirementSet: {
    count(args: { where: { reviewStatus: "APPROVED"; devOnly: false } }): Promise<number>;
  };
  food: {
    count(args: { where: { devOnly: true } }): Promise<number>;
  };
};

export async function getProductionDatasetStatus(
  db: ProductionGateDb,
): Promise<ProductionDatasetStatus> {
  const [approvedFoodSources, approvedRequirementSets, devOnlyFoodCount] =
    await Promise.all([
      db.foodDataSource.count({ where: { status: "APPROVED", devOnly: false } }),
      db.requirementSet.count({ where: { reviewStatus: "APPROVED", devOnly: false } }),
      db.food.count({ where: { devOnly: true } }),
    ]);

  const ready = approvedFoodSources > 0 && approvedRequirementSets > 0;

  return {
    ready,
    approvedFoodSources,
    approvedRequirementSets,
    devOnlyFoodCount,
    message: ready
      ? "Approved production nutrition datasets are available."
      : PRODUCTION_DATASET_MISSING,
  };
}

export async function assertProductionNutritionDataset(db: ProductionGateDb): Promise<void> {
  const status = await getProductionDatasetStatus(db);
  if (!status.ready) {
    throw new Error(status.message);
  }
}

export function isDevOnlySourceKey(sourceKey: string): boolean {
  return sourceKey === FIXTURE_FOOD_SOURCE;
}
