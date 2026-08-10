import Link from "next/link";
import { Suspense } from "react";
import { CreateMemberForm } from "@/components/admin/create-member-form";
import { PeopleSearch } from "@/components/admin/people-search";
import { PageHeader } from "@/components/portal/page-header";
import { Meta, PageSections, PageShell, Section } from "@/components/portal/layout";
import { db } from "@/lib/db";

type PeoplePageProps = {
  searchParams: Promise<{ q?: string }>;
};

function accessSummary(flags: {
  corePlan: boolean;
  weeklyRotation: boolean;
  labReference: boolean;
  coaching: boolean;
} | null) {
  if (!flags) return "No access";
  const parts: string[] = [];
  if (flags.corePlan) parts.push("Plan");
  if (flags.weeklyRotation) parts.push("Weekly");
  if (flags.labReference) parts.push("Markers");
  if (flags.coaching) parts.push("Coaching");
  return parts.length ? parts.join(" · ") : "No access";
}

export default async function AdminPeoplePage({ searchParams }: PeoplePageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 200);

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      entitlements: {
        select: {
          corePlan: true,
          weeklyRotation: true,
          labReference: true,
          coaching: true,
        },
      },
      profile: { select: { id: true } },
    },
  });

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="People"
          description="Find members, create access and open a record."
        />

        <Section title="Search">
          <Suspense fallback={null}>
            <PeopleSearch initialQuery={q} />
          </Suspense>
        </Section>

        <Section ruled title={q ? `Results for “${q}”` : "Recent members"}>
          {users.length === 0 ? (
            <p className="text-body text-muted">No members match that search.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {users.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/admin/people/${user.id}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 hover:bg-surface-inset"
                  >
                    <div className="min-w-0">
                      <p className="text-body text-foreground">{user.email}</p>
                      <p className="text-small text-muted">
                        {user.name}
                        {user.profile ? " · Intake done" : " · Intake open"}
                        {" · "}
                        {accessSummary(user.entitlements)}
                      </p>
                    </div>
                    <Meta>
                      {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
                        user.createdAt,
                      )}
                    </Meta>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          ruled
          title="Create member"
          description="Adds an account so they can sign in with a magic link. Prefer the shop webhook for paying customers."
        >
          <CreateMemberForm />
        </Section>
      </PageSections>
    </PageShell>
  );
}
