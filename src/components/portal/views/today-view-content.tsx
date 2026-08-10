import { Eyebrow, Section } from "../layout";
import { MealListWithReplace } from "../meal-list-with-replace";
import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";
import type { AssembledMeal, TodaySummary } from "@/lib/portal/meal-assembly";

export type TodayViewProps = {
  firstName: string;
  meals: AssembledMeal[];
  summary: TodaySummary;
  notices: string[];
  maintenanceOnly: boolean;
  weeklyAvailable: boolean;
  basePath: string;
  showRecalibration?: boolean;
  showCheckIn?: boolean;
};

/** Dynamic Today body. The page frame supplies the stable title and description. */
export function TodayViewContent({
  firstName,
  meals,
  summary,
  notices,
  maintenanceOnly,
  weeklyAvailable,
  basePath,
  showRecalibration,
  showCheckIn,
}: TodayViewProps) {
  return (
    <>
      <p className="text-lead text-foreground">Good morning, {firstName}</p>

      {showRecalibration ? (
        <Status role="neutral">
          Time to recalibrate. Your circumstances may have changed.{" "}
          <ActionLink href={`${basePath}/recalibrate`} variant="quiet" size="compact">
            Update my plan
          </ActionLink>
        </Status>
      ) : null}

      {showCheckIn ? (
        <Status role="neutral">
          How did this week feel?{" "}
          <ActionLink href={`${basePath}/check-in`} variant="quiet" size="compact">
            Complete check-in
          </ActionLink>
        </Status>
      ) : null}

      <Section title="Today">
        <MealListWithReplace meals={meals} />
      </Section>

      <div className="border-t border-hairline pt-4">
        <Eyebrow>Today</Eyebrow>
        <p className="mt-2 text-body text-foreground">
          {summary.mealCount} meals · {summary.optionalCount} optional ·{" "}
          {summary.groceryTasks} grocery task · {summary.decisions} decisions
        </p>
        {weeklyAvailable ? (
          <ActionLink
            href={`${basePath}/weekly`}
            variant="quiet"
            size="compact"
            className="mt-2.5"
          >
            Open shopping list
          </ActionLink>
        ) : null}
      </div>

      {maintenanceOnly || notices.length ? (
        <Status role="neutral">
          {maintenanceOnly ? (
            <p>
              Your plan is set at maintenance energy. A deficit is not offered for
              your current answers.
            </p>
          ) : null}
          {notices.map((notice) => (
            <p key={notice} className={maintenanceOnly ? "mt-1" : undefined}>
              {notice}
            </p>
          ))}
        </Status>
      ) : null}
    </>
  );
}
