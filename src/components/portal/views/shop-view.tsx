import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";
import { Eyebrow, PageSections, PageShell, Section } from "../layout";
import { PageHeader } from "../page-header";
import { WeeklyShopList, type ShopItem } from "../weekly-shop-list";
import { GOAL_LABELS } from "@/lib/content/labels";
import { estimateCookingHours, estimateWeeklyCostEur } from "@/lib/nutrition/budget";

export type WeeklyBriefingProps = {
  weekNumber: number;
  goal: string;
  estimatedCostEur: number;
  cookingHours: number;
  mealCount: number;
  budgetEur: number | null;
  overBudget: boolean;
  basePath: string;
};

export function WeeklyBriefing({
  weekNumber,
  goal,
  estimatedCostEur,
  cookingHours,
  mealCount,
  budgetEur,
  overBudget,
  basePath,
}: WeeklyBriefingProps) {
  const goalLabel = goal in GOAL_LABELS ? GOAL_LABELS[goal as keyof typeof GOAL_LABELS] : goal;

  return (
    <div className="mb-group space-y-3 rounded-card border border-hairline p-4">
      <Eyebrow>Your week is ready</Eyebrow>
      <p className="font-meta text-lead tabular text-foreground">
        Week {String(weekNumber).padStart(2, "0")}
      </p>
      <dl className="grid gap-2 text-body sm:grid-cols-2">
        <div>
          <dt className="text-small text-muted">Goal</dt>
          <dd className="text-foreground">{goalLabel}</dd>
        </div>
        <div>
          <dt className="text-small text-muted">Estimated shopping</dt>
          <dd className="text-foreground">€{estimatedCostEur}</dd>
        </div>
        <div>
          <dt className="text-small text-muted">Cooking</dt>
          <dd className="text-foreground">~{cookingHours} hours</dd>
        </div>
        <div>
          <dt className="text-small text-muted">Meals</dt>
          <dd className="text-foreground">{mealCount}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3 pt-1">
        <ActionLink href={`${basePath}/plan`} variant="secondary" size="compact">
          View plan
        </ActionLink>
        <ActionLink href={`${basePath}/weekly`} variant="quiet" size="compact">
          View shopping list
        </ActionLink>
      </div>
      {overBudget && budgetEur != null ? (
        <Status role="neutral">
          Your current plan exceeds your €{budgetEur} weekly budget.{" "}
          <ActionLink href={`${basePath}/weekly`} variant="quiet" size="compact">
            Reduce cost
          </ActionLink>
        </Status>
      ) : null}
    </div>
  );
}

export type ShopViewProps = {
  items: ShopItem[];
  estimatedCostEur: number;
  budgetEur: number | null;
  overBudget: boolean;
  basePath: string;
};

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
          title="Shopping list"
          description="What do I buy?"
          meta={
            <p className="text-meta text-muted">
              Estimated weekly cost: €{estimatedCostEur}
              {budgetEur != null ? ` · Budget: €${budgetEur}` : ""}
            </p>
          }
          actions={
            <ActionLink href={`${basePath}/plan`} variant="secondary">
              View plan
            </ActionLink>
          }
        />

        {overBudget && budgetEur != null ? (
          <Status role="neutral">
            Your current plan exceeds your €{budgetEur} weekly budget. Swap lower-cost
            items using Replace on each line.
          </Status>
        ) : null}

        <Section title="Already have">
          <p className="mb-3 text-small text-muted">
            Tick items you already have at home.
          </p>
          <WeeklyShopList items={items} />
        </Section>
      </PageSections>
    </PageShell>
  );
}

export { estimateWeeklyCostEur, estimateCookingHours };
