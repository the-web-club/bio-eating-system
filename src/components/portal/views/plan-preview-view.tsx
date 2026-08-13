import { DataRow, DataRows } from "../data-row";
import { Eyebrow, PageSections, PageShell, Section } from "../layout";
import { PageHeader } from "../page-header";
import { ActionLink } from "@/components/ui/action-link";
import { Status } from "@/components/ui/status";
import {
  ACTIVITY_LABELS,
  COOKING_ABILITY_LABELS,
  GOAL_APPROACH_LABELS,
  GOAL_LABELS,
} from "@/lib/content/labels";
import type { AssembledMeal } from "@/lib/portal/meal-assembly";
import { builtAroundBullets, type PortalProfileSummary } from "@/lib/portal/profile-summary";

export type PlanPreviewViewProps = {
  firstName: string;
  profile: PortalProfileSummary;
  goal: keyof typeof GOAL_LABELS;
  maintenanceOnly: boolean;
  weekTeaser: { day: string; meals: AssembledMeal[] }[];
  basePath: string;
};

export function PlanPreviewView({
  firstName,
  profile,
  goal,
  maintenanceOnly,
  weekTeaser,
  basePath,
}: PlanPreviewViewProps) {
  const bullets = builtAroundBullets(profile);
  const approach =
    maintenanceOnly && goal === "REDUCE"
      ? "Maintenance energy (deficit not offered for your answers)"
      : GOAL_APPROACH_LABELS[goal];

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Your personal plan"
          description={`${firstName}, here is what we built from your setup.`}
        />

        {maintenanceOnly ? (
          <Status role="neutral">
            Your plan stays at maintenance energy. A deficit is not offered for your
            current answers.
          </Status>
        ) : null}

        <Section title="Overview">
          <dl className="divide-y divide-hairline border-t border-hairline">
            <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s2">
              <dt className="text-meta text-muted">Goal</dt>
              <dd className="text-body text-foreground">{GOAL_LABELS[goal]}</dd>
            </div>
            <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s2">
              <dt className="text-meta text-muted">Current</dt>
              <dd className="text-body text-foreground">{profile.weightKg} kg</dd>
            </div>
            <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s2">
              <dt className="text-meta text-muted">Target approach</dt>
              <dd className="text-body text-foreground">{approach}</dd>
            </div>
          </dl>
        </Section>

        <Section ruled title="Your plan is built around">
          <ul className="list-inside list-disc space-y-s1 text-body text-foreground">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-s2 text-meta text-muted">
            Activity: {ACTIVITY_LABELS[profile.lifestyle.activityLevel]} · Cooking:{" "}
            {COOKING_ABILITY_LABELS[profile.practical.cookingAbility]}
          </p>
        </Section>

        <Section ruled title="Your first week">
          <p className="text-body text-muted">7 days with actual meals.</p>
          <div className="mt-s4 space-y-s4">
            {weekTeaser.slice(0, 3).map((day) => (
              <div key={day.day} className="border-t border-hairline pt-s2">
                <Eyebrow>{day.day}</Eyebrow>
                <DataRows>
                  {day.meals
                    .filter((m) => m.items.length > 0)
                    .map((meal) => (
                      <DataRow
                        key={meal.kind}
                        name={meal.label}
                        value={meal.summary}
                      />
                    ))}
                </DataRows>
              </div>
            ))}
            <p className="text-meta text-faint">
              Plus 4 more days in your weekly plan.
            </p>
          </div>
        </Section>

        <div className="pt-s1">
          <ActionLink href={basePath} variant="feature">
            Go to today
          </ActionLink>
        </div>
      </PageSections>
    </PageShell>
  );
}
