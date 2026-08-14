#!/usr/bin/env tsx
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { SOURCE_REGISTRY } from "../src/lib/nutrition-data/source-registry";
import { detectCanonicalDuplicateGroups } from "../src/lib/nutrition-data/canonical-food-identity";
import { evaluateSourceCompliance } from "../src/lib/nutrition-data/compliance-gate";
import { USDA_NUTRIENT_CATALOG } from "../src/lib/nutrition-data/sources/usda/nutrient-map";
import { phytonutrientCatalogSchema } from "../src/lib/biological-os/contracts";

function createClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is required for validate:food-foundation");
  const url = new URL(raw);
  const sslAccept = url.searchParams.get("sslaccept");
  const connectionLimitRaw = url.searchParams.get("connection_limit");
  const database = url.pathname.replace(/^\//, "");
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: database || undefined,
    connectionLimit: connectionLimitRaw ? Number(connectionLimitRaw) : 5,
    ssl:
      sslAccept === "strict"
        ? { rejectUnauthorized: true }
        : sslAccept === "accept_invalid_certs"
          ? { rejectUnauthorized: false }
          : undefined,
  });
  return new PrismaClient({ adapter });
}

function validateContentFiles() {
  const failures: string[] = [];

  const catalogPath = path.join(process.cwd(), "content/phytonutrients/phytonutrient-catalog-v2.json");
  if (!existsSync(catalogPath)) {
    failures.push("Missing phytonutrient catalog v2 file.");
  } else {
    phytonutrientCatalogSchema.parse(JSON.parse(readFileSync(catalogPath, "utf8")));
  }

  if (USDA_NUTRIENT_CATALOG.length < 90) {
    failures.push(`USDA nutrient catalog unexpectedly small: ${USDA_NUTRIENT_CATALOG.length}`);
  }

  for (const entry of SOURCE_REGISTRY) {
    if (entry.productionEligible && entry.licenseStatus !== "APPROVED") {
      failures.push(`Production-eligible source ${entry.sourceKey} is not APPROVED.`);
    }
    if (entry.licenseStatus === "REJECTED" && entry.productionEligible) {
      failures.push(`Rejected source ${entry.sourceKey} cannot be production eligible.`);
    }
  }

  return failures;
}

async function validateDatabase(prisma: PrismaClient) {
  const failures: string[] = [];

  const approvedSources = await prisma.foodDataSource.findMany({
    where: { status: "APPROVED", devOnly: false },
  });

  for (const source of approvedSources) {
    const gate = evaluateSourceCompliance(source);
    if (!gate.eligible) {
      failures.push(`Approved source ${source.sourceKey} fails compliance gate: ${gate.failures.join(" ")}`);
    }
  }

  const productionFoods = await prisma.food.findMany({
    where: {
      devOnly: false,
      active: true,
      foodDataSource: { status: "APPROVED", devOnly: false },
    },
    select: {
      id: true,
      externalId: true,
      source: true,
      sourceVersion: true,
      name: true,
      processingState: true,
      nutrients: {
        select: {
          amount: true,
          source: true,
          sourceVersion: true,
          nutrient: { select: { code: true } },
        },
      },
    },
  });

  for (const food of productionFoods) {
    if (!food.sourceVersion.trim()) {
      failures.push(`Food ${food.id} missing sourceVersion.`);
    }
    for (const row of food.nutrients) {
      if (row.amount < 0) {
        failures.push(`Negative nutrient amount on food ${food.id} nutrient ${row.nutrient.code}.`);
      }
      if (!row.source || !row.sourceVersion) {
        failures.push(`Missing nutrient provenance on food ${food.id} nutrient ${row.nutrient.code}.`);
      }
    }
  }

  const duplicateGroups = detectCanonicalDuplicateGroups(productionFoods, (food) => ({
    normalizedName: food.name,
    preparationState: food.processingState,
  }));

  if (duplicateGroups.length > 0) {
    failures.push(
      `Detected ${duplicateGroups.length} canonical duplicate groups across approved production foods.`,
    );
  }

  return failures;
}

async function main() {
  const contentFailures = validateContentFiles();
  const prisma = createClient();

  try {
    const dbFailures = await validateDatabase(prisma);
    const failures = [...contentFailures, ...dbFailures];

    if (failures.length > 0) {
      console.error("Food data foundation validation failed:");
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log("Food data foundation validation passed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "unknown");
  process.exitCode = 1;
});
