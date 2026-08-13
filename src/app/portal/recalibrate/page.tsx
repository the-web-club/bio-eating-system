import { redirect } from "next/navigation";
import { IntakeWizard } from "@/components/onboarding/intake-wizard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { loadPortalData } from "@/lib/portal/load-portal-data";

export default async function RecalibratePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/?next=/portal/recalibrate");

  const data = await loadPortalData().catch(() => null);
  if (!data?.plan) redirect("/portal/intake");

  return (
    <div>
      <p className="sr-only">Recalibration intake</p>
      <IntakeWizard initialName={session.user.name} />
    </div>
  );
}
