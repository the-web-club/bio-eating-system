import type { BiomarkerEntry } from "@/components/portal/views/biomarkers-view";
import type { PlanViewGroup } from "@/components/portal/views/plan-view";
import type { WeeklyViewItem } from "@/components/portal/views/weekly-view";
import type { PortalEntitlements } from "@/lib/portal/load-portal-data";
import type { PlanSlot } from "@/lib/nutrition/plan-engine";
import { assembleMeals, todaySummary } from "@/lib/portal/meal-assembly";

export const FIXTURE_WEEK = 3;
export const FIXTURE_AUTHORED_WEEKS = 4;

export const FIXTURE_ENTITLEMENTS: PortalEntitlements = {
  corePlan: true,
  weeklyRotation: true,
  labReference: false,
  coaching: false,
};

const PENDING_COPY =
  "Reviewed guidance for this portion appears here once the catalogue entry is published.";

function previewSlot(slot: PlanSlot["slot"], grams: number): PlanSlot {
  return {
    slot,
    grams,
    householdCount: null,
    householdLabelKey: null,
    nameKey: `slot.${slot}.name`,
    guidanceKey: `slot.${slot}.guidance`,
    absorbedFrom: [],
  };
}

export const FIXTURE_PLAN_SLOTS: PlanSlot[] = [
  previewSlot("eggs", 100),
  previewSlot("organ_meat", 30),
  previewSlot("small_fish", 60),
  previewSlot("bivalves", 40),
  previewSlot("muscle_meat", 140),
  previewSlot("tubers", 180),
  previewSlot("cruciferous", 80),
  previewSlot("berries", 100),
  previewSlot("olive_oil", 15),
  previewSlot("fermented", 30),
  previewSlot("kiwi", 75),
  previewSlot("mushrooms", 70),
  previewSlot("aromatics", 10),
];

export const FIXTURE_MEALS = assembleMeals(FIXTURE_PLAN_SLOTS);
export const FIXTURE_TODAY_SUMMARY = todaySummary(FIXTURE_MEALS, {
  groceryTasks: 1,
  decisions: 0,
});

export const FIXTURE_PLAN_GROUPS: PlanViewGroup[] = [
  {
    title: "Protein",
    items: [
      {
        id: "eggs",
        name: "Eggs",
        amount: "2",
        unit: "pieces",
        why: PENDING_COPY,
        adjustment: null,
      },
      {
        id: "muscle_meat",
        name: "Muscle meat",
        amount: "140",
        unit: "g",
        why: PENDING_COPY,
        adjustment: null,
      },
    ],
  },
];

export const FIXTURE_WEEKLY: WeeklyViewItem[] = [
  { id: "eggs", name: "Free-range eggs", note: "Eggs", value: "14", unit: "pieces" },
  { id: "muscle_meat", name: "Beef sirloin", note: "Muscle meat", value: "980", unit: "g" },
  { id: "small_fish", name: "Sockeye salmon", note: "Small fish", value: "420", unit: "g" },
];

export const FIXTURE_MARKERS: BiomarkerEntry[] = [
  {
    id: "ferritin",
    name: "Ferritin",
    reference: "15-150 µg/L",
    why: "Describes how much iron the body has in storage.",
    rationale:
      "Reviewed rationale appears here once the catalogue entry is published. Reference context is not a personal target.",
  },
];
