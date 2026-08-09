import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Empty state for non-portal surfaces. Separated by one hairline, left aligned,
 * and it names the next action rather than framing a dashed box.
 */
export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-hairline pt-tight", className)}>
      <p className="text-title text-foreground">{title}</p>
      {children ? (
        <div className="mt-1 measure text-body text-muted">{children}</div>
      ) : null}
      {action ? <div className="mt-tight">{action}</div> : null}
    </div>
  );
}
