"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ACCESS_FLAG_LABELS,
  type AccessFlags,
} from "@/lib/admin/access";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/input";
import { Status } from "@/components/ui/status";

export function AccessEditor({
  userId,
  initial,
}: {
  userId: string;
  initial: AccessFlags;
}) {
  const router = useRouter();
  const [access, setAccess] = useState<AccessFlags>(initial);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    setPending(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/admin/users/${userId}/access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access,
        note: note.trim() || undefined,
      }),
    });

    setPending(false);

    if (res.status === 401 || res.status === 403) {
      router.push("/?next=/admin");
      return;
    }
    if (!res.ok) {
      setError("Access was not saved. Try again.");
      return;
    }

    setSaved(true);
    setNote("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-tight">
      <ul className="divide-y divide-hairline border-t border-hairline">
        {ACCESS_FLAG_LABELS.map((flag) => (
          <li key={flag.key} className="py-3">
            <Checkbox
              id={`access-${flag.key}`}
              label={flag.label}
              checked={access[flag.key]}
              onCheckedChange={(checked) =>
                setAccess((prev) => ({ ...prev, [flag.key]: checked }))
              }
            />
            <p className="mt-1 pl-8 text-meta text-muted">{flag.hint}</p>
          </li>
        ))}
      </ul>

      <TextField
        label="Note for the log (optional)"
        name="note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
      />

      <div aria-live="polite" className="space-y-2">
        {error ? <Status role="danger">{error}</Status> : null}
        {saved ? <Status role="success">Access saved.</Status> : null}
      </div>

      <Button type="button" loading={pending} onClick={onSave} className="w-fit">
        Save access
      </Button>
    </div>
  );
}
