"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { REPLACE_REASON_LABELS } from "@/lib/content/labels";
import { replaceReasonSchema, type ReplaceReason } from "@/lib/intake/schema";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { SLOT_LABELS } from "@/lib/content/labels";
import { cn } from "@/lib/cn";

type Reason = ReplaceReason;

const REPLACE_REASONS = replaceReasonSchema.options;

type ReplaceOption = { slot: FoodSlot; label: string; tier: string };

export type ReplaceStep = "idle" | "reason" | "pick" | "done";

export function ReplaceMealButton({
  slot,
  mealLabel,
  onStepChange,
  className,
}: {
  slot: FoodSlot;
  mealLabel: string;
  onStepChange?: (step: ReplaceStep) => void;
  className?: string;
}) {
  const [step, setStep] = useState<ReplaceStep>("idle");
  const [reason, setReason] = useState<Reason | null>(null);
  const [options, setOptions] = useState<ReplaceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function goTo(next: ReplaceStep) {
    setStep(next);
    onStepChange?.(next);
  }

  async function pickReason(r: Reason) {
    setReason(r);
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/adapt/replace?slot=${slot}`);
      const data = (await res.json()) as { options?: ReplaceOption[] };
      setOptions(data.options ?? []);
      goTo("pick");
    } finally {
      setLoading(false);
    }
  }

  async function confirmReplace(replacementSlot?: FoodSlot) {
    if (!reason) return;
    setLoading(true);
    try {
      const res = await fetch("/api/portal/adapt/replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, reason, replacementSlot }),
      });
      if (res.ok) {
        setMessage("Plan updated");
        goTo("done");
      }
    } finally {
      setLoading(false);
    }
  }

  if (step === "idle") {
    return (
      <Button variant="quiet" size="compact" className={className} onClick={() => goTo("reason")}>
        Replace
      </Button>
    );
  }

  return (
    <ReplacePanel className={className}>
      <p className="text-small text-muted">
        Replace {mealLabel} — why are you replacing it?
      </p>
      {step === "reason" ? (
        <div className="flex flex-wrap gap-2">
          {REPLACE_REASONS.map((r) => (
            <Button
              key={r}
              variant="secondary"
              size="compact"
              loading={loading}
              onClick={() => void pickReason(r)}
            >
              {REPLACE_REASON_LABELS[r]}
            </Button>
          ))}
        </div>
      ) : null}
      {step === "pick" ? (
        <div className="space-y-2">
          <p className="text-small text-foreground">Choose a replacement</p>
          {options.map((opt) => (
            <Button
              key={opt.slot}
              variant="secondary"
              size="compact"
              loading={loading}
              onClick={() => void confirmReplace(opt.slot)}
            >
              {opt.label}: {SLOT_LABELS[opt.slot]}
            </Button>
          ))}
          <Button
            variant="quiet"
            size="compact"
            loading={loading}
            onClick={() => void confirmReplace()}
          >
            Show another meal
          </Button>
        </div>
      ) : null}
      {step === "done" && message ? (
        <p className="text-small text-confirm animate-[fade-in_var(--duration-disclosure)_var(--ease-state)]">
          {message}
        </p>
      ) : null}
      <Button variant="quiet" size="compact" onClick={() => goTo("idle")}>
        Cancel
      </Button>
    </ReplacePanel>
  );
}

function ReplacePanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mt-2 space-y-2 animate-[fade-in_var(--duration-disclosure)_var(--ease-state)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
