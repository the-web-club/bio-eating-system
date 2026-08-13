import type { PrismaClient } from "@/generated/prisma/client";
import { FOOD_SLOTS } from "@/lib/nutrition/plan-engine";
import {
  assertDevOnlyImportAllowed,
  assertSourceEligibleForProductionImport,
} from "./compliance-gate";
import { BIOLOGICAL_CATEGORY_LABELS, FIXTURE_FOOD_SOURCE } from "./constants";
import { assertBundleSourceMetadata, countImportRows } from "./normalize";
import { parseFoodSourceBundle, type FoodSourceBundle } from "./schema";
import {
  bundleHasBlockingValidationIssues,
  validateFoodSourceBundle,
} from "./validate-import";

export type FoodImportResult = {
  source: string;
  sourceVersion: string;
  rowCount: number;
  foodCount: number;
  nutrientCount: number;
  rowsReceived: number;
  rowsImported: number;
  rowsRejected: number;
  rowsWarning: number;
  devOnly: boolean;
};

export async function importFoodSourceBundle(
  prisma: PrismaClient,
  raw: unknown,
): Promise<FoodImportResult> {
  const bundle = parseFoodSourceBundle(raw);
  assertBundleSourceMetadata(bundle);

  const validation = validateFoodSourceBundle(bundle);
  if (bundleHasBlockingValidationIssues(validation)) {
    throw new Error(
      `Import validation failed with ${validation.rowsRejected} rejected rows`,
    );
  }

  const rowCount = countImportRows(bundle);
  const dataSource = await resolveFoodDataSource(prisma, bundle);

  assertDevOnlyImportAllowed(bundle.devOnly, dataSource);

  const isProductionImport = !bundle.devOnly && !dataSource.devOnly;
  if (isProductionImport) {
    assertSourceEligibleForProductionImport(dataSource);
  }

  const importRecord = await prisma.foodSourceImport.upsert({
    where: {
      source_sourceVersion: {
        source: bundle.source,
        sourceVersion: bundle.sourceVersion,
      },
    },
    create: {
      foodDataSourceId: dataSource.id,
      source: bundle.source,
      sourceVersion: bundle.sourceVersion,
      status: "running",
      rowCount: 0,
      rowsReceived: validation.rowsReceived,
      rowsRejected: validation.rowsRejected,
      rowsWarning: validation.rowsWarning,
      report: { issues: validation.issues },
    },
    update: {
      foodDataSourceId: dataSource.id,
      status: "running",
      error: null,
      rowsReceived: validation.rowsReceived,
      rowsRejected: validation.rowsRejected,
      rowsWarning: validation.rowsWarning,
      report: { issues: validation.issues },
    },
  });

  try {
    await seedPreparationStates(prisma);
    await seedBiologicalCategories(prisma);
    await upsertNutrients(prisma, bundle);
    const foodIdByExternal = await upsertFoods(prisma, bundle, importRecord.id, dataSource);
    await upsertFoodCategories(prisma, bundle, foodIdByExternal);
    await upsertSubstitutions(prisma, bundle, foodIdByExternal);
    if (bundle.requirementSet.requirements.length > 0) {
      await upsertRequirementSet(prisma, bundle);
    }
    await upsertBiologicalCategoryFoods(prisma, bundle, foodIdByExternal);

    await prisma.foodImportReportRow.createMany({
      data: validation.issues.map((issue) => ({
        importId: importRecord.id,
        outcome: issue.outcome,
        entityType: issue.entityType,
        externalId: issue.externalId ?? null,
        message: issue.message,
      })),
    });

    await prisma.foodSourceImport.update({
      where: { id: importRecord.id },
      data: {
        status: "completed",
        rowCount,
        rowsImported: rowCount,
        error: null,
      },
    });

    if (isProductionImport) {
      await prisma.foodDataSource.update({
        where: { id: dataSource.id },
        data: {
          importedAt: new Date(),
          retrievedAt: new Date(),
          status: "APPROVED",
        },
      });
    } else if (dataSource.devOnly === false && dataSource.status !== "APPROVED") {
      await prisma.foodDataSource.update({
        where: { id: dataSource.id },
        data: { status: "REVIEW_REQUIRED" },
      });
    }

    return {
      source: bundle.source,
      sourceVersion: bundle.sourceVersion,
      rowCount,
      foodCount: bundle.foods.length,
      nutrientCount: bundle.nutrients.length,
      rowsReceived: validation.rowsReceived,
      rowsImported: rowCount,
      rowsRejected: validation.rowsRejected,
      rowsWarning: validation.rowsWarning,
      devOnly: dataSource.devOnly || bundle.devOnly,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    await prisma.foodSourceImport.update({
      where: { id: importRecord.id },
      data: {
        status: "failed",
        error: message,
      },
    });
    throw error;
  }
}

async function resolveFoodDataSource(prisma: PrismaClient, bundle: FoodSourceBundle) {
  const existing = await prisma.foodDataSource.findUnique({
    where: { sourceKey: bundle.source },
  });
  if (existing) return existing;

  const devOnly = bundle.devOnly || bundle.source === FIXTURE_FOOD_SOURCE;

  if (!devOnly) {
    throw new Error(
      `Import blocked: source ${bundle.source} is not registered. Register and approve it in FoodDataSource before production import.`,
    );
  }

  return prisma.foodDataSource.create({
    data: {
      sourceKey: bundle.source,
      name: bundle.source,
      provider: "internal-fixture",
      datasetName: bundle.source,
      datasetVersion: bundle.sourceVersion,
      accessMethod: "fixture-file",
      license: "DEV_ONLY — not production nutrition data",
      devOnly: true,
      status: "REVIEW_REQUIRED",
      notes: "Development fixture. Not science grade.",
    },
  });
}

async function seedPreparationStates(prisma: PrismaClient) {
  const states = [
    "RAW",
    "BOILED",
    "STEAMED",
    "BAKED",
    "ROASTED",
    "GRILLED",
    "FRIED",
    "CANNED",
    "FERMENTED",
    "DRIED",
    "COOKED",
    "OTHER",
  ] as const;

  for (const slug of states) {
    await prisma.preparationState.upsert({
      where: { slug },
      create: { slug, name: slug.charAt(0) + slug.slice(1).toLowerCase() },
      update: {},
    });
  }
}

async function seedBiologicalCategories(prisma: PrismaClient) {
  for (const [index, slug] of FOOD_SLOTS.entries()) {
    await prisma.biologicalCategory.upsert({
      where: { slug },
      create: {
        slug,
        name: BIOLOGICAL_CATEGORY_LABELS[slug],
        sortOrder: index * 10,
        reviewStatus: "REVIEW_REQUIRED",
      },
      update: {
        name: BIOLOGICAL_CATEGORY_LABELS[slug],
        sortOrder: index * 10,
      },
    });
  }
}

async function upsertNutrients(prisma: PrismaClient, bundle: FoodSourceBundle) {
  for (const nutrient of bundle.nutrients) {
    await prisma.nutrient.upsert({
      where: { code: nutrient.code },
      create: {
        code: nutrient.code,
        name: nutrient.name,
        canonicalName: nutrient.name,
        displayName: nutrient.name,
        unit: nutrient.unit,
        nutrientClass: nutrient.nutrientClass ?? "OTHER_NUTRIENT",
        status: "REVIEW_REQUIRED",
      },
      update: {
        name: nutrient.name,
        canonicalName: nutrient.name,
        displayName: nutrient.name,
        unit: nutrient.unit,
        nutrientClass: nutrient.nutrientClass ?? "OTHER_NUTRIENT",
      },
    });
  }
}

async function upsertFoods(
  prisma: PrismaClient,
  bundle: FoodSourceBundle,
  importId: string,
  dataSource: { id: string; devOnly: boolean },
) {
  const nutrientByCode = await prisma.nutrient.findMany({
    select: { id: true, code: true, unit: true },
  });
  const nutrientIdByCode = new Map(nutrientByCode.map((row) => [row.code, row]));
  const foodIdByExternal = new Map<string, string>();
  const categories = await prisma.biologicalCategory.findMany({
    select: { id: true, slug: true },
  });
  const categoryIdBySlug = new Map(categories.map((row) => [row.slug, row.id]));

  for (const food of bundle.foods) {
    const preparationSlug = food.preparationState ?? "RAW";
    const preparationState = await prisma.preparationState.findUnique({
      where: { slug: preparationSlug },
    });
    const biologicalCategoryId = categoryIdBySlug.get(food.biologicalCategory);

    const row = await prisma.food.upsert({
      where: {
        source_sourceVersion_externalId: {
          source: bundle.source,
          sourceVersion: bundle.sourceVersion,
          externalId: food.externalId,
        },
      },
      create: {
        externalId: food.externalId,
        source: bundle.source,
        sourceVersion: bundle.sourceVersion,
        canonicalName: food.canonicalName ?? food.name,
        displayName: food.displayName ?? food.name,
        name: food.name,
        active: true,
        devOnly: dataSource.devOnly || bundle.devOnly,
        foodDataSourceId: dataSource.id,
        sourceImportId: importId,
        preparationStateId: preparationState?.id,
        processingState: preparationSlug,
        biologicalCategoryId,
        reviewStatus: "REVIEW_REQUIRED",
      },
      update: {
        canonicalName: food.canonicalName ?? food.name,
        displayName: food.displayName ?? food.name,
        name: food.name,
        active: true,
        devOnly: dataSource.devOnly || bundle.devOnly,
        foodDataSourceId: dataSource.id,
        sourceImportId: importId,
        preparationStateId: preparationState?.id,
        processingState: preparationSlug,
        biologicalCategoryId,
        reviewStatus: "REVIEW_REQUIRED",
      },
    });

    foodIdByExternal.set(food.externalId, row.id);

    for (const nutrient of food.nutrients) {
      const nutrientRow = nutrientIdByCode.get(nutrient.code);
      if (!nutrientRow) {
        throw new Error(`Missing nutrient row for code ${nutrient.code}`);
      }

      await prisma.foodNutrient.upsert({
        where: {
          foodId_nutrientId: {
            foodId: row.id,
            nutrientId: nutrientRow.id,
          },
        },
        create: {
          foodId: row.id,
          nutrientId: nutrientRow.id,
          amount: nutrient.amount,
          unit: nutrientRow.unit,
          basisAmount: nutrient.basisAmount ?? nutrient.perAmountG,
          basisUnit: nutrient.basisUnit ?? "g",
          perAmountG: nutrient.perAmountG,
          source: bundle.source,
          sourceVersion: bundle.sourceVersion,
          sourceImportId: importId,
          reviewStatus: "REVIEW_REQUIRED",
        },
        update: {
          amount: nutrient.amount,
          unit: nutrientRow.unit,
          basisAmount: nutrient.basisAmount ?? nutrient.perAmountG,
          basisUnit: nutrient.basisUnit ?? "g",
          perAmountG: nutrient.perAmountG,
          source: bundle.source,
          sourceVersion: bundle.sourceVersion,
          sourceImportId: importId,
          reviewStatus: "REVIEW_REQUIRED",
        },
      });
    }

    await prisma.foodAllergen.deleteMany({ where: { foodId: row.id } });
    for (const allergen of food.allergens) {
      await prisma.foodAllergen.create({
        data: {
          foodId: row.id,
          allergen,
          source: bundle.source,
          sourceVersion: bundle.sourceVersion,
          reviewStatus: "REVIEW_REQUIRED",
        },
      });
    }
  }

  return foodIdByExternal;
}

async function upsertFoodCategories(
  prisma: PrismaClient,
  bundle: FoodSourceBundle,
  foodIdByExternal: Map<string, string>,
) {
  for (const food of bundle.foods) {
    const foodId = foodIdByExternal.get(food.externalId);
    if (!foodId) continue;

    for (const slug of food.foodCategories) {
      const category = await prisma.foodCategory.upsert({
        where: { slug },
        create: { slug, name: slug.replace(/_/g, " ") },
        update: {},
      });

      await prisma.foodCategoryMap.upsert({
        where: {
          foodId_categoryId: {
            foodId,
            categoryId: category.id,
          },
        },
        create: { foodId, categoryId: category.id },
        update: {},
      });
    }
  }
}

async function upsertSubstitutions(
  prisma: PrismaClient,
  bundle: FoodSourceBundle,
  foodIdByExternal: Map<string, string>,
) {
  for (const sub of bundle.substitutions) {
    const fromFoodId = foodIdByExternal.get(sub.fromExternalId);
    const toFoodId = foodIdByExternal.get(sub.toExternalId);
    if (!fromFoodId || !toFoodId) continue;

    await prisma.foodSubstitution.upsert({
      where: {
        fromFoodId_toFoodId: {
          fromFoodId,
          toFoodId,
        },
      },
      create: {
        fromFoodId,
        toFoodId,
        rank: sub.rank,
        reasonTags: sub.reasonTags,
        reviewStatus: "REVIEW_REQUIRED",
        sourceVersion: bundle.sourceVersion,
      },
      update: {
        rank: sub.rank,
        reasonTags: sub.reasonTags,
        sourceVersion: bundle.sourceVersion,
      },
    });
  }
}

async function upsertRequirementSet(prisma: PrismaClient, bundle: FoodSourceBundle) {
  const nutrientByCode = await prisma.nutrient.findMany({
    select: { id: true, code: true },
  });
  const nutrientIdByCode = new Map(nutrientByCode.map((row) => [row.code, row.id]));

  const devOnly = bundle.requirementSet.devOnly || bundle.devOnly;

  const set = await prisma.requirementSet.upsert({
    where: { version: bundle.requirementSet.version },
    create: {
      version: bundle.requirementSet.version,
      name: bundle.requirementSet.version,
      jurisdiction: "INTERNAL",
      populationScope: devOnly ? "Development fixture only" : null,
      source: bundle.source,
      sourceVersion: bundle.sourceVersion,
      reviewStatus: "REVIEW_REQUIRED",
      devOnly,
      reviewer: bundle.requirementSet.reviewer ?? null,
      importedAt: new Date(),
    },
    update: {
      name: bundle.requirementSet.version,
      jurisdiction: "INTERNAL",
      populationScope: devOnly ? "Development fixture only" : null,
      source: bundle.source,
      sourceVersion: bundle.sourceVersion,
      reviewStatus: "REVIEW_REQUIRED",
      devOnly,
      reviewer: bundle.requirementSet.reviewer ?? null,
      importedAt: new Date(),
    },
  });

  await prisma.nutrientRequirement.deleteMany({ where: { setId: set.id } });

  for (const req of bundle.requirementSet.requirements) {
    const nutrientId = nutrientIdByCode.get(req.nutrientCode);
    if (!nutrientId) {
      throw new Error(`Missing nutrient for requirement ${req.nutrientCode}`);
    }

    const scalarValue = req.value ?? req.valueMin ?? req.valueMax;
    if (scalarValue === null || scalarValue === undefined) {
      throw new Error(`Requirement ${req.nutrientCode} missing numeric value`);
    }

    await prisma.nutrientRequirement.create({
      data: {
        setId: set.id,
        nutrientId,
        ageMin: req.ageMin,
        ageMax: req.ageMax,
        sex: req.sex,
        referenceType: req.referenceType,
        value: scalarValue,
        valueMin: req.valueMin ?? null,
        valueMax: req.valueMax ?? null,
        unit: req.unit,
        sourcePolicyCode: bundle.source,
        sourceVersion: bundle.sourceVersion,
        reviewStatus: "REVIEW_REQUIRED",
        devOnly,
      },
    });
  }
}

async function upsertBiologicalCategoryFoods(
  prisma: PrismaClient,
  bundle: FoodSourceBundle,
  foodIdByExternal: Map<string, string>,
) {
  const categories = await prisma.biologicalCategory.findMany({
    select: { id: true, slug: true },
  });
  const categoryIdBySlug = new Map(categories.map((row) => [row.slug, row.id]));

  for (const food of bundle.foods) {
    const foodId = foodIdByExternal.get(food.externalId);
    const categoryId = categoryIdBySlug.get(food.biologicalCategory);
    if (!foodId || !categoryId) continue;

    await prisma.biologicalCategoryFood.upsert({
      where: {
        categoryId_foodId: {
          categoryId,
          foodId,
        },
      },
      create: {
        categoryId,
        foodId,
        priority: 0,
        eligibilityStatus: "IMPORTED",
        reviewStatus: "REVIEW_REQUIRED",
      },
      update: {
        priority: 0,
      },
    });
  }
}

export async function loadFoodSourceBundleFromFile(path: string): Promise<FoodSourceBundle> {
  const { readFile } = await import("node:fs/promises");
  const raw = JSON.parse(await readFile(path, "utf8")) as unknown;
  return parseFoodSourceBundle(raw);
}
