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
    <div
      className={cn(
        "flex flex-col gap-tight sm:flex-row sm:items-start sm:gap-6",
        className,
      )}
    >
      <Status role="danger">
        <p className="font-medium">{title}</p>
        {/* Only the headline carries the danger colour; the instruction reads as
            ordinary copy so the state never shouts twice. */}
        <div className="mt-0.5 text-soft">{children}</div>
      </Status>
      {action ? (
        <div className="flex shrink-0 flex-wrap gap-3 pl-4 sm:pl-0">{action}</div>
      ) : null}
    </div>
  );
}
