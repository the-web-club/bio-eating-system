import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Editorial page opening. No container, no rule, no badge row: the title's
 * scale carries the hierarchy and the action stays deliberately compact.
 */
export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: {
  title: string;
  description?: string;
  /** Quiet supporting metadata, such as the current week. */
  meta?: ReactNode;
  /** One primary action. It must not become the dominant object on the page. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-section-serif text-foreground">{title}</h1>
        {description ? (
          <p className="mt-2 measure text-body-lg text-muted">{description}</p>
        ) : null}
        {meta ? <div className="mt-3">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:pt-1.5">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
