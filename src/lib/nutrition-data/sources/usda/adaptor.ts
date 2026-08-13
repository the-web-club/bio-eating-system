import { SOURCE_KEYS } from "../../constants";
import type { FoodSourceBundle } from "../../schema";
import type { FoodSourceAdaptor } from "../types";
import { APPROVED_USDA_DATA_TYPE } from "./client";
import { mapUsdaNutrientAmount, USDA_NUTRIENT_CATALOG } from "./nutrient-map";
import { loadAllFoundationFoods, loadFoundationFoodsByIds, FOUNDATION_RELEASE_VERSION } from "./release";
import { buildFoundationSliceV2 } from "./slice-builder";
import {
  USDA_ATTRIBUTION,
  USDA_PRODUCTION_SLICE,
  USDA_SLICE_VERSION,
  USDA_SLICE_VERSION_V1,
  USDA_SLICE_VERSION_V2,
  type UsdaSliceEntry,
} from "./slice-config";

function externalIdFor(entry: UsdaSliceEntry): string {
  return `fdc-${entry.fdcId}`;
}

function assertFoundationFoodRecord(
  record: { fdcId: number; dataType?: string; description: string },
  fdcId: number,
) {
  if (record.dataType !== APPROVED_USDA_DATA_TYPE) {
    throw new Error(
      `USDA import blocked for fdcId ${fdcId}: dataType "${record.dataType ?? "unknown"}" is not ${APPROVED_USDA_DATA_TYPE}. Branded Foods, SR Legacy, Survey (FNDDS), and other types are excluded.`,
    );
  }
}

function buildFoodRecord(
  entry: UsdaSliceEntry,
  record: { fdcId: number; description: string; dataType?: string; foodNutrients?: Array<{ nutrient?: { id?: number }; amount?: number | null }> },
) {
  const nutrientMap = new Map<string, number>();

  for (const row of record.foodNutrients ?? []) {
    const nutrientId = row.nutrient?.id;
    if (nutrientId === undefined) continue;
    const mapped = mapUsdaNutrientAmount(nutrientId, row.amount);
    if (!mapped) continue;
    if (!nutrientMap.has(mapped.code)) {
      nutrientMap.set(mapped.code, mapped.amount);
    }
  }

  const nutrients = USDA_NUTRIENT_CATALOG.map((def) => ({
    code: def.code,
    amount: nutrientMap.get(def.code) ?? 0,
    perAmountG: 100,
    basisAmount: 100,
    basisUnit: "g",
  })).filter((row) => row.amount > 0 || row.code === "energy_kcal" || row.code === "protein");

  const name = entry.displayName ?? record.description;

  return {
    externalId: externalIdFor(entry),
    name,
    canonicalName: record.description,
    displayName: name,
    preparationState: entry.preparationState,
    biologicalCategory: entry.biologicalCategory,
    foodCategories: entry.foodCategories,
    allergens: entry.allergens,
    nutrients,
  };
}

async function resolveSliceEntries(version: string): Promise<UsdaSliceEntry[]> {
  if (version === USDA_SLICE_VERSION_V1) {
    return USDA_PRODUCTION_SLICE;
  }
  if (version === USDA_SLICE_VERSION_V2) {
    return buildFoundationSliceV2();
  }
  throw new Error(`Unknown USDA slice version: ${version}`);
}

async function loadFoundationRecords(version: string, entries: UsdaSliceEntry[]) {
  if (version === USDA_SLICE_VERSION_V2) {
    const records = await loadAllFoundationFoods();
    const entryIds = new Set(entries.map((entry) => entry.fdcId));
    const recordIds = new Set(records.map((record) => record.fdcId));
    if (records.length !== entries.length || [...entryIds].some((fdcId) => !recordIds.has(fdcId))) {
      throw new Error(
        `USDA Foundation Foods release ${FOUNDATION_RELEASE_VERSION} slice mismatch: expected ${entries.length} foods, release has ${records.length}.`,
      );
    }
    return records;
  }

  const fdcIds = entries.map((entry) => entry.fdcId);
  return loadFoundationFoodsByIds(fdcIds);
}

export function createUsdaAdaptor(): FoodSourceAdaptor {
  return {
    sourceKey: SOURCE_KEYS.usda,
    async listVersions() {
      return [USDA_SLICE_VERSION_V1, USDA_SLICE_VERSION_V2];
    },
    async fetch(version: string) {
      const entries = await resolveSliceEntries(version);
      const records = await loadFoundationRecords(version, entries);
      const recordById = new Map(records.map((row) => [row.fdcId, row]));

      const foods = entries.map((entry) => {
        const record = recordById.get(entry.fdcId);
        if (!record) {
          throw new Error(
            `USDA Foundation Foods release ${FOUNDATION_RELEASE_VERSION} missing fdcId ${entry.fdcId}`,
          );
        }
        assertFoundationFoodRecord(record, entry.fdcId);
        return buildFoodRecord(entry, record);
      });

      const bundle: FoodSourceBundle = {
        source: SOURCE_KEYS.usda,
        sourceVersion: version,
        devOnly: false,
        nutrients: USDA_NUTRIENT_CATALOG,
        foods,
        substitutions: [],
        requirementSet: {
          version: "production-requirements-pending",
          devOnly: true,
          reviewer: null,
          requirements: [],
        },
      };

      return bundle;
    },
  };
}

export {
  USDA_ATTRIBUTION,
  USDA_PRODUCTION_SLICE,
  USDA_SLICE_VERSION,
  USDA_SLICE_VERSION_V1,
  USDA_SLICE_VERSION_V2,
};
