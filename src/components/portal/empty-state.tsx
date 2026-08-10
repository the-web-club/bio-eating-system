import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/portal/layout";
import { IconLock } from "@/components/portal/icons";

export type EmptyTone = "default" | "locked" | "unpublished";

const TONE_EYEBROW: Record<EmptyTone, string | null> = {
  default: null,
  locked: "Not included",
  unpublished: "Not published",
};

/**
 * Empty states explain the next action. Structure is editorial: one quiet
 * eyebrow, a clear title, measured copy, and a single action row. Separated by
 * one hairline and spacing - never framed in a dashed box or centred well.
 */
export function PortalEmptyState({
  title,
  children,
  action,
  tone = "default",
  eyebrow,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  /** Composition signal without a badge. Locked shows a quiet lock mark. */
  tone?: EmptyTone;
  /** Overrides the tone eyebrow. Keep to a few words; never a sentence. */
  eyebrow?: string;
  className?: string;
}) {
  const label = eyebrow ?? TONE_EYEBROW[tone];

  return (
    <div className={cn("border-t border-hairline pt-group", className)}>
      {label ? (
        <div className="mb-3 flex items-center gap-2">
          {tone === "locked" ? (
            <IconLock className="size-3.5 shrink-0 text-faint" />
          ) : null}
          <Eyebrow>{label}</Eyebrow>
        </div>
      ) : null}
      <h2 className="text-body-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 measure-narrow text-body-lg text-muted">{children}</div>
      {action ? (
        <div className="mt-group flex flex-wrap items-center gap-3">{action}</div>
      ) : null}
    </div>
  );
}
