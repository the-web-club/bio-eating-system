"use client";

import { useState } from "react";
import { Section } from "@/components/portal/layout";
import { ModuleRow, ModuleRows } from "@/components/portal/module-row";
import { ProgramPanel } from "@/components/portal/program-panel";
import { UpgradeDialog } from "@/components/portal/upgrade-dialog";
import { ActionLink } from "@/components/ui/action-link";
import type { PortalEntitlements } from "@/lib/portal/load-portal-data";

type Upgrade = "core" | "weekly" | "lab" | null;

/**
 * Programs are grouped by what the reader can do with them: the program they are
 * in, the tools already on their account, and everything else. Equal weight
 * across four identical cards is what made the states unreadable before.
 */
export function ProgramsHub({
  entitlements,
  hasPlan,
  rotationPosition,
  authoredWeeks,
  basePath = "/portal",
}: {
  entitlements: PortalEntitlements;
  hasPlan: boolean;
  rotationPosition: number;
  authoredWeeks: number;
  basePath?: string;
}) {
  const [upgrade, setUpgrade] = useState<Upgrade>(null);
  const close = (open: boolean) => !open && setUpgrade(null);

  const included: {
    title: string;
    description: string;
    href: string;
    hint: string;
  }[] = [];

  if (entitlements.weeklyRotation) {
    included.push({
      title: "Weekly plan",
      description:
        "The grocery list for the current authored week, with quantities taken from your daily portions.",
      href: `${basePath}/weekly`,
      hint: hasPlan ? "Matched to your plan" : "Finish your profile first",
    });
  }
  if (entitlements.labReference) {
    included.push({
      title: "Biomarkers",
      description:
        "Educational reference for common markers. Reference context only, never a treatment plan.",
      href: `${basePath}/biomarkers`,
      hint: "Available in your plan",
    });
  }

  return (
    <div className="space-y-group">
      {entitlements.corePlan ? (
        <ProgramPanel
          name="Core plan"
          proposition="Daily portions built from your intake answers, inside the safety limits your screening set."
          progress={
            hasPlan
              ? {
                  value: rotationPosition,
                  max: authoredWeeks,
                  label: "Authored weeks in rotation",
                }
              : undefined
          }
          action={
            <ActionLink
              href={hasPlan ? `${basePath}/plan` : `${basePath}/intake`}
              variant="feature"
              className="w-full"
            >
              {hasPlan ? "Continue program" : "Complete your profile"}
            </ActionLink>
          }
        />
      ) : null}

      {included.length ? (
        <Section title="On your account">
          <ModuleRows>
            {included.map((item) => (
              <ModuleRow
                key={item.title}
                title={item.title}
                description={item.description}
                state="included"
                hint={item.hint}
                href={item.href}
              />
            ))}
          </ModuleRows>
        </Section>
      ) : null}

      <Section
        ruled
        title="Explore more"
        description="Not on your account yet. Nothing here changes your current plan."
      >
        <ModuleRows>
          {!entitlements.corePlan ? (
            <ModuleRow
              title="Core plan"
              description="Daily portions from your intake answers, with screening safety limits applied."
              state="locked"
              hint="View upgrade"
              onUnlock={() => setUpgrade("core")}
            />
          ) : null}
          {!entitlements.weeklyRotation ? (
            <ModuleRow
              title="Weekly plan"
              description="Rotating grocery varieties for the authored weeks, matched to your portions."
              state="locked"
              hint="View upgrade"
              onUnlock={() => setUpgrade("weekly")}
            />
          ) : null}
          {!entitlements.labReference ? (
            <ModuleRow
              title="Biomarkers"
              description="Educational lab reference written in plain language. Not a diagnosis."
              state="locked"
              hint="Explore biomarker support"
              onUnlock={() => setUpgrade("lab")}
            />
          ) : null}
          <ModuleRow
            title="Lessons"
            description="Guided reading on eating practices, written and reviewed by a dietitian."
            state="soon"
            hint="In development"
          />
        </ModuleRows>
      </Section>

      <UpgradeDialog
        open={upgrade === "core"}
        onOpenChange={close}
        title="Core plan"
        value="Personal daily portions from your intake, with screening safety limits."
        includes={[
          "Multi-step intake",
          "Daily plan with portions",
          "Maintenance-only path when a deficit is not appropriate",
        ]}
      />
      <UpgradeDialog
        open={upgrade === "weekly"}
        onOpenChange={close}
        title="Weekly plan"
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
        title="Biomarker support"
        value="Read-only educational biomarker material from the content catalogue."
        includes={[
          "Marker explanations",
          "Reference context without scoring",
          "Consultation notice on every view",
        ]}
      />
    </div>
  );
}
