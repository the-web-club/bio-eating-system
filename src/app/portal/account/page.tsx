import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/portal/app-shell";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { auth } from "@/lib/auth";
import { weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { SignOutButton } from "./sign-out-button";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/portal/account");

  let week: string | undefined;
  try {
    const data = await loadPortalData();
    week = weekLabel(data.week);
  } catch {
    week = undefined;
  }

  const rows = [
    { label: "Name", value: session.user.name },
    { label: "Email", value: session.user.email },
  ];

  return (
    <AppShell title="Account" weekLabel={week} programLabel="Core plan">
      <PageShell width="reading">
        <PageSections>
          <PageHeader
            title="Account"
            description="Who you are signed in as, and how to sign out."
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

          <Section ruled title="Session">
            <SignOutButton />
          </Section>
        </PageSections>
      </PageShell>
    </AppShell>
  );
}
