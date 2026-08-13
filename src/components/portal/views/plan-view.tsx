import { DisclosureRow } from "../disclosure-row";
import { InlineNote } from "../inline-note";
import {
  hasPortionDetail,
  PortionDetail,
} from "../portion-detail";
import { Eyebrow, PageSections, PageShell, Section, Split } from "../layout";
import { MetricValue } from "../metric-value";
import { PageHeader } from "../page-header";
import { Status } from "@/components/ui/status";

export type PlanViewItem = {
  id: string;
  name: string;
  note?: string;
  amount: string;
  unit: string;
  why: string | null;
  adjustment: string | null;
};

export type PlanViewGroup = {
  title: string;
  items: PlanViewItem[];
};

export type PlanViewProps = {
  energyKcal: number;
  groups: PlanViewGroup[];
  notices: string[];
  maintenanceOnly: boolean;
  weekLabel: string;
  programName: string;
  portionCount: number;
};

/** Grouped portions on hairlines, each row able to explain itself in place. */
export function PlanView({
  energyKcal,
  groups,
  notices,
  maintenanceOnly,
  weekLabel,
  programName,
  portionCount,
}: PlanViewProps) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Daily plan"
          description={`${portionCount} food portions for today. Open an item for personal adjustments and reviewed guidance.`}
          meta={
            <p className="text-meta text-muted">
              {programName} ·{" "}
              <span className="tabular text-meta">{weekLabel}</span>
            </p>
          }
        />

        <Split
          main={
            <div className="space-y-s5">
              {groups.map((group) => (
                <Section key={group.title} title={group.title}>
                  <ul className="divide-y divide-hairline border-t border-hairline">
                    {group.items.map((item) => {
                      const openable = hasPortionDetail(
                        item.why,
                        item.adjustment,
                      );
                      return (
                        <DisclosureRow
                          key={item.id}
                          title={item.name}
                          detailLabel={`Why ${item.name} is in your plan`}
                          summary={item.note}
                          value={
                            <MetricValue
                              value={item.amount}
                              unit={item.unit}
                            />
                          }
                        >
                          {openable ? (
                            <PortionDetail
                              why={item.why}
                              adjustment={item.adjustment}
                            />
                          ) : null}
                        </DisclosureRow>
                      );
                    })}
                  </ul>
                </Section>
              ))}
            </div>
          }
          aside={
            <div className="space-y-s5">
              <div>
                <Eyebrow>Energy target</Eyebrow>
                <p className="mt-s2">
                  <MetricValue
                    value={energyKcal}
                    unit="kcal"
                    className="text-body-lg"
                  />
                </p>
              </div>

              {maintenanceOnly || notices.length ? (
                <div>
                  <Eyebrow>Your safety limits</Eyebrow>
                  <div className="mt-s2">
                    <Status role="neutral">
                      {maintenanceOnly ? <p>Maintenance energy only.</p> : null}
                      {notices.map((notice) => (
                        <p
                          key={notice}
                          className={maintenanceOnly ? "mt-s1" : undefined}
                        >
                          {notice}
                        </p>
                      ))}
                    </Status>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-hairline pt-s4">
                <InlineNote>
                  Items without detail are waiting on reviewed preparation copy.
                  Nothing is written by the product itself.
                </InlineNote>
              </div>
            </div>
          }
        />
      </PageSections>
    </PageShell>
  );
}
