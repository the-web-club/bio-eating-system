import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MetricValue } from "./metric-value";

export function DataRows({
  children,
  ruled = true,
  className,
}: {
  children: ReactNode;
  ruled?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "divide-y divide-hairline",
        ruled && "border-t border-hairline",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function DataRow({
  name,
  note,
  value,
  unit,
  trailing,
  className,
}: {
  name: string;
  note?: ReactNode;
  value?: string;
  unit?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-s4 gap-y-s1 py-s4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-body-lg text-foreground">{name}</p>
        {note ? <p className="mt-s1 text-meta text-muted">{note}</p> : null}
      </div>
      {value != null ? (
        <MetricValue value={value} unit={unit} className="justify-self-end" />
      ) : (
        trailing
      )}
    </li>
  );
}
