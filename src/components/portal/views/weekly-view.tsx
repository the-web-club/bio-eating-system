import { DataRow, DataRows } from "../data-row";
import { InlineNote } from "../inline-note";
import { Eyebrow, PageSections, PageShell, Section, Split } from "../layout";
import { PageHeader } from "../page-header";
import { ActionLink } from "@/components/ui/action-link";

export type WeeklyViewItem = {
  id: string;
  name: string;
  note?: string;
  value: string;
  unit?: string;
};

export type WeeklyViewProps = {
  position: number;
  authoredWeeks: number;
  items: WeeklyViewItem[];
  basePath: string;
};

export function WeeklyView({
  position,
  authoredWeeks,
  items,
  basePath,
}: WeeklyViewProps) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Weekly plan"
          description="What to buy for the week ahead, in the quantities your daily plan needs."
          meta={
            <p className="text-meta text-muted">
              Authored week{" "}
              <span className="tabular text-meta text-foreground">{position}</span> of{" "}
              <span className="tabular text-meta text-foreground">{authoredWeeks}</span>
            </p>
          }
          actions={
            <ActionLink href={`${basePath}/plan`} variant="secondary">
              View daily plan
            </ActionLink>
          }
        />

        <Split
          main={
            <Section title="Shopping list">
              <DataRows>
                {items.map((item) => (
                  <DataRow
                    key={item.id}
                    name={item.name}
                    note={item.note}
                    value={item.value}
                    unit={item.unit}
                  />
                ))}
              </DataRows>
            </Section>
          }
          aside={
            <div className="space-y-group">
              <div>
                <Eyebrow>Rotation</Eyebrow>
                <p className="mt-2.5 text-body text-soft">
                  Varieties cycle through {authoredWeeks} reviewed weeks. You are on
                  week {position} of that cycle.
                </p>
              </div>
              <div className="border-t border-hairline pt-4">
                <InlineNote>
                  A dash means the quantity is not joined to your daily plan yet.
                </InlineNote>
              </div>
            </div>
          }
        />
      </PageSections>
    </PageShell>
  );
}
