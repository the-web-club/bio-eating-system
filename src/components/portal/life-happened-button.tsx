"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GhostLinkButton } from "@/components/ui/ghost-link";
import { Status } from "@/components/ui/status";
import { LIFE_HAPPENED_LABELS } from "@/lib/content/labels";
import { lifeHappenedReasonSchema, type LifeHappenedReason } from "@/lib/intake/schema";

const LIFE_HAPPENED_REASONS = lifeHappenedReasonSchema.options;

export function LifeHappenedButton(_props: { basePath: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextAction, setNextAction] = useState<string | null>(null);

  async function select(reason: LifeHappenedReason) {
    setLoading(true);
    setNextAction(null);
    try {
      const res = await fetch("/api/portal/adapt/life-happened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = (await res.json()) as { nextAction?: string };
      if (data.nextAction) setNextAction(data.nextAction);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <GhostLinkButton type="button" onClick={() => setOpen(true)}>
        Life happened
      </GhostLinkButton>
    );
  }

  return (
    <div className="space-y-s4">
      <p className="text-body text-foreground">What happened?</p>
      <div className="flex flex-wrap gap-s2">
        {LIFE_HAPPENED_REASONS.map((reason) => (
          <Button
            key={reason}
            variant="secondary"
            size="compact"
            loading={loading}
            onClick={() => void select(reason)}
          >
            {LIFE_HAPPENED_LABELS[reason]}
          </Button>
        ))}
      </div>
      {nextAction ? <Status role="neutral">{nextAction}</Status> : null}
      <GhostLinkButton type="button" onClick={() => setOpen(false)}>
        Close
      </GhostLinkButton>
    </div>
  );
}
