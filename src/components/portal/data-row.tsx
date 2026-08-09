import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MetricValue } from "./metric-value";

/**
 * Compact data list. Rows are separated by hairlines and aligned to a dedicated
 * value column. No enclosing card, no per-row surface.
 */
export function DataRows({
  children,
  ruled = true,
  className,
}: {
  children: ReactNode;
  /** Hairline on the top edge, anchoring the list under its heading. */
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
        "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-lead text-foreground">{name}</p>
        {note ? <p className="mt-0.5 text-small text-muted">{note}</p> : null}
      </div>
      {value != null ? (
        <MetricValue value={value} unit={unit} className="justify-self-end" />
      ) : (
        trailing
      )}
    </li>
  );
}
