import { redirect } from "next/navigation";
import { CheckInForm } from "@/components/portal/check-in-form";
import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { loadPortalData } from "@/lib/portal/load-portal-data";

export default async function CheckInPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/?next=/portal/check-in");
  }

  if (!data.plan) redirect("/portal/intake");

  return (
    <PageShell width="reading">
      <PageSections>
        <PageHeader
          title="How did this week feel?"
          description="About two minutes. This shapes your next week."
        />
        <Section title="Your ratings">
          <CheckInForm />
        </Section>
      </PageSections>
    </PageShell>
  );
}
