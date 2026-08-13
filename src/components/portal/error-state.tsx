import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Status } from "@/components/ui/status";

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
        "flex flex-col gap-s4 sm:flex-row sm:items-start sm:gap-s5",
        className,
      )}
    >
      <Status role="danger">
        <p className="font-medium">{title}</p>
        <div className="mt-s1 text-soft">{children}</div>
      </Status>
      {action ? (
        <div className="flex shrink-0 flex-wrap gap-s4 pl-s4 sm:pl-0">{action}</div>
      ) : null}
    </div>
  );
}
