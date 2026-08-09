import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Empty states explain the next action. They are separated by one hairline and
 * spacing — not framed in a dashed box, and not centred in an oversized well.
 */
export function PortalEmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-hairline pt-group", className)}>
      <h2 className="text-section text-foreground">{title}</h2>
      <div className="mt-1.5 measure text-body text-muted">{children}</div>
      {action ? <div className="mt-tight flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}
