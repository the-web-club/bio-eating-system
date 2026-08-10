import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { YourPlanSection } from "@/components/portal/your-plan-section";
import { Section } from "@/components/portal/layout";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { getProfileExtras } from "@/components/portal/nav-config";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";
import { PrivacyControls } from "./privacy-controls";
import { SignOutButton } from "./sign-out-button";
import { ActionLink } from "@/components/ui/action-link";

async function ProfilePageContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?next=/portal/account");

  const extras = getProfileExtras("/portal");
  let data;
  try {
    data = await loadPortalData();
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
    <>
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
    </>
  );
}

export default function ProfilePage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.account}>
      <ProfilePageContent />
    </PortalPageWithSuspense>
  );
}
