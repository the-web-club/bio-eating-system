/**
 * Plan engine.
 *
 * Pure and deterministic. Same input, same output, no clock, no randomness,
 * no I/O. This is what makes it unit-testable and auditable.
 *
 * It emits content KEYS, never prose. All user-facing science, preparation
 * and rationale text is looked up from the reviewed content catalogue.
 * See rules.md §4.3 and §4.5.
 */

import {
  screen,
  deficitPermitted,
  type ScreeningFlag,
  type ScreeningResult,
} from "./screening";

export const ENGINE_VERSION = "engine-0.1.0";

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

export const FOOD_SLOTS = [
  "eggs",
  "organ_meat",
  "small_fish",
  "bivalves",
  "muscle_meat",
  "tubers",
  "cruciferous",
  "berries",
  "olive_oil",
  "fermented",
  "kiwi",
  "mushrooms",
  "aromatics",
] as const;

export type FoodSlot = (typeof FOOD_SLOTS)[number];

/** Baseline grams per day at the reference energy level below. */
const REFERENCE_ENERGY_KCAL = 1800;

/**
 * Which slots scale with energy and which are fixed. Micronutrient slots are
 * deliberately fixed, so a smaller plan does not thin them out.
 */
const BASELINE: Record<FoodSlot, { grams: number; scales: boolean }> = {
  eggs:        { grams: 100, scales: true },
  organ_meat:  { grams: 15,  scales: false },
  small_fish:  { grams: 60,  scales: true },
  bivalves:    { grams: 30,  scales: true },
  muscle_meat: { grams: 150, scales: true },
  tubers:      { grams: 120, scales: true },
  cruciferous: { grams: 80,  scales: false },
  berries:     { grams: 100, scales: false },
  olive_oil:   { grams: 15,  scales: true },
  fermented:   { grams: 30,  scales: false },
  kiwi:        { grams: 100, scales: false },
  mushrooms:   { grams: 60,  scales: false },
  aromatics:   { grams: 25,  scales: false },
};

// ---------------------------------------------------------------------------
// Allergens. EU 14 subset relevant to this food set.
// Exclusion is structured only. Free text is never parsed. rules.md §4.1.
// ---------------------------------------------------------------------------

export const ALLERGENS = [
  "egg",
  "fish",
  "crustaceans",
  "molluscs",
  "milk",
  "soy",
  "gluten",
  "tree_nuts",
  "peanuts",
  "sesame",
  "celery",
  "mustard",
  "sulphites",
  "lupin",
] as const;

export type Allergen = (typeof ALLERGENS)[number];

/** A declared allergen removes every slot it maps to. No exceptions. */
const ALLERGEN_TO_SLOTS: Partial<Record<Allergen, FoodSlot[]>> = {
  egg: ["eggs"],
  fish: ["small_fish"],
  crustaceans: ["bivalves"],
  molluscs: ["bivalves"],
  sulphites: ["fermented"],
};

/**
 * Preferred substitute per slot, used only for voluntary swaps. A swap never
 * routes into a slot the person has excluded or is allergic to.
 */
const SWAP_TARGET: Partial<Record<FoodSlot, FoodSlot>> = {
  eggs: "muscle_meat",
  organ_meat: "bivalves",
  small_fish: "muscle_meat",
  bivalves: "muscle_meat",
  muscle_meat: "eggs",
  tubers: "berries",
};

/** Fraction of the swapped slot's grams that carries over. */
const SWAP_CARRYOVER = 0.8;

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

export type UnitSystem = "METRIC" | "HOUSEHOLD";

interface HouseholdUnit {
  /** grams -> household count */
  factor: number;
  /** i18n key for the unit label. Never a literal string. */
  labelKey: string;
}

const HOUSEHOLD_UNITS: Record<FoodSlot, HouseholdUnit> = {
  eggs:        { factor: 1 / 50,  labelKey: "unit.eggs" },
  organ_meat:  { factor: 1 / 25,  labelKey: "unit.bites" },
  small_fish:  { factor: 1 / 100, labelKey: "unit.tins" },
  bivalves:    { factor: 1 / 20,  labelKey: "unit.pieces" },
  muscle_meat: { factor: 1 / 150, labelKey: "unit.portions" },
  tubers:      { factor: 1 / 150, labelKey: "unit.pieces" },
  cruciferous: { factor: 1 / 70,  labelKey: "unit.cups" },
  berries:     { factor: 1 / 150, labelKey: "unit.cups" },
  olive_oil:   { factor: 1 / 14,  labelKey: "unit.tablespoons" },
  fermented:   { factor: 1 / 14,  labelKey: "unit.tablespoons" },
  kiwi:        { factor: 1 / 75,  labelKey: "unit.pieces" },
  mushrooms:   { factor: 1 / 70,  labelKey: "unit.cups" },
  aromatics:   { factor: 1 / 20,  labelKey: "unit.tablespoons" },
};

// ---------------------------------------------------------------------------
// Input and output
// ---------------------------------------------------------------------------

export interface PlanInput {
  age: number;
  heightCm: number;
  weightKg: number;
  /** Biological sex is required for the Mifflin-St Jeor constant. */
  sex: "female" | "male";
  activityFactor: number;
  goal: "REDUCE" | "MAINTAIN" | "INCREASE";
  unitSystem: UnitSystem;
  declaredAllergens: Allergen[];
  excludedSlots: FoodSlot[];
  swapRequests: FoodSlot[];
  screeningFlags: ScreeningFlag[];
}

export interface PlanSlot {
  slot: FoodSlot;
  grams: number;
  /** Pre-formatted display value, or null when the unit system is metric. */
  householdCount: number | null;
  householdLabelKey: string | null;
  /** Content catalogue keys. The renderer resolves these. */
  nameKey: string;
  guidanceKey: string;
  /** Set when this slot absorbed grams from a voluntary swap. */
  absorbedFrom: FoodSlot[];
}

export interface PlanResult {
  engineVersion: string;
  screening: ScreeningResult;
  maintenanceKcal: number;
  energyKcal: number;
  slots: PlanSlot[];
  /** Slots removed, with a reason code. Surfaced to the person. */
  removed: { slot: FoodSlot; reasonCode: string }[];
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/** Mifflin-St Jeor. */
function restingEnergy(input: PlanInput): number {
  const base =
    10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "female" ? base - 161 : base + 5;
}

export function generatePlan(input: PlanInput): PlanResult {
  const screening = screen({
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    goal: input.goal,
    flags: input.screeningFlags,
  });

  const maintenanceKcal = Math.round(
    restingEnergy(input) * input.activityFactor,
  );

  if (screening.outcome === "refused") {
    return {
      engineVersion: ENGINE_VERSION,
      screening,
      maintenanceKcal,
      energyKcal: 0,
      slots: [],
      removed: [],
    };
  }

  // --- Energy target, gated ------------------------------------------------
  let energyKcal = maintenanceKcal;

  if (input.goal === "REDUCE" && deficitPermitted(screening)) {
    const deficit = maintenanceKcal * screening.maxDeficitFraction;
    energyKcal = Math.max(
      maintenanceKcal - deficit,
      screening.energyFloorKcal,
    );
  } else if (input.goal === "INCREASE") {
    energyKcal = maintenanceKcal * 1.1;
  }
  energyKcal = Math.round(energyKcal);

  const scalar = energyKcal / REFERENCE_ENERGY_KCAL;

  // --- Pass 1: hard exclusions --------------------------------------------
  const removed: { slot: FoodSlot; reasonCode: string }[] = [];
  const blocked = new Set<FoodSlot>();

  for (const allergen of input.declaredAllergens) {
    for (const slot of ALLERGEN_TO_SLOTS[allergen] ?? []) {
      if (!blocked.has(slot)) {
        blocked.add(slot);
        removed.push({ slot, reasonCode: `allergen:${allergen}` });
      }
    }
  }
  for (const slot of input.excludedSlots) {
    if (!blocked.has(slot)) {
      blocked.add(slot);
      removed.push({ slot, reasonCode: "excluded_by_user" });
    }
  }

  const available = FOOD_SLOTS.filter((s) => !blocked.has(s));

  // --- Pass 2: resolve swaps against a settled slot set -------------------
  // Order independence matters here. The previous implementation reallocated
  // into a slot that had already been rendered, so the grams disappeared.
  // Swaps are resolved into a grams ledger first, then rendered.
  const grams = new Map<FoodSlot, number>();
  for (const slot of available) {
    const base = BASELINE[slot];
    grams.set(slot, base.scales ? base.grams * scalar : base.grams);
  }

  const swapped = new Set<FoodSlot>();
  const absorbed = new Map<FoodSlot, FoodSlot[]>();

  for (const slot of input.swapRequests) {
    if (!grams.has(slot) || swapped.has(slot)) continue;

    const target = SWAP_TARGET[slot];
    // A swap must land somewhere safe, or it is not a swap.
    if (!target || blocked.has(target) || swapped.has(target)) continue;

    const carried = (grams.get(slot) ?? 0) * SWAP_CARRYOVER;
    grams.set(target, (grams.get(target) ?? 0) + carried);
    grams.delete(slot);
    swapped.add(slot);
    absorbed.set(target, [...(absorbed.get(target) ?? []), slot]);
    removed.push({ slot, reasonCode: "swapped_by_user" });
  }

  // --- Render --------------------------------------------------------------
  const slots: PlanSlot[] = FOOD_SLOTS.filter((s) => grams.has(s)).map(
    (slot) => {
      const g = Math.round(grams.get(slot) as number);
      const unit = HOUSEHOLD_UNITS[slot];
      const useHousehold = input.unitSystem === "HOUSEHOLD";
      const count = useHousehold
        ? Math.round(g * unit.factor * 10) / 10
        : null;

      return {
        slot,
        grams: g,
        householdCount: count,
        householdLabelKey: useHousehold ? unit.labelKey : null,
        nameKey: `slot.${slot}.name`,
        guidanceKey: `slot.${slot}.guidance`,
        absorbedFrom: absorbed.get(slot) ?? [],
      };
    },
  );

  return {
    engineVersion: ENGINE_VERSION,
    screening,
    maintenanceKcal,
    energyKcal,
    slots,
    removed,
  };
}

/**
 * Invariant check for tests and for a defensive assertion before persisting.
 * A declared allergen must never survive into the rendered plan.
 */
export function assertNoAllergenLeak(
  input: PlanInput,
  result: PlanResult,
): void {
  const forbidden = new Set<FoodSlot>();
  for (const a of input.declaredAllergens) {
    for (const s of ALLERGEN_TO_SLOTS[a] ?? []) forbidden.add(s);
  }
  for (const s of input.excludedSlots) forbidden.add(s);

  const leaked = result.slots.filter((s) => forbidden.has(s.slot));
  if (leaked.length > 0) {
    // Deliberately does not include profile values, only slot names.
    throw new Error(
      `Plan engine invariant violated: excluded slots present: ${leaked
        .map((s) => s.slot)
        .join(", ")}`,
    );
  }
}
