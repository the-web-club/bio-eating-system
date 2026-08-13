import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function MealListSection({
  title,
  meta,
  children,
  className,
}: {
  title?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(className)}>
      {title ? (
        <h2 className="text-body-lg font-semibold text-foreground">{title}</h2>
      ) : null}
      {meta ? (
        <div className={cn("text-meta text-muted", title ? "mt-s2" : undefined)}>
          {meta}
        </div>
      ) : null}
      <div className={title || meta ? "mt-s2" : undefined}>{children}</div>
    </section>
  );
}

export function MealListMeta({
  goal,
  focus,
}: {
  goal: string;
  focus: string;
}) {
  return (
    <p>
      Goal: {goal}
      <span className="text-faint"> · </span>
      Focus: {focus}
    </p>
  );
}
