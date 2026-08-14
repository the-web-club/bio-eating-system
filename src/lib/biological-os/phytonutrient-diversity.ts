import { readFileSync } from "node:fs";
import path from "node:path";
import {
  phytonutrientCatalogSchema,
  type PhytonutrientCatalogContract,
} from "@/lib/biological-os/contracts";
import { PHYTONUTRIENT_CATALOG_VERSION } from "@/lib/biological-os/constants";
import { phytonutrientPolicy } from "@/lib/biological-os/phytonutrient-policy";
import type { EngineFoodCandidate, FoodMatrixDraft } from "@/lib/biological-os/types";
import { nutrientAmountForPortion } from "@/lib/nutrition/contribution";
import type { NutrientContributionRow } from "@/lib/nutrition-data/types";

let cachedCatalog: PhytonutrientCatalogContract | null = null;

export function loadPhytonutrientCatalog(): PhytonutrientCatalogContract {
  if (cachedCatalog) return cachedCatalog;

  const filePath = path.join(
    process.cwd(),
    "content/phytonutrients/phytonutrient-catalog-v2.json",
  );
  const parsed = phytonutrientCatalogSchema.parse(JSON.parse(readFileSync(filePath, "utf8")));
  if (parsed.version !== PHYTONUTRIENT_CATALOG_VERSION) {
    throw new Error(
      `Phytonutrient catalog version mismatch: expected ${PHYTONUTRIENT_CATALOG_VERSION}, got ${parsed.version}`,
    );
  }
  cachedCatalog = parsed;
  return parsed;
}

export function resetPhytonutrientCatalogCacheForTests() {
  cachedCatalog = null;
}

export type PhytonutrientDiversityResult = {
  catalogVersion: typeof PHYTONUTRIENT_CATALOG_VERSION;
  trackedCompoundIds: string[];
  presentCompoundIds: string[];
  presentClasses: string[];
  classCount: number;
  compoundCount: number;
  score: number;
};

function compoundAmountForPortion(
  nutrients: NutrientContributionRow[],
  nutrientCode: string,
  portionGrams: number,
): number | null {
  const row = nutrients.find((nutrient) => nutrient.nutrientCode === nutrientCode);
  if (!row) return null;
  const amount = nutrientAmountForPortion(row, portionGrams);
  return amount > 0 ? amount : null;
}

export function scorePhytonutrientDiversity(args: {
  draft: FoodMatrixDraft;
  candidatesById: Map<string, EngineFoodCandidate>;
  portionGrams: number;
}): PhytonutrientDiversityResult {
  const catalog = loadPhytonutrientCatalog();
  const presentCompoundIds = new Set<string>();
  const presentClasses = new Set<string>();

  for (const item of args.draft.items) {
    const candidate = args.candidatesById.get(item.foodId);
    if (!candidate) continue;

    for (const compound of catalog.compounds) {
      const nutrientCode = compound.nutrientCode ?? compound.compoundId;
      const amount = compoundAmountForPortion(
        candidate.nutrients,
        nutrientCode,
        item.portionGrams,
      );
      if (amount === null) continue;
      presentCompoundIds.add(compound.compoundId);
      presentClasses.add(compound.class);
    }
  }

  const trackedCompoundIds = catalog.compounds.map((row) => row.compoundId);
  const classCount = presentClasses.size;
  const compoundCount = presentCompoundIds.size;
  const score =
    classCount * phytonutrientPolicy.classWeight +
    compoundCount * phytonutrientPolicy.compoundWeight;

  return {
    catalogVersion: PHYTONUTRIENT_CATALOG_VERSION,
    trackedCompoundIds,
    presentCompoundIds: [...presentCompoundIds].sort(),
    presentClasses: [...presentClasses].sort(),
    classCount,
    compoundCount,
    score,
  };
}

export function phytonutrientBoostForCandidate(args: {
  candidate: EngineFoodCandidate;
  presentClasses: Set<string>;
  portionGrams: number;
}): number {
  const catalog = loadPhytonutrientCatalog();
  let boost = 0;

  for (const compound of catalog.compounds) {
    const nutrientCode = compound.nutrientCode ?? compound.compoundId;
    const amount = compoundAmountForPortion(
      args.candidate.nutrients,
      nutrientCode,
      args.portionGrams,
    );
    if (amount === null) continue;
    if (!args.presentClasses.has(compound.class)) {
      boost += phytonutrientPolicy.newPhytoClassBoost;
    }
    boost += phytonutrientPolicy.presentCompoundBoost;
  }

  return boost;
}
