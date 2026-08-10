"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";

export function PeopleSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    const suffix = next.toString();
    router.push(suffix ? `/admin/people?${suffix}` : "/admin/people");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-wrap items-end gap-3">
      <div className="min-w-[16rem] flex-1">
        <TextField
          label="Search by email or name"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
