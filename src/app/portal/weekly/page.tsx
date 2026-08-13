import { redirect } from "next/navigation";
import { Eyebrow, Split } from "@/components/portal/layout";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import {
  ShopViewContent,
  estimateWeeklyCostEur,
} from "@/components/portal/views/shop-view";
import { ActionLink } from "@/components/ui/action-link";
import { SLOT_LABELS } from "@/lib/content/labels";
import { resolveContent } from "@/lib/content/resolve";
import {
  GROCERY_CATEGORY_LABELS,
  SLOT_GROCERY_CATEGORY,
  humanShoppingLine,
} from "@/lib/nutrition/grocery-categories";
import { formatVarietyKey, rotationPosition } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";
import { WeeklyUpgradeClient } from "./weekly-upgrade-client";

async function ShopPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <PortalErrorState
        title="Your shopping list did not load"
        action={
          <ActionLink href="/portal/weekly" variant="secondary" size="compact">
            Try again
          </ActionLink>
        }
      >
        Check your connection, then try again.
      </PortalErrorState>
    );
  }

  if (!data.entitlements.weeklyRotation) {
    return (
      <PortalEmptyState
        tone="locked"
        title="Weekly list not on your account"
        action={<WeeklyUpgradeClient />}
      >
        With your weekly list you get a grocery list matched to your plan.
      </PortalEmptyState>
    );
  }

  if (!data.plan) {
    redirect("/portal/intake");
  }

  const estimatedCost = estimateWeeklyCostEur(data.plan.slots);
  const budget = data.profile?.weeklyBudgetEur ?? null;
  const overBudget = budget != null && estimatedCost > budget;
  const position = rotationPosition(data.week, data.authoredWeeks);
  const authoredWeeks = data.authoredWeeks;

  const items = data.rotationItems.map((item) => {
    const name =
      resolveContent(item.labelKey) ??
      formatVarietyKey(item.labelKey) ??
      SLOT_LABELS[item.slot];
    const amount =
      item.grams > 0
        ? item.householdDisplay || `${item.grams} g`
        : item.householdDisplay || "-";
    const cat = SLOT_GROCERY_CATEGORY[item.slot];
    return {
      id: item.slot,
      slot: item.slot,
      name,
      line: humanShoppingLine(name, amount),
      category: GROCERY_CATEGORY_LABELS[cat],
    };
  });

  return (
    <Split
      main={
        <ShopViewContent
          basePath="/portal"
          items={items}
          estimatedCostEur={estimatedCost}
          budgetEur={budget}
          overBudget={overBudget}
        />
      }
      aside={
        <>
          <div>
            <Eyebrow>Estimated cost</Eyebrow>
            <p className="mt-s2 text-body text-foreground">
              €{estimatedCost}
              {budget != null ? (
                <span className="text-muted">
                  <span className="text-faint"> · </span>
                  Budget €{budget}
                </span>
              ) : null}
            </p>
          </div>
          <div>
            <Eyebrow>Rotation</Eyebrow>
            <p className="mt-s2 text-body text-soft">
              You are on week {position} of {authoredWeeks} reviewed weeks.
            </p>
          </div>
          <ActionLink href="/portal/plan" variant="quiet" size="compact">
            View daily plan
          </ActionLink>
        </>
      }
    />
  );
}

export default function ShopPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.weekly}>
      <ShopPageContent />
    </PortalPageWithSuspense>
  );
}
