"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Prompt = {
  key: string;
  message: string;
  preferenceKey: string;
  preferenceValue: unknown;
};

export function AdaptationPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    void fetch("/api/portal/preferences")
      .then((r) => r.json())
      .then((d: { prompts?: Prompt[] }) => setPrompts(d.prompts ?? []));
  }, []);

  async function respond(prompt: Prompt, accept: boolean) {
    await fetch("/api/portal/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: prompt.preferenceKey,
        tier: "normal",
        value: prompt.preferenceValue,
        accept,
      }),
    });
    setPrompts((prev) => prev.filter((p) => p.key !== prompt.key));
  }

  if (!prompts.length) return null;

  return (
    <div className="space-y-3">
      {prompts.map((prompt) => (
        <div key={prompt.key} className="rounded-card border border-hairline p-4">
          <p className="text-body text-foreground">{prompt.message}</p>
          <div className="mt-3 flex gap-2">
            <Button size="compact" onClick={() => void respond(prompt, true)}>
              Yes
            </Button>
            <Button
              variant="quiet"
              size="compact"
              onClick={() => void respond(prompt, false)}
            >
              Not now
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
