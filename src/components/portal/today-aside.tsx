import { Eyebrow } from "@/components/portal/layout";
import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";
import type { TodaySummary } from "@/lib/portal/meal-assembly";

export function TodayAside({
  summary,
  weeklyAvailable,
  basePath,
  maintenanceOnly,
  notices,
  showRecalibration,
  showCheckIn,
}: {
  summary: TodaySummary;
  weeklyAvailable: boolean;
  basePath: string;
  maintenanceOnly: boolean;
  notices: string[];
  showRecalibration?: boolean;
  showCheckIn?: boolean;
}) {
  return (
    <>
      <div>
        <Eyebrow>Summary</Eyebrow>
        <p className="mt-s2 text-body text-muted">
          {summary.mealCount} meals · {summary.optionalCount} optional ·{" "}
          {summary.groceryTasks} grocery task · {summary.decisions} decisions
        </p>
        {weeklyAvailable ? (
          <ActionLink href={`${basePath}/weekly`} variant="quiet" size="compact" className="mt-s2">
            Open shopping list
          </ActionLink>
        ) : null}
      </div>

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

      {maintenanceOnly || notices.length ? (
        <Status role="neutral">
          {maintenanceOnly ? (
            <p>
              Your plan is set at maintenance energy. A deficit is not offered for
              your current answers.
            </p>
          ) : null}
          {notices.map((notice) => (
            <p key={notice} className={maintenanceOnly ? "mt-s1" : undefined}>
              {notice}
            </p>
          ))}
        </Status>
      ) : null}
    </>
  );
}
