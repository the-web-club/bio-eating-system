"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { CHECK_IN_BARRIER_LABELS } from "@/lib/content/labels";
import { CHECK_IN_BARRIERS } from "@/lib/intake/schema";

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-s4">
      <p className="text-body text-foreground">{label}</p>
      <div className="flex gap-s2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            variant={value === n ? "feature" : "secondary"}
            size="compact"
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function CheckInForm() {
  const [energy, setEnergy] = useState(3);
  const [hunger, setHunger] = useState(3);
  const [satisfaction, setSatisfaction] = useState(3);
  const [adherence, setAdherence] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [barriers, setBarriers] = useState<string[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleBarrier(b: string) {
    setBarriers((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energy,
          hunger,
          satisfaction,
          adherence,
          difficulty,
          barriers,
          weightKg: weightKg ? Number(weightKg) : undefined,
        }),
      });
      if (res.ok) setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-body text-foreground">Check-in saved. Your next week will reflect this.</p>;
  }

  return (
    <div className="space-y-s5">
      <RatingRow label="Energy" value={energy} onChange={setEnergy} />
      <RatingRow label="Hunger" value={hunger} onChange={setHunger} />
      <RatingRow label="Satisfaction" value={satisfaction} onChange={setSatisfaction} />
      <RatingRow label="Adherence" value={adherence} onChange={setAdherence} />
      <RatingRow label="Difficulty" value={difficulty} onChange={setDifficulty} />
      <fieldset className="space-y-s4">
        <legend className="text-body text-foreground">What got in the way?</legend>
        <CheckboxGroup>
          {CHECK_IN_BARRIERS.map((b) => (
            <Checkbox
              key={b}
              id={`barrier-${b}`}
              label={CHECK_IN_BARRIER_LABELS[b]}
              checked={barriers.includes(b)}
              onCheckedChange={() => toggleBarrier(b)}
            />
          ))}
        </CheckboxGroup>
      </fieldset>
      <Field
        label="Current weight (kg, optional)"
        name="weightKg"
        type="number"
        inputMode="decimal"
        value={weightKg}
        onChange={(e) => setWeightKg(e.target.value)}
      />
      <Button onClick={() => void submit()} loading={submitting}>
        Save check-in
      </Button>
    </div>
  );
}
