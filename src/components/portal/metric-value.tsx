import { cn } from "@/lib/cn";

/**
 * Structured value. Monospace is reserved for quantities, units, lab values and
 * week indices so numbers align in a column — never for labels or descriptions.
 */
export function MetricValue({
  value,
  unit,
  className,
}: {
  value: string | number;
  unit?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("font-meta text-small tabular text-foreground", className)}
    >
      {value}
      {unit ? <span className="ml-1 text-muted">{unit}</span> : null}
    </span>
  );
}
