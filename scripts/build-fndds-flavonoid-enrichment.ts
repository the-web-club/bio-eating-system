#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  FNDDS_FLAVONOID_SOURCE_VERSION,
  mapFnddsFlavonoidNutrientCode,
} from "../src/lib/nutrition-data/sources/usda/flavonoid-nutrients";

type FoundationFood = {
  fdcId: number;
  ndbNumber?: number | null;
};

function usage(): never {
  console.error(`Usage: pnpm build:fndds-flavonoids <flav-dat-path>

Builds content/imports/usda-fndds-flavonoids/foundation-flavonoid-enrichment-v1.json
from a USDA FDB-EXP FLAV_DAT fixed-width export or tab-delimited FNDDS flavonoid values file.

Expected FDB-EXP FLAV_DAT columns (fixed width):
  NDB No (5), Nutr_No (3), Flav_Val (numeric)

Tab-delimited FNDDS rows are also accepted when they contain:
  ndbNumber(or food code), nutrientCode, amount
`);
  process.exit(1);
}

function parseFixedWidthFlavDat(raw: string) {
  const rows: Array<{ ndbNumber: number; nutrientCode: number; amount: number }> = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.length < 10) continue;

    const ndbRaw = trimmed.slice(0, 5).trim();
    const nutrientRaw = trimmed.slice(5, 8).trim();
    const amountRaw = trimmed.slice(8).trim().split(/\s+/)[0];
    const ndbNumber = Number(ndbRaw);
    const nutrientCode = Number(nutrientRaw);
    const amount = Number(amountRaw);
    if (!Number.isFinite(ndbNumber) || !Number.isFinite(nutrientCode) || !Number.isFinite(amount)) {
      continue;
    }
    rows.push({ ndbNumber, nutrientCode, amount });
  }
  return rows;
}

function parseDelimitedFlavDat(raw: string) {
  const rows: Array<{ ndbNumber: number; nutrientCode: number; amount: number }> = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\t|,|;/);
    if (parts.length < 3) continue;
    const ndbNumber = Number(parts[0]);
    const nutrientCode = Number(parts[1]);
    const amount = Number(parts[2]);
    if (!Number.isFinite(ndbNumber) || !Number.isFinite(nutrientCode) || !Number.isFinite(amount)) {
      continue;
    }
    rows.push({ ndbNumber, nutrientCode, amount });
  }
  return rows;
}

function loadFoundationNdbIndex(foundationPath: string) {
  const parsed = JSON.parse(readFileSync(foundationPath, "utf8")) as {
    FoundationFoods?: FoundationFood[];
  };
  const byNdb = new Map<number, number[]>();
  for (const food of parsed.FoundationFoods ?? []) {
    if (!food?.fdcId || !food.ndbNumber) continue;
    const list = byNdb.get(food.ndbNumber) ?? [];
    list.push(food.fdcId);
    byNdb.set(food.ndbNumber, list);
  }
  return byNdb;
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) usage();

  const absoluteInput = path.resolve(inputPath);
  const raw = readFileSync(absoluteInput, "utf8");
  const parsedRows =
    raw.includes("\t") || raw.includes(",") || raw.includes(";")
      ? parseDelimitedFlavDat(raw)
      : parseFixedWidthFlavDat(raw);

  if (parsedRows.length === 0) {
    throw new Error(`No flavonoid rows parsed from ${absoluteInput}`);
  }

  const foundationPath = path.join(
    process.cwd(),
    "content/imports/usda-foundation-release/FoodData_Central_foundation_food_json_2026-04-30.json",
  );
  const ndbIndex = loadFoundationNdbIndex(foundationPath);

  const records: Record<string, Record<string, number>> = {};
  let matchedRows = 0;

  for (const row of parsedRows) {
    const mapped = mapFnddsFlavonoidNutrientCode(row.nutrientCode, row.amount);
    if (!mapped || mapped.amount <= 0) continue;

    const fdcIds = ndbIndex.get(row.ndbNumber);
    if (!fdcIds?.length) continue;

    for (const fdcId of fdcIds) {
      const key = String(fdcId);
      records[key] ??= {};
      records[key][mapped.code] = mapped.amount;
      matchedRows += 1;
    }
  }

  const output = {
    version: "foundation-flavonoid-enrichment-v1" as const,
    source: "usda-fndds-flavonoid" as const,
    sourceVersion: FNDDS_FLAVONOID_SOURCE_VERSION,
    reviewStatus: "REVIEW_REQUIRED" as const,
    notes:
      "Generated from USDA flavonoid export. Set reviewStatus to APPROVED only after legal audit of the FNDDS flavonoid release used as input.",
    records,
  };

  const outputPath = path.join(
    process.cwd(),
    "content/imports/usda-fndds-flavonoids/foundation-flavonoid-enrichment-v1.json",
  );
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `Wrote ${Object.keys(records).length} foods with flavonoid rows (${matchedRows} mapped nutrient rows) to ${outputPath}`,
  );
}

main();
