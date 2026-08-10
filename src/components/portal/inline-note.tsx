import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type NoteTone = "quiet" | "accent" | "danger";

const TONE: Record<NoteTone, { text: string; mark: string }> = {
  quiet: { text: "text-muted", mark: "text-faint" },
  accent: { text: "text-soft", mark: "text-accent-soft" },
  danger: { text: "text-status-danger-text", mark: "text-status-danger-mark" },
};

/**
 * Persistent guidance that must stay readable but must not compete with the
 * product: a small mark and muted text, no container, no wash, no badge.
 * Use Status instead when reporting the outcome of an action.
 */
export function InlineNote({
  tone = "quiet",
  children,
  className,
}: {
  tone?: NoteTone;
  children: ReactNode;
  className?: string;
}) {
  const tokens = TONE[tone];
  return (
    <p className={cn("flex gap-2 text-meta", tokens.text, className)}>
      <span className={cn("mt-[0.2em] shrink-0", tokens.mark)} aria-hidden>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 7.25V11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="5" r="0.75" fill="currentColor" />
        </svg>
      </span>
      <span className="measure min-w-0">{children}</span>
    </p>
  );
}
