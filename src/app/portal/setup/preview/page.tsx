import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { PlanPreviewView } from "@/components/portal/views/plan-preview-view";
import { GOAL_LABELS } from "@/lib/content/labels";
import { assembleMeals } from "@/lib/portal/meal-assembly";
import { loadPortalData } from "@/lib/portal/load-portal-data";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function PlanPreviewPage() {
  let data;
  try {
    data = await loadPortalData();
  } catch {
    redirect("/portal/intake");
  }

  if (!data.entitlements.corePlan) {
    redirect("/portal");
  }

  if (!data.hasProfile || !data.plan || !data.profile) {
    redirect("/portal/intake");
  }

  const goal = data.profile.goal as keyof typeof GOAL_LABELS;
  const meals = assembleMeals(data.plan.slots);
  const weekTeaser = DAY_NAMES.map((day) => ({ day, meals }));

  return (
    <OnboardingShell>
      <PlanPreviewView
        firstName={data.user.name?.split(" ")[0] || "there"}
        profile={data.profile}
        goal={goal in GOAL_LABELS ? goal : "MAINTAIN"}
        maintenanceOnly={data.plan.screeningOutcome === "maintenance_only"}
        weekTeaser={weekTeaser}
        basePath="/portal"
      />
    </OnboardingShell>
  );
}
