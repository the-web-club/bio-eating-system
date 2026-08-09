import type { BiomarkerEntry } from "@/components/portal/views/biomarkers-view";
import type { PlanViewGroup } from "@/components/portal/views/plan-view";
import type { TodayFocusItem } from "@/components/portal/views/today-view";
import type { WeeklyViewItem } from "@/components/portal/views/weekly-view";
import type { PortalEntitlements } from "@/lib/portal/load-portal-data";

/**
 * Fixture data for the internal preview route. It exists so the real views can
 * be reviewed at every breakpoint without a live account. Never rendered in the
 * customer portal.
 */

export const FIXTURE_WEEK = 3;
export const FIXTURE_AUTHORED_WEEKS = 4;

export const FIXTURE_ENTITLEMENTS: PortalEntitlements = {
  corePlan: true,
  weeklyRotation: true,
  labReference: false,
  coaching: false,
};

export const FIXTURE_TODAY: TodayFocusItem[] = [
  { id: "eggs", name: "Eggs", amount: "2", unit: "pieces" },
  {
    id: "muscle_meat",
    name: "Muscle meat",
    amount: "140",
    unit: "g",
    note: "Personal substitution applied",
  },
  { id: "berries", name: "Berries", amount: "1", unit: "cup" },
  { id: "olive_oil", name: "Olive oil", amount: "1", unit: "tbsp" },
];

export const FIXTURE_PLAN_GROUPS: PlanViewGroup[] = [
  {
    title: "Protein",
    items: [
      {
        id: "eggs",
        name: "Eggs",
        amount: "2",
        unit: "pieces",
        why: "Reviewed guidance for this portion appears here once the catalogue entry is published.",
      },
      {
        id: "muscle_meat",
        name: "Muscle meat",
        amount: "140",
        unit: "g",
        note: "Personal substitution applied",
        why: null,
      },
    ],
  },
  {
    title: "Plants and fibre",
    items: [
      {
        id: "berries",
        name: "Berries",
        amount: "1",
        unit: "cup",
        why: "Reviewed guidance for this portion appears here once the catalogue entry is published.",
      },
      {
        id: "cruciferous",
        name: "Cruciferous vegetables",
        amount: "80",
        unit: "g",
        why: null,
      },
    ],
  },
  {
    title: "Fats",
    items: [
      { id: "olive_oil", name: "Olive oil", amount: "1", unit: "tbsp", why: null },
    ],
  },
];

export const FIXTURE_WEEKLY: WeeklyViewItem[] = [
  { id: "muscle_meat", name: "Beef sirloin", note: "Muscle meat", value: "980", unit: "g" },
  { id: "small_fish", name: "Sockeye salmon", note: "Small fish", value: "420", unit: "g" },
  { id: "tubers", name: "Sweet potato", note: "Tubers", value: "840", unit: "g" },
  {
    id: "cruciferous",
    name: "Broccoli sprouts",
    note: "Cruciferous",
    value: "560",
    unit: "g",
  },
  { id: "berries", name: "Blueberries", note: "Berries", value: "700", unit: "g" },
  { id: "olive_oil", name: "Olive oil", note: "Fats", value: "—" },
];

export const FIXTURE_MARKERS: BiomarkerEntry[] = [
  {
    id: "ferritin",
    name: "Ferritin",
    reference: "15–150 µg/L",
    why: "Describes how much iron the body has in storage.",
    rationale:
      "Reviewed rationale appears here once the catalogue entry is published. Reference context is not a personal target.",
  },
  {
    id: "vitamin_d",
    name: "Vitamin D",
    reference: "50–125 nmol/L",
    why: "Used as context for bone and muscle function.",
    rationale:
      "Reviewed rationale appears here once the catalogue entry is published. Reference context is not a personal target.",
  },
  {
    id: "b12",
    name: "Vitamin B12",
    reference: null,
    why: null,
    rationale: null,
  },
];

export const FIXTURE_VARIETIES = [
  "Sockeye salmon",
  "Broccoli sprouts",
  "Blueberries",
  "Shiitake mushrooms",
];
