"use client";

import { useState } from "react";
import { Section } from "@/components/portal/layout";
import { ModuleRow, ModuleRows } from "@/components/portal/module-row";
import { UpgradeDialog } from "@/components/portal/upgrade-dialog";
import type { PortalEntitlements } from "@/lib/portal/load-portal-data";

type Upgrade = "weekly" | "lab" | "coaching" | null;

/**
 * Customer-facing plan tiers under Profile. No internal entitlement names.
 */
export function YourPlanSection({
  entitlements,
  hasPlan,
  basePath = "/portal",
}: {
  entitlements: PortalEntitlements;
  hasPlan: boolean;
  basePath?: string;
}) {
  const [upgrade, setUpgrade] = useState<Upgrade>(null);
  const close = (open: boolean) => !open && setUpgrade(null);

  return (
    <div className="space-y-group">
      <Section title="Your plan">
        <ModuleRows>
          <ModuleRow
            title="Personal nutrition plan"
            description="Daily meals built from your setup, within your safety limits."
            state={entitlements.corePlan ? "included" : "locked"}
            hint={entitlements.corePlan ? "Included" : "View upgrade"}
            href={hasPlan ? `${basePath}/plan` : `${basePath}/intake`}
            onUnlock={entitlements.corePlan ? undefined : () => setUpgrade("weekly")}
          />
          <ModuleRow
            title="Your weekly system"
            description="Shopping list and rotating varieties matched to your plan."
            state={entitlements.weeklyRotation ? "included" : "locked"}
            hint={entitlements.weeklyRotation ? "Included" : "Premium"}
            href={`${basePath}/weekly`}
            onUnlock={() => setUpgrade("weekly")}
          />
          <ModuleRow
            title="Advanced tracking"
            description="Educational biomarker reference. Reference context only."
            state={entitlements.labReference ? "included" : "locked"}
            hint={entitlements.labReference ? "Optional" : "Optional upgrade"}
            href={`${basePath}/biomarkers`}
            onUnlock={() => setUpgrade("lab")}
          />
          <ModuleRow
            title="Coaching"
            description="One-to-one support from a qualified practitioner."
            state={entitlements.coaching ? "included" : "soon"}
            hint={entitlements.coaching ? "Included" : "Optional"}
            onUnlock={() => setUpgrade("coaching")}
          />
        </ModuleRows>
      </Section>

      <UpgradeDialog
        open={upgrade === "weekly"}
        onOpenChange={close}
        title="Your weekly system"
        value="A grocery list that cycles through reviewed variety weeks."
        includes={[
          "Authored weekly varieties",
          "Quantities from your daily plan",
          "Optional weekly email when enabled",
        ]}
      />
      <UpgradeDialog
        open={upgrade === "lab"}
        onOpenChange={close}
        title="Advanced tracking"
        value="Read-only educational biomarker material from the content catalogue."
        includes={[
          "Marker explanations",
          "Reference context without scoring",
          "Consultation notice on every view",
        ]}
      />
      <UpgradeDialog
        open={upgrade === "coaching"}
        onOpenChange={close}
        title="Coaching"
        value="Personal support alongside your plan."
        includes={["Practitioner-led sessions", "Plan adjustments", "Accountability"]}
      />
    </div>
  );
}
