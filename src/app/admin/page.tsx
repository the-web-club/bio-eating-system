import Link from "next/link";
import { PageHeader } from "@/components/portal/page-header";
import { Meta, PageSections, PageShell, Section } from "@/components/portal/layout";
import { loadAdminOverview } from "@/lib/admin/load-overview";

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminOverviewPage() {
  const data = await loadAdminOverview();

  const stats = [
    { label: "Members", value: data.counts.members },
    { label: "Daily plan access", value: data.counts.withPlanAccess },
    { label: "Weekly list access", value: data.counts.withWeekly },
    { label: "Intake complete", value: data.counts.intakeComplete },
  ];

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Overview"
          description="Members, recent activity and delivery issues."
          actions={
            <Link
              href="/admin/people"
              className="text-body text-accent-text underline-offset-4 hover:underline"
            >
              Find a member
            </Link>
          }
        />

        <Section title="At a glance">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-meta text-muted">{stat.label}</dt>
                <dd className="mt-1 text-body-lg tabular font-medium text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section ruled title="Recent activity">
          {data.recentEvents.length === 0 ? (
            <p className="text-body text-muted">No events yet.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {data.recentEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-body text-foreground">{event.action}</p>
                    <p className="text-meta text-muted">
                      {event.user?.email ?? "No member"} · {event.actor}
                    </p>
                  </div>
                  <Meta>{formatWhen(event.createdAt)}</Meta>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-tight">
            <Link
              href="/admin/activity"
              className="text-body text-accent-text underline-offset-4 hover:underline"
            >
              Full activity log
            </Link>
          </p>
        </Section>

        <Section ruled title="Failed weekly emails">
          {data.failedDrops.length === 0 ? (
            <p className="text-body text-muted">No failed drops waiting.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {data.failedDrops.map((drop) => (
                <li key={drop.id} className="py-3">
                  <p className="text-body text-foreground">{drop.user.email}</p>
                  <p className="text-meta text-muted">
                    Week {drop.weekNumber} · {drop.cycleYear}
                    {drop.failedAt ? ` · ${formatWhen(drop.failedAt)}` : ""}
                  </p>
                  {drop.failure ? (
                    <p className="mt-1 text-meta text-danger">{drop.failure}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section ruled title="Purchase webhook issues">
          {data.webhookErrors.length === 0 ? (
            <p className="text-body text-muted">No recorded webhook errors.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {data.webhookErrors.map((event) => (
                <li key={event.id} className="py-3">
                  <p className="text-body text-foreground">
                    {event.provider} · {event.providerEventId}
                  </p>
                  <p className="text-meta text-muted">{formatWhen(event.receivedAt)}</p>
                  {event.error ? (
                    <p className="mt-1 text-meta text-danger">{event.error}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </PageSections>
    </PageShell>
  );
}
