import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Status } from "@/components/ui/status";

/**
 * Failure states say what happened and what to do next, with the retry inline
 * beside the message rather than parked at the bottom of a card.
 */
export function PortalErrorState({
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
    <div className={cn("space-y-tight", className)}>
      <Status role="danger">
        <p className="font-medium">{title}</p>
        <div className="mt-0.5">{children}</div>
      </Status>
      {action ? <div className="flex flex-wrap gap-3 pl-4">{action}</div> : null}
    </div>
  );
}
