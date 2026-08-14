import { FOOD_SLOTS } from "@/lib/nutrition/plan-engine";

/** Offline fixture source. DEV_ONLY. Not for production nutrition claims. */
export const FIXTURE_FOOD_SOURCE = "fixture-v1" as const;

/** Requirement set version bundled with the fixture import. DEV_ONLY. */
export const FIXTURE_REQUIREMENT_SET_VERSION = "fixture-v1" as const;

export const SOURCE_KEYS = {
  fixture: FIXTURE_FOOD_SOURCE,
  usda: "usda-fdc",
  fineli: "fineli",
  eurofir: "eurofir-foodexplorer",
  nnr2023: "nnr2023",
  efsaDrv: "efsa-drv",
  foodhub: "phytohub",
  foodb: "foodb",
  afcd: "afcd",
  cnf: "cnf",
  ciqual: "ciqual",
} as const;

export const BIOLOGICAL_CATEGORY_LABELS: Record<(typeof FOOD_SLOTS)[number], string> = {
  eggs: "Whole eggs",
  organ_meat: "Ruminant organ meats",
  small_fish: "Small fatty fish",
  bivalves: "Bivalves and shellfish",
  muscle_meat: "Quality muscle meats",
  tubers: "Tubers",
  cruciferous: "Cruciferous vegetables",
  berries: "Deeply pigmented berries",
  olive_oil: "Extra virgin olive oil and seeds",
  fermented: "Fermented cultured foods",
  kiwi: "Kiwifruit",
  mushrooms: "Mushrooms and tomato-based foods",
  aromatics: "Functional herbs, spices and alliums",
};
