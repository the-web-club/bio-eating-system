import { db } from "@/lib/db";

export async function loadFoodImports() {
  const [imports, foodCount, nutrientCount, requirementSet] = await Promise.all([
    db.foodSourceImport.findMany({
      orderBy: { importDate: "desc" },
      take: 20,
    }),
    db.food.count({ where: { active: true } }),
    db.nutrient.count(),
    db.requirementSet.findFirst({
      orderBy: { updatedAt: "desc" },
      select: {
        version: true,
        reviewStatus: true,
        devOnly: true,
        reviewer: true,
        reviewedAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    imports,
    foodCount,
    nutrientCount,
    requirementSet,
  };
}
