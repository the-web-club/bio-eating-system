import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";
import { Section } from "../layout";
import { PageSections, PageShell } from "../layout";
import { PageHeader } from "../page-header";
import { WeeklyShopList, type ShopItem } from "../weekly-shop-list";
import { estimateCookingHours, estimateWeeklyCostEur } from "@/lib/nutrition/budget";

export type ShopViewProps = {
  items: ShopItem[];
  estimatedCostEur: number;
  budgetEur: number | null;
  overBudget: boolean;
  basePath: string;
};

export function ShopViewContent({
  items,
  overBudget,
  budgetEur,
}: ShopViewProps) {
  return (
    <>
      {overBudget && budgetEur != null ? (
        <Status role="neutral">
          Your current plan exceeds your €{budgetEur} weekly budget. Swap lower-cost
          items using Replace on each line.
        </Status>
      ) : null}

      <Section title="Already have">
        <p className="mb-s2 text-meta text-muted">
          Tick items you already have at home.
        </p>
        <WeeklyShopList items={items} />
      </Section>
    </>
  );
}

export function ShopView({
  items,
  estimatedCostEur,
  budgetEur,
  overBudget,
  basePath,
}: ShopViewProps) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Shop"
          description="What do I buy?"
          meta={
            <p className="text-meta text-muted">
              Estimated weekly cost: €{estimatedCostEur}
              {budgetEur != null ? ` · Budget: €${budgetEur}` : ""}
            </p>
          }
          actions={
            <ActionLink href={`${basePath}/plan`} variant="quiet" size="compact">
              View daily plan
            </ActionLink>
          }
        />
        <ShopViewContent
          items={items}
          estimatedCostEur={estimatedCostEur}
          budgetEur={budgetEur}
          overBudget={overBudget}
          basePath={basePath}
        />
      </PageSections>
    </PageShell>
  );
}

export { estimateWeeklyCostEur, estimateCookingHours };
