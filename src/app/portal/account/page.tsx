import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { YourPlanSection } from "@/components/portal/your-plan-section";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { getProfileExtras } from "@/components/portal/nav-config";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PrivacyControls } from "./privacy-controls";
import { SignOutButton } from "./sign-out-button";
import { ActionLink } from "@/components/ui/action-link";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?next=/portal/account");

  const extras = getProfileExtras("/portal");
  let week: string | undefined;
  let data;
  try {
    data = await loadPortalData();
    week = weekLabel(data.week);
  } catch {
    data = null;
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

  const staff = isAdminEmail(session.user.email);

  return (
    <AppShell title="Profile" weekLabel={week}>
      <PageShell width="reading">
        <PageSections>
          <PageHeader
            title="Profile"
            description="My preferences and settings."
          />

          {data ? (
            <YourPlanSection
              entitlements={data.entitlements}
              hasPlan={Boolean(data.plan)}
            />
          ) : null}

          <Section ruled title="Signed in as">
            <dl className="divide-y divide-hairline border-t border-hairline">
              <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-3">
                <dt className="text-small text-muted">Name</dt>
                <dd className="text-body text-foreground">{session.user.name}</dd>
              </div>
              <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-3">
                <dt className="text-small text-muted">Email</dt>
                <dd className="break-words text-body text-foreground">
                  {session.user.email}
                </dd>
              </div>
            </dl>
          </Section>

          {data?.entitlements.labReference ? (
            <Section ruled title="Advanced tracking">
              <ActionLink href={extras.biomarkers} variant="quiet">
                Open biomarker reference
              </ActionLink>
            </Section>
          ) : null}

          {data?.plan ? (
            <Section ruled title="Plan maintenance">
              <ActionLink href={extras.recalibrate} variant="quiet">
                Update my plan
              </ActionLink>
            </Section>
          ) : null}

          {staff ? (
            <Section ruled title="Staff">
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
