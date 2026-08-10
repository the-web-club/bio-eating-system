"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { selectionTransition } from "@/lib/motion";
import { IconCheck, IconLock } from "./icons";

export type LessonNavItem = {
  id: string;
  title: string;
  state: "available" | "active" | "complete" | "locked";
  duration?: string;
};

/**
 * Lesson index. The current lesson is marked by a slim accent rail and weight,
 * matching the product rail. Completion is a compact check, not a green fill;
 * locked lessons keep full text contrast.
 */
export function LessonNavigation({
  lessons,
  activeId,
  onSelect,
}: {
  lessons: LessonNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <nav aria-label="Lessons">
      <ul className="divide-y divide-hairline border-t border-hairline">
        {lessons.map((lesson, index) => {
          const active = lesson.id === activeId;
          const locked = lesson.state === "locked";
          return (
            <li key={lesson.id} className="relative">
              <button
                type="button"
                disabled={locked}
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(lesson.id)}
                className={cn(
                  "relative flex min-h-11 w-full cursor-[var(--cursor-control)] items-start gap-3 py-2.5 pl-4 pr-1 text-left text-body",
                  "transition-colors [transition-duration:var(--duration-fast)]",
                  active ? "font-medium text-foreground" : "text-muted",
                  !active && !locked && "hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId={reduceMotion ? undefined : "lesson-rail"}
                    transition={selectionTransition(reduceMotion)}
                    className="absolute inset-y-2 left-0 w-0.5 rounded-pill bg-accent"
                    aria-hidden
                  />
                ) : null}
                <span className="w-4 shrink-0 pt-0.5 font-meta text-meta tabular text-faint">
                  {index + 1}
                </span>
                {/* Title wraps rather than truncates; state sits on its own line
                    so a narrow index column never clips a lesson name. */}
                <span className="min-w-0 flex-1">
                  <span className="block">{lesson.title}</span>
                  {locked || lesson.duration ? (
                    <span className="mt-0.5 flex items-center gap-1.5 text-small text-faint">
                      {locked ? (
                        <>
                          <IconLock className="size-3.5 shrink-0" aria-hidden />
                          <span>Not available yet</span>
                        </>
                      ) : null}
                      {lesson.duration ? (
                        <span className="font-meta tabular">{lesson.duration}</span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
                {lesson.state === "complete" ? (
                  <IconCheck
                    className="size-4 shrink-0 translate-y-0.5 text-confirm"
                    aria-label="Completed"
                    role="img"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
