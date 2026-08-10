import { redirect } from "next/navigation";
import { AdaptationPrompts } from "@/components/portal/adaptation-prompts";
import { PortalEmptyState } from "@/components/portal/empty-state";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { Section } from "@/components/portal/layout";
import { ProgressMetrics } from "@/components/portal/progress-metrics";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";
import { db } from "@/lib/db";

async function ProgressPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/?next=/portal/progress");
  }

  if (!data.entitlements.corePlan || !data.plan) {
    return (
      <PortalEmptyState title="No plan yet">
        Complete your setup to track progress.
      </PortalEmptyState>
    );
  }

  const checkIns = await db.weeklyCheckIn.findMany({
    where: { userId: data.user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <>
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
    </>
  );
}

export default function ProgressPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.progress}>
      <ProgressPageContent />
    </PortalPageWithSuspense>
  );
}
