"use client";

import { motion, useReducedMotion } from "framer-motion";
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
                  "relative flex min-h-11 w-full cursor-[var(--cursor-control)] items-center gap-3 py-2.5 pl-4 pr-1 text-left text-body",
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
                <span className="w-4 shrink-0 font-meta text-meta tabular text-faint">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                {lesson.state === "complete" ? (
                  <IconCheck
                    className="size-4 shrink-0 text-confirm"
                    aria-label="Completed"
                    role="img"
                  />
                ) : null}
                {locked ? (
                  <IconLock
                    className="size-4 shrink-0 text-faint"
                    aria-label="Not available yet"
                    role="img"
                  />
                ) : null}
                {lesson.duration ? (
                  <span className="shrink-0 font-meta text-meta tabular text-faint">
                    {lesson.duration}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
