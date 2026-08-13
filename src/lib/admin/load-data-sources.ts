import { db } from "@/lib/db";
import { getProductionDatasetStatus } from "@/lib/nutrition-data/production-gate";

export async function loadDataSources() {
  const [sources, productionStatus] = await Promise.all([
    db.foodDataSource.findMany({
      orderBy: [{ devOnly: "asc" }, { sourceKey: "asc" }],
    }),
    getProductionDatasetStatus(db),
  ]);

  return { sources, productionStatus };
}
