import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Status } from "./status";

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** When set, the label is visually hidden and this id is used as aria-labelledby. */
  labelledBy?: string;
  hint?: string;
  align?: "left" | "center";
  error?: ReactNode;
};

/**
 * Label plus underline input. No boxed fields anywhere in the product.
 */
export function Field({
  label,
  labelledBy,
  hint,
  align = "left",
  id,
  className = "",
  error,
  ...rest
}: FieldProps) {
  const inputId = id ?? rest.name ?? "field";
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex w-full flex-col gap-s1">
      {labelledBy ? (
        <span className="sr-only" id={`${inputId}-fallback-label`}>
          {label}
        </span>
      ) : (
        <label htmlFor={inputId} className="text-meta text-soft">
          {label}
        </label>
      )}
      {hint ? (
        <p id={hintId} className="text-meta text-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={inputId}
        aria-labelledby={labelledBy}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "w-full min-h-11 border-0 border-b border-hairline-strong bg-transparent px-0 py-2 text-body text-foreground",
          "placeholder:text-disabled",
          "transition-colors [transition-duration:var(--duration-fast)]",
          "focus:border-accent focus:outline-none",
          error
            ? "border-status-danger-line focus:border-status-danger-mark"
            : undefined,
          align === "center" ? "text-center" : "text-left",
          className,
        )}
        {...rest}
      />
      <div aria-live="polite">
        {error ? (
          <div id={errorId}>
            <Status role="danger">{error}</Status>
          </div>
        ) : null}
      </div>
    </div>
  );
}
