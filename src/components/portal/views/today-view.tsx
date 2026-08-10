import { DisclosureRow } from "../disclosure-row";
import {
  hasPortionDetail,
  PortionDetail,
} from "../portion-detail";
import { Eyebrow, PageSections, PageShell, Section, Split } from "../layout";
import { MetricValue } from "../metric-value";
import { PageHeader } from "../page-header";
import { ProgressLine } from "../progress-line";
import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";

export type TodayFocusItem = {
  id: string;
  name: string;
  /** Always-visible supporting line (e.g. personal substitution). */
  note?: string;
  /** Quiet secondary context (e.g. this week’s variety). */
  context?: string;
  amount: string;
  unit: string;
  /** Reviewed catalogue guidance. Null until authored. */
  why: string | null;
  /** Engine swap explanation. Null when no substitution applied. */
  adjustment: string | null;
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

function PortionSummary({
  note,
  context,
}: {
  note?: string;
  context?: string;
}) {
  if (!note && !context) return null;
  return (
    <div className="space-y-0.5">
      {note ? <p>{note}</p> : null}
      {context ? <p className="text-small text-faint">{context}</p> : null}
    </div>
  );
}

function PortionList({ items }: { items: TodayFocusItem[] }) {
  return (
    <ul className="divide-y divide-hairline border-t border-hairline">
      {items.map((item) => {
        const openable = hasPortionDetail(item.why, item.adjustment);
        const summary =
          item.note || item.context ? (
            <PortionSummary note={item.note} context={item.context} />
          ) : undefined;
        return (
          <DisclosureRow
            key={item.id}
            title={item.name}
            detailLabel={`Why ${item.name} is in your plan`}
            summary={summary}
            value={<MetricValue value={item.amount} unit={item.unit} />}
          >
            {openable ? (
              <PortionDetail why={item.why} adjustment={item.adjustment} />
            ) : null}
          </DisclosureRow>
        );
      })}
    </ul>
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
  const varietyLine = varieties.map((v) => v.name).join(" · ");

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description={`${portionCount} food portions for today, set from your intake.`}
          meta={
            <p className="text-meta text-muted">
              {programName} · <span className="font-meta tabular">{weekLabel}</span>
            </p>
          }
          actions={
            <ActionLink href={`${basePath}/plan`} variant="secondary">
              View today’s plan
            </ActionLink>
          }
        />

        <Split
          main={
            <Section
              title="Your portions"
              description="Open a portion to see personal adjustments and reviewed guidance."
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
                <Eyebrow>Your week</Eyebrow>
                <p className="mt-2 font-meta text-lead tabular text-foreground">
                  {weekLabel}
                </p>
                <p className="mt-1 text-small text-muted">
                  {rotationPosition} of {authoredWeeks} in your current rotation
                </p>
                <div className="mt-3">
                  <ProgressLine
                    value={rotationPosition}
                    max={authoredWeeks}
                    label="Rotation"
                    reading={`${rotationPosition}/${authoredWeeks}`}
                  />
                </div>
                {varietyLine ? (
                  <p className="mt-3 text-small text-soft">{varietyLine}</p>
                ) : null}
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
                      variant="quiet"
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
                      variant="quiet"
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
            description={`Week ${String(rotationPosition).padStart(2, "0")} of ${String(authoredWeeks).padStart(2, "0")} — varieties rotate so the same foods do not repeat every week.`}
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
