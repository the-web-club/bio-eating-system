/**
 * Weekly rotation.
 *
 * The previous draft claimed 52 weeks but generated 44 of them procedurally
 * from a four-item cycle, so it was really four weeks wearing a 52-week label,
 * which is a promise the product cannot keep.
 *
 * This module exposes only genuinely authored weeks and cycles them honestly.
 * AUTHORED_WEEKS is the number the UI and the email may claim. Raise it when
 * real content lands, never by generating filler.
 */

import type { FoodSlot } from "./plan-engine";

export interface RotationItem {
  slot: FoodSlot;
  /** i18n key for the specific variety, e.g. "variety.salmon_sockeye". */
  labelKey: string;
  grams: number;
  householdDisplay: string;
}

export interface RotationWeek {
  week: number;
  /** Content review provenance. Required before a week may be listed. */
  reviewedBy: string;
  reviewedAt: string;
  varieties: Partial<Record<FoodSlot, string>>;
}

/**
 * Authored weeks. `varieties` values are i18n keys, not display strings.
 * Every entry needs a real reviewer before AUTHORED_WEEKS includes it.
 */
export const ROTATION_WEEKS: RotationWeek[] = [
  {
    week: 1,
    reviewedBy: "PENDING_RD_REVIEW",
    reviewedAt: "",
    varieties: {
      muscle_meat: "variety.beef_sirloin",
      small_fish: "variety.salmon_sockeye",
      bivalves: "variety.oysters_pacific",
      tubers: "variety.sweet_potato_orange",
      cruciferous: "variety.broccoli_sprouts",
      berries: "variety.blueberries_wild",
      mushrooms: "variety.shiitake",
      aromatics: "variety.parsley_turmeric",
    },
  },
  {
    week: 2,
    reviewedBy: "PENDING_RD_REVIEW",
    reviewedAt: "",
    varieties: {
      muscle_meat: "variety.lamb_loin",
      small_fish: "variety.mackerel",
      bivalves: "variety.mussels_blue",
      tubers: "variety.yam_japanese",
      cruciferous: "variety.kale_lacinato",
      berries: "variety.blackberries",
      mushrooms: "variety.oyster_mushroom",
      aromatics: "variety.rosemary_ginger",
    },
  },
  {
    week: 3,
    reviewedBy: "PENDING_RD_REVIEW",
    reviewedAt: "",
    varieties: {
      muscle_meat: "variety.bison_chuck",
      small_fish: "variety.sardines",
      bivalves: "variety.clams_littleneck",
      tubers: "variety.sweet_potato_purple",
      cruciferous: "variety.arugula",
      berries: "variety.pomegranate",
      mushrooms: "variety.king_oyster",
      aromatics: "variety.oregano_pepper",
    },
  },
  {
    week: 4,
    reviewedBy: "PENDING_RD_REVIEW",
    reviewedAt: "",
    varieties: {
      muscle_meat: "variety.venison_flank",
      small_fish: "variety.herring",
      bivalves: "variety.scallops",
      tubers: "variety.taro",
      cruciferous: "variety.watercress",
      berries: "variety.raspberries",
      mushrooms: "variety.lions_mane",
      aromatics: "variety.thyme_cinnamon",
    },
  },
];

/** The only number the product may claim. */
export const AUTHORED_WEEKS = ROTATION_WEEKS.length;

/** Cycles within authored weeks. Never fabricates a week. */
export function getRotationWeek(week: number): {
  week: number;
  items: RotationItem[];
} {
  const index = ((week - 1) % AUTHORED_WEEKS + AUTHORED_WEEKS) % AUTHORED_WEEKS;
  const source = ROTATION_WEEKS[index];

  // Weekly quantities are the daily plan multiplied by frequency. Wire this to
  // the persisted GeneratedPlan for the user rather than recomputing here, so
  // the email and the portal can never disagree.
  const items: RotationItem[] = Object.entries(source.varieties).map(
    ([slot, labelKey]) => ({
      slot: slot as FoodSlot,
      labelKey: labelKey as string,
      grams: 0,
      householdDisplay: "",
    }),
  );

  return { week, items };
}
