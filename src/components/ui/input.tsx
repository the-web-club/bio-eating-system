import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Status } from "./status";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** When set, the label is visually hidden and this id is used as aria-labelledby. */
  labelledBy?: string;
  align?: "left" | "center";
  error?: ReactNode;
};

/**
 * Bordered field at the input radius. The border carries the control, so there
 * is no shadow, and focus is expressed by the accent border plus the global
 * focus ring.
 */
export function TextField({
  label,
  labelledBy,
  align = "left",
  id,
  className = "",
  error,
  ...rest
}: TextFieldProps) {
  const inputId = id ?? rest.name ?? "field";
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {labelledBy ? (
        <span className="sr-only" id={`${inputId}-fallback-label`}>
          {label}
        </span>
      ) : (
        <label htmlFor={inputId} className="text-meta text-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-labelledby={labelledBy}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full min-h-11 rounded-control border bg-surface px-3 text-body text-foreground",
          "placeholder:text-disabled",
          "transition-colors [transition-duration:var(--duration-fast)]",
          error
            ? "border-status-danger-line focus:border-status-danger-mark"
            : "border-hairline-strong focus:border-accent",
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

/** @deprecated Renamed to TextField when the underline treatment was dropped. */
export const UnderlineInput = TextField;
