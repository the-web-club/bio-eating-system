import { DataRow, DataRows } from "../data-row";
import { Eyebrow, PageSections, PageShell, Section, Split } from "../layout";
import { MetricValue } from "../metric-value";
import { PageHeader } from "../page-header";
import { ProgressLine } from "../progress-line";
import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";

export type TodayFocusItem = {
  id: string;
  name: string;
  note?: string;
  amount: string;
  unit: string;
};

export type TodayViewProps = {
  firstName: string;
  weekLabel: string;
  programName: string;
  portionCount: number;
  focus: TodayFocusItem[];
  energyKcal: number;
  rotationPosition: number;
  authoredWeeks: number;
  notices: string[];
  maintenanceOnly: boolean;
  varieties: string[];
  weeklyAvailable: boolean;
  basePath: string;
};

/**
 * One editorial composition: the greeting and the single primary action lead,
 * today's portions hold the main column, and the week sits alongside as context.
 */
export function TodayView({
  firstName,
  weekLabel,
  programName,
  portionCount,
  focus,
  energyKcal,
  rotationPosition,
  authoredWeeks,
  notices,
  maintenanceOnly,
  varieties,
  weeklyAvailable,
  basePath,
}: TodayViewProps) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description={`${portionCount} portions are set for today, built from your intake answers.`}
          meta={
            <p className="text-meta text-muted">
              {programName} · <span className="font-meta tabular">{weekLabel}</span>
            </p>
          }
          actions={
            <ActionLink href={`${basePath}/plan`}>View today’s plan</ActionLink>
          }
        />

        <Split
          main={
            <Section
              title="Today’s focus"
              description="Open the daily plan for the full list and preparation detail."
            >
              <DataRows>
                {focus.map((item) => (
                  <DataRow
                    key={item.id}
                    name={item.name}
                    note={item.note}
                    value={item.amount}
                    unit={item.unit}
                  />
                ))}
              </DataRows>
              {maintenanceOnly || notices.length ? (
                <div className="mt-group">
                  <Status role="neutral">
                    {maintenanceOnly ? (
                      <p>
                        Your plan is set at maintenance energy. A deficit is not
                        offered for your current answers.
                      </p>
                    ) : null}
                    {notices.map((notice) => (
                      <p key={notice} className={maintenanceOnly ? "mt-1" : undefined}>
                        {notice}
                      </p>
                    ))}
                  </Status>
                </div>
              ) : null}
            </Section>
          }
          aside={
            <div className="space-y-group">
              <div>
                <Eyebrow>Week progress</Eyebrow>
                <div className="mt-2.5">
                  <ProgressLine
                    value={rotationPosition}
                    max={authoredWeeks}
                    label="Authored weeks in rotation"
                  />
                </div>
              </div>

              <div>
                <Eyebrow>Energy target</Eyebrow>
                <p className="mt-2">
                  <MetricValue
                    value={energyKcal}
                    unit="kcal"
                    className="text-lead"
                  />
                </p>
              </div>

              <div>
                <Eyebrow>Next</Eyebrow>
                {weeklyAvailable ? (
                  <>
                    <p className="mt-2 text-body text-foreground">
                      Review this week’s grocery list
                    </p>
                    <ActionLink
                      href={`${basePath}/weekly`}
                      variant="secondary"
                      size="compact"
                      className="mt-2.5"
                    >
                      Open weekly plan
                    </ActionLink>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-body text-foreground">
                      The weekly grocery list is not on your account yet.
                    </p>
                    <ActionLink
                      href={`${basePath}/programs`}
                      variant="secondary"
                      size="compact"
                      className="mt-2.5"
                    >
                      View upgrade
                    </ActionLink>
                  </>
                )}
              </div>
            </div>
          }
        />

        {varieties.length ? (
          <Section
            ruled
            title="This week’s varieties"
            description={`Authored week ${rotationPosition} of ${authoredWeeks}.`}
            action={
              weeklyAvailable ? (
                <ActionLink
                  href={`${basePath}/weekly`}
                  variant="quiet"
                  size="compact"
                >
                  All varieties
                </ActionLink>
              ) : null
            }
          >
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {varieties.map((variety) => (
                <li key={variety} className="text-body text-soft">
                  {variety}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </PageSections>
    </PageShell>
  );
}
