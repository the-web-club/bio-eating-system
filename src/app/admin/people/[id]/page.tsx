import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessEditor } from "@/components/admin/access-editor";
import { PageHeader } from "@/components/portal/page-header";
import { Meta, PageSections, PageShell, Section } from "@/components/portal/layout";
import { loadAdminMember } from "@/lib/admin/load-member";

type MemberPageProps = {
  params: Promise<{ id: string }>;
};

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminMemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const member = await loadAdminMember(id);
  if (!member) notFound();

  const facts = [
    { label: "Name", value: member.name },
    { label: "Email", value: member.email },
    { label: "Locale", value: member.locale },
    {
      label: "Joined",
      value: formatWhen(member.createdAt),
    },
    {
      label: "Email verified",
      value: member.emailVerified ? "Yes" : "No",
    },
    {
      label: "Marketing email",
      value: member.unsubscribedAt
        ? "Unsubscribed"
        : member.marketingOptIn
          ? "Opted in"
          : "Not opted in",
    },
  ];

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title={member.email}
          description={member.name}
          actions={
            <Link
              href="/admin/people"
              className="text-body text-accent-text underline-offset-4 hover:underline"
            >
              Back to people
            </Link>
          }
        />

        <Section title="Member">
          <dl className="divide-y divide-hairline border-t border-hairline">
            {facts.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[9rem_minmax(0,1fr)] items-baseline gap-s4 py-s2"
              >
                <dt className="text-meta text-muted">{row.label}</dt>
                <dd className="min-w-0 break-words text-body text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          ruled
          title="Access"
          description="Changes are written to the activity log. Purchases also grant access through the shop webhook."
        >
          <AccessEditor userId={member.id} initial={member.access} />
        </Section>

        <Section ruled title="Weekly schedule">
          {member.schedule ? (
            <dl className="divide-y divide-hairline border-t border-hairline">
              <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-s4 py-s2">
                <dt className="text-meta text-muted">Active</dt>
                <dd className="text-body text-foreground">
                  {member.schedule.active ? "Yes" : "No"}
                </dd>
              </div>
              <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-s4 py-s2">
                <dt className="text-meta text-muted">Current week</dt>
                <dd className="text-body text-foreground">{member.schedule.currentWeek}</dd>
              </div>
              <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-s4 py-s2">
                <dt className="text-meta text-muted">Last sent</dt>
                <dd className="text-body text-foreground">
                  {member.schedule.lastSentAt
                    ? formatWhen(member.schedule.lastSentAt)
                    : "Never"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-body text-muted">No schedule row yet.</p>
          )}
        </Section>

        <Section
          ruled
          title="Intake and plans"
          description="Biometrics stay hidden here. You see readiness and plan metadata only."
        >
          {!member.intake ? (
            <p className="text-body text-muted">Intake not started.</p>
          ) : (
            <div className="space-y-s4">
              <dl className="divide-y divide-hairline border-t border-hairline">
                <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-s4 py-s2">
                  <dt className="text-meta text-muted">Goal</dt>
                  <dd className="text-body text-foreground">{member.intake.goal}</dd>
                </div>
                <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-s4 py-s2">
                  <dt className="text-meta text-muted">Units</dt>
                  <dd className="text-body text-foreground">{member.intake.unitSystem}</dd>
                </div>
                <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-s4 py-s2">
                  <dt className="text-meta text-muted">Consent</dt>
                  <dd className="text-body text-foreground">
                    {member.intake.consentVersion} ·{" "}
                    {formatWhen(member.intake.consentHealthDataAt)}
                  </dd>
                </div>
              </dl>

              {member.intake.notesForCoach ? (
                <div className="border-t border-hairline pt-s4">
                  <p className="text-meta text-muted">Notes for coach</p>
                  <p className="mt-s1 whitespace-pre-wrap text-body text-foreground">
                    {member.intake.notesForCoach}
                  </p>
                </div>
              ) : null}

              {member.intake.plans.length > 0 ? (
                <ul className="divide-y divide-hairline border-t border-hairline">
                  {member.intake.plans.map((plan) => (
                    <li
                      key={plan.id}
                      className="flex flex-wrap items-baseline justify-between gap-x-s4 gap-y-s1 py-s2"
                    >
                      <div>
                        <p className="text-body text-foreground">
                          {plan.energyKcal} kcal · {plan.screeningOutcome}
                        </p>
                        <p className="text-meta text-muted">
                          Plan {plan.engineVersion} · Content {plan.contentVersion}
                        </p>
                      </div>
                      <Meta>{formatWhen(plan.createdAt)}</Meta>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body text-muted">No generated plans yet.</p>
              )}
            </div>
          )}
        </Section>

        <Section ruled title="Recent emails">
          {member.emailDrops.length === 0 ? (
            <p className="text-body text-muted">No weekly drops recorded.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {member.emailDrops.map((drop) => (
                <li key={drop.id} className="py-s2">
                  <p className="text-body text-foreground">
                    Week {drop.weekNumber} · {drop.cycleYear}
                  </p>
                  <p className="text-meta text-muted">
                    {drop.sentAt
                      ? `Sent ${formatWhen(drop.sentAt)}`
                      : drop.failedAt
                        ? `Failed ${formatWhen(drop.failedAt)}`
                        : "Pending"}
                  </p>
                  {drop.failure ? (
                    <p className="mt-s1 text-meta text-danger">{drop.failure}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section ruled title="Activity for this member">
          {member.auditLog.length === 0 ? (
            <p className="text-body text-muted">No events yet.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {member.auditLog.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-s4 gap-y-s1 py-s2"
                >
                  <div className="min-w-0">
                    <p className="text-body text-foreground">{event.action}</p>
                    <p className="text-meta text-muted">{event.actor}</p>
                  </div>
                  <Meta>{formatWhen(event.createdAt)}</Meta>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </PageSections>
    </PageShell>
  );
}
