import { redirect } from "next/navigation";
import { CheckInForm } from "@/components/portal/check-in-form";
import { PortalPageWithSuspense } from "@/components/portal/portal-page-suspense";
import { PageBody, Section } from "@/components/portal/layout";
import { loadPortalData } from "@/lib/portal/load-portal-data";
import { PORTAL_PAGE_COPY } from "@/lib/portal/page-copy";

async function CheckInPageContent() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/?next=/portal/check-in");
  }

  if (!data.plan) redirect("/portal/intake");

  return (
    <PageBody>
      <Section title="Your ratings">
        <CheckInForm />
      </Section>
    </PageBody>
  );
}

export default function CheckInPage() {
  return (
    <PortalPageWithSuspense copy={PORTAL_PAGE_COPY.checkIn}>
      <CheckInPageContent />
    </PortalPageWithSuspense>
  );
}
