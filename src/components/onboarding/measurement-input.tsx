import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function MeasurementInput({
  label,
  hint,
  error,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const id = rest.id ?? rest.name ?? "measure";
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta text-soft">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-meta text-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        className={cn(
          "min-h-11 w-full rounded-control border bg-surface px-3 text-body tabular text-foreground",
          "transition-colors [transition-duration:var(--duration-fast)]",
          error
            ? "border-status-danger-line focus:border-status-danger-mark"
            : "border-hairline-strong focus:border-accent",
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      <div aria-live="polite">
        {error ? (
          <p id={errorId} className="text-meta text-status-danger-text">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
