"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/input";
import { Status } from "@/components/ui/status";

export function CreateMemberForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [corePlan, setCorePlan] = useState(true);
  const [weeklyRotation, setWeeklyRotation] = useState(true);
  const [labReference, setLabReference] = useState(true);
  const [coaching, setCoaching] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        name: name.trim() || undefined,
        access: {
          corePlan,
          weeklyRotation,
          labReference,
          coaching,
          hormoneModule: false,
          nervousModule: false,
        },
      }),
    });

    setPending(false);

    if (res.status === 401 || res.status === 403) {
      router.push("/?next=/admin/people");
      return;
    }

    if (res.status === 409) {
      const body = (await res.json().catch(() => null)) as { id?: string } | null;
      if (body?.id) {
        router.push(`/admin/people/${body.id}`);
        return;
      }
      setError("That email already has an account.");
      return;
    }

    if (!res.ok) {
      setError("The member was not created. Check the email and try again.");
      return;
    }

    const body = (await res.json()) as { id: string };
    router.push(`/admin/people/${body.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-tight">
      <TextField
        label="Email"
        type="email"
        name="email"
        required
        autoComplete="off"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <TextField
        label="Name (optional)"
        name="name"
        autoComplete="off"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <fieldset className="space-y-s1 border-t border-hairline pt-s4">
        <legend className="text-meta text-soft">Starting access</legend>
        <CheckboxGroup>
          <Checkbox
            id="create-core"
            label="Daily plan"
            checked={corePlan}
            onCheckedChange={setCorePlan}
          />
          <Checkbox
            id="create-weekly"
            label="Weekly list"
            checked={weeklyRotation}
            onCheckedChange={setWeeklyRotation}
          />
          <Checkbox
            id="create-lab"
            label="Biomarker reference"
            checked={labReference}
            onCheckedChange={setLabReference}
          />
          <Checkbox
            id="create-coach"
            label="Coaching"
            checked={coaching}
            onCheckedChange={setCoaching}
          />
        </CheckboxGroup>
      </fieldset>

      <div aria-live="polite">
        {error ? <Status role="danger">{error}</Status> : null}
      </div>

      <Button type="submit" loading={pending} className="w-fit">
        Create member
      </Button>
    </form>
  );
}
