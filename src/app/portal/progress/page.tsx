import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { AdaptationPrompts } from "@/components/portal/adaptation-prompts";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { ProgressMetrics } from "@/components/portal/progress-metrics";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { db } from "@/lib/db";

export default async function ProgressPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/?next=/portal/progress");
  }

  if (!data.entitlements.corePlan || !data.plan) {
    return (
      <AppShell title="Progress">
        <PageShell width="reading">
          <PortalEmptyState title="No plan yet">
            Complete your setup to track progress.
          </PortalEmptyState>
        </PageShell>
      </AppShell>
    );
  }

  const checkIns = await db.weeklyCheckIn.findMany({
    where: { userId: data.user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <AppShell title="Progress">
      <PageShell>
        <PageSections>
          <PageHeader
            title="Progress"
            description="Is this working? Trends matter more than a single number."
          />
          <Section title="Your trends">
            <ProgressMetrics
              currentWeight={data.profile?.weightKg ?? null}
              checkIns={checkIns.map((c) => ({
                energy: c.energy,
                hunger: c.hunger,
                satisfaction: c.satisfaction,
                adherence: c.adherence,
                weightKg: c.weightKg,
                createdAt: c.createdAt.toISOString(),
              }))}
            />
          </Section>
          <Section ruled title="Suggestions">
            <AdaptationPrompts />
          </Section>
        </PageSections>
      </PageShell>
    </AppShell>
  );
}
