import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IntakeWizard } from "@/components/onboarding/intake-wizard";
import { auth } from "@/lib/auth";

export default async function IntakePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/?next=/portal/intake");
  }

  return <IntakeWizard initialName={session.user.name} />;
}
