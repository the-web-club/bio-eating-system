import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rotationPosition, weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PrivacyControls } from "./privacy-controls";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?next=/portal/account");

  let week: string | undefined;
  let position: number | undefined;
  let authoredWeeks: number | undefined;
  try {
    const data = await loadPortalData();
    week = weekLabel(data.week);
    position = rotationPosition(data.week, data.authoredWeeks);
    authoredWeeks = data.authoredWeeks;
  } catch {
    week = undefined;
  }

  const [user, profile] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { marketingOptIn: true },
    }),
    db.intakeProfile.findUnique({
      where: { userId: session.user.id },
      select: { consentVersion: true, consentHealthDataAt: true },
    }),
  ]);

  const rows = [
    { label: "Name", value: session.user.name },
    { label: "Email", value: session.user.email },
  ];
  const staff = isAdminEmail(session.user.email);

  return (
    <AppShell
      title="Account"
      weekLabel={week}
      programLabel="Core plan"
      rotationPosition={position}
      authoredWeeks={authoredWeeks}
    >
      <PageShell width="reading">
        <PageSections>
          <PageHeader
            title="Account"
            description="Your sign-in details, email preferences and data rights."
          />

          <Section title="Signed in as">
            <dl className="divide-y divide-hairline border-t border-hairline">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-4 py-3"
                >
                  <dt className="text-small text-muted">{row.label}</dt>
                  <dd className="min-w-0 break-words text-body text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          {staff ? (
            <Section
              ruled
              title="Staff"
              description="Member records, access and the activity log."
            >
              <Link
                href="/admin"
                className="inline-block text-body text-accent-text underline-offset-4 hover:underline"
              >
                Open staff tools
              </Link>
            </Section>
          ) : null}

          <Section ruled title="Privacy">
            <PrivacyControls
              marketingOptIn={user.marketingOptIn}
              consentVersion={profile?.consentVersion ?? null}
              consentHealthDataAt={
                profile?.consentHealthDataAt
                  ? profile.consentHealthDataAt.toISOString()
                  : null
              }
            />
          </Section>

          <Section ruled title="Session">
            <SignOutButton />
          </Section>
        </PageSections>
      </PageShell>
    </AppShell>
  );
}
