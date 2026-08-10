import Link from "next/link";
import { PageHeader } from "@/components/portal/page-header";
import { Meta, PageSections, PageShell, Section } from "@/components/portal/layout";
import { db } from "@/lib/db";

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminActivityPage() {
  const events = await db.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      action: true,
      actor: true,
      createdAt: true,
      userId: true,
      user: { select: { email: true } },
    },
  });

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Activity"
          description="Audit trail for access changes, purchases and account events."
        />

        <Section title="Recent events">
          {events.length === 0 ? (
            <p className="text-body text-muted">No events yet.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-body text-foreground">{event.action}</p>
                    <p className="text-meta text-muted">
                      {event.userId && event.user ? (
                        <Link
                          href={`/admin/people/${event.userId}`}
                          className="text-accent-text underline-offset-4 hover:underline"
                        >
                          {event.user.email}
                        </Link>
                      ) : (
                        "No member"
                      )}
                      {" · "}
                      {event.actor}
                    </p>
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
