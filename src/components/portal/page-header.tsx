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
  /** Quiet supporting metadata attached to the title block. */
  meta?: ReactNode;
  /** One primary action. It must not become the dominant object on the page. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-s4 sm:flex-row sm:items-start sm:justify-between sm:gap-s5",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-section-serif text-foreground">{title}</h1>
        {meta ? <div className="mt-s2">{meta}</div> : null}
        {description ? (
          <p className="mt-s2 measure text-body-lg text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-s4">{actions}</div>
      ) : null}
    </header>
  );
}
