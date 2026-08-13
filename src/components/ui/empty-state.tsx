import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Empty state for non-portal surfaces. Same editorial structure as the portal
 * empty state, at a quieter scale: hairline, title, optional body, action.
 */
export function EmptyState({
  title,
  children,
  action,
  eyebrow,
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** Quiet structural label. A few words only; never a sentence. */
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-hairline pt-s4", className)}>
      {eyebrow ? (
        <span className="mb-s1 block text-label text-faint u-caps">{eyebrow}</span>
      ) : null}
      <p className="text-body-lg font-semibold text-foreground">{title}</p>
      {children ? (
        <div className="mt-s2 measure text-body text-muted">{children}</div>
      ) : null}
      {action ? <div className="mt-s4 flex flex-wrap gap-s2">{action}</div> : null}
    </div>
  );
}
