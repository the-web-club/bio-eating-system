import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type StatusRole = "neutral" | "info" | "success" | "danger";

const ROLE_CLASS: Record<
  StatusRole,
  { text: string; mark: string; line: string; wash: string }
> = {
  neutral: {
    text: "text-status-neutral-text",
    mark: "text-status-neutral-mark",
    line: "border-status-neutral-line",
    wash: "bg-status-neutral-wash",
  },
  info: {
    text: "text-status-info-text",
    mark: "text-status-info-mark",
    line: "border-status-info-line",
    wash: "bg-status-info-wash",
  },
  success: {
    text: "text-status-success-text",
    mark: "text-status-success-mark",
    line: "border-status-success-line",
    wash: "bg-status-success-wash",
  },
  danger: {
    text: "text-status-danger-text",
    mark: "text-status-danger-mark",
    line: "border-status-danger-line",
    wash: "bg-status-danger-wash",
  },
};

function DefaultMark({ role }: { role: StatusRole }) {
  if (role === "success") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (role === "danger") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  if (role === "info") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7.25V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.25V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export type StatusProps = {
  role?: StatusRole;
  children: ReactNode;
  /** Blocking danger may use wash. Other roles default off. */
  wash?: boolean;
  mark?: ReactNode;
  className?: string;
};

/**
 * Feedback about the outcome of an action or the state of a plan: mark + text
 * on a single left hairline. Colour is never the only signal, and there is no
 * enclosing box — use InlineNote for persistent guidance instead.
 *
 * Screening refusal / maintenance-only / allergen exclusions → role="neutral".
 */
export function Status({
  role = "neutral",
  children,
  wash = false,
  mark,
  className,
}: StatusProps) {
  const tokens = ROLE_CLASS[role];
  const useWash = wash && role === "danger";

  return (
    <div
      role="status"
      className={cn(
        "flex gap-2.5 border-l border-solid py-1 pl-3",
        tokens.line,
        tokens.text,
        useWash && cn(tokens.wash, "rounded-r-control py-2 pr-3"),
        className,
      )}
    >
      <span className={cn("mt-[0.15em] shrink-0", tokens.mark)} aria-hidden>
        {mark ?? <DefaultMark role={role} />}
      </span>
      <div className="measure min-w-0 text-body text-inherit">{children}</div>
    </div>
  );
}
