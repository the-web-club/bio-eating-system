import { redirect } from "next/navigation";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageSections, PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import {
  ShopView,
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
import { formatVarietyKey } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { WeeklyUpgradeClient } from "./weekly-upgrade-client";

export default async function ShopPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    return (
      <PageShell width="reading">
        <PageHeader title="Shop" />
        <div className="mt-group">
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
        </div>
      </PageShell>
    );
  }

  if (!data.entitlements.weeklyRotation) {
    return (
      <PageShell width="reading">
        <PageSections>
          <PageHeader title="Shop" description="What do I buy?" />
          <PortalEmptyState title="Weekly system not on your account" action={<WeeklyUpgradeClient />}>
            With your weekly system you get a grocery list matched to your plan.
          </PortalEmptyState>
        </PageSections>
      </PageShell>
    );
  }

  if (!data.plan) {
    redirect("/portal/intake");
  }

  const estimatedCost = estimateWeeklyCostEur(data.plan.slots);
  const budget = data.profile?.weeklyBudgetEur ?? null;
  const overBudget = budget != null && estimatedCost > budget;

  const items = data.rotationItems.map((item) => {
    const name =
      resolveContent(item.labelKey) ??
      formatVarietyKey(item.labelKey) ??
      SLOT_LABELS[item.slot];
    const amount =
      item.grams > 0
        ? item.householdDisplay || `${item.grams} g`
        : item.householdDisplay || "—";
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
    <ShopView
      basePath="/portal"
      items={items}
      estimatedCostEur={estimatedCost}
      budgetEur={budget}
      overBudget={overBudget}
    />
  );
}
