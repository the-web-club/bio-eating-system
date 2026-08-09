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

export type TodayVariety = {
  id: string;
  name: string;
  /** Which part of the plan the variety belongs to. */
  group: string;
};

export type TodayViewProps = {
  firstName: string;
  weekLabel: string;
  programName: string;
  portionCount: number;
  /** Leading portions, given the main column. */
  focus: TodayFocusItem[];
  /** Everything else on the plan, so the page shows the whole day. */
  rest: TodayFocusItem[];
  energyKcal: number;
  rotationPosition: number;
  authoredWeeks: number;
  notices: string[];
  maintenanceOnly: boolean;
  varieties: TodayVariety[];
  weeklyAvailable: boolean;
  basePath: string;
};

/** Splits a list down the middle so two hairline columns stay balanced. */
function halves<T>(items: T[]): [T[], T[]] {
  const middle = Math.ceil(items.length / 2);
  return [items.slice(0, middle), items.slice(middle)];
}

function PortionList({ items }: { items: TodayFocusItem[] }) {
  return (
    <DataRows>
      {items.map((item) => (
        <DataRow
          key={item.id}
          name={item.name}
          note={item.note}
          value={item.amount}
          unit={item.unit}
        />
      ))}
    </DataRows>
  );
}

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
  rest,
  energyKcal,
  rotationPosition,
  authoredWeeks,
  notices,
  maintenanceOnly,
  varieties,
  weeklyAvailable,
  basePath,
}: TodayViewProps) {
  const [restLeft, restRight] = halves(rest);

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
              description="The portions to get right first. Quantities come from your own plan."
            >
              <PortionList items={focus} />
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

        {rest.length ? (
          <Section
            ruled
            title="The rest of today"
            description="The remaining portions, in the same order as your daily plan."
            action={
              <ActionLink
                href={`${basePath}/plan`}
                variant="quiet"
                size="compact"
              >
                Open daily plan
              </ActionLink>
            }
          >
            <div className="grid gap-x-12 xl:grid-cols-2">
              <PortionList items={restLeft} />
              {restRight.length ? (
                <PortionList items={restRight} />
              ) : null}
            </div>
          </Section>
        ) : null}

        {varieties.length ? (
          <Section
            ruled
            title="This week’s varieties"
            description={`Authored week ${rotationPosition} of ${authoredWeeks}, rotating so the same foods do not repeat every week.`}
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
            <ul className="grid gap-x-12 gap-y-4 border-t border-hairline pt-4 sm:grid-cols-2 xl:grid-cols-4">
              {varieties.map((variety) => (
                <li key={variety.id} className="min-w-0">
                  <p className="text-lead text-foreground">{variety.name}</p>
                  <p className="mt-0.5 text-small text-faint">{variety.group}</p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </PageSections>
    </PageShell>
  );
}
