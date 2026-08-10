import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function MealListSection({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(className)}>
      <h2 className="font-serif-display text-meal-section italic text-ink">{title}</h2>
      {meta ? <div className="mt-2 text-meal-meta text-ink-soft">{meta}</div> : null}
      <div className={meta ? "mt-4" : "mt-3"}>{children}</div>
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
      <span className="text-ink-faint"> · </span>
      Focus: {focus}
    </p>
  );
}
