"use client";

import { useState } from "react";
import { Eyebrow, PageSections, PageShell, Prose } from "@/components/portal/layout";
import {
  LessonNavigation,
  type LessonNavItem,
} from "@/components/portal/lesson-navigation";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { PreviewShell } from "../preview-shell";

const LESSONS: LessonNavItem[] = [
  { id: "l1", title: "Noticing hunger cues", state: "complete", duration: "8 min" },
  { id: "l2", title: "Building a steady plate", state: "active", duration: "12 min" },
  {
    id: "l3",
    title: "Planning around busy days",
    state: "available",
    duration: "10 min",
  },
  { id: "l4", title: "Review and next steps", state: "locked" },
];

const BODIES: Record<string, { title: string; body: string; action: string }> = {
  l1: {
    title: "Noticing hunger cues",
    body: "Reviewed lesson text appears here. This layout holds the reading column at a comfortable measure so long-form guidance stays legible on a wide screen.",
    action: "Pause once today before a meal and note hunger on a one to ten scale.",
  },
  l2: {
    title: "Building a steady plate",
    body: "Reviewed lesson text appears here. The lesson index stays beside the reading column on desktop and moves above it on smaller screens.",
    action: "Include protein, plants and a fat source in your next main meal.",
  },
  l3: {
    title: "Planning around busy days",
    body: "Reviewed lesson text appears here, for a lesson that is available but not yet read.",
    action: "Choose one backup meal you can assemble in under fifteen minutes.",
  },
};

export default function PreviewLearnPage() {
  const [activeId, setActiveId] = useState("l2");
  const lesson = BODIES[activeId] ?? BODIES.l2;
  const index = LESSONS.findIndex((item) => item.id === activeId);
  const previousId = index > 0 ? LESSONS[index - 1]?.id : undefined;
  const next = LESSONS[index + 1];
  const nextId = next && next.state !== "locked" ? next.id : undefined;

  return (
    <PreviewShell title="Learn">
      <PageShell>
        <PageSections>
          <PageHeader
            title="Lessons"
            description="Short lessons on eating practices, to read alongside your plan."
          />

          <div className="grid gap-group lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <div className="min-w-0 lg:order-first">
              <Eyebrow className="mb-2.5">This course</Eyebrow>
              <LessonNavigation
                lessons={LESSONS}
                activeId={activeId}
                onSelect={(id) => {
                  const item = LESSONS.find((entry) => entry.id === id);
                  if (item && item.state !== "locked") setActiveId(id);
                }}
              />
            </div>

            <article className="min-w-0">
              <h2 className="text-display text-foreground">{lesson.title}</h2>
              <Prose className="mt-4">
                <p>{lesson.body}</p>
              </Prose>

              <div className="mt-group border-l-2 border-accent pl-5">
                <Eyebrow>This week’s practice</Eyebrow>
                <p className="mt-1.5 measure text-body text-foreground">
                  {lesson.action}
                </p>
              </div>

              <div className="mt-group flex flex-wrap gap-3 border-t border-hairline pt-group">
                <Button
                  variant="secondary"
                  size="compact"
                  disabled={!previousId}
                  disabledReason="This is the first lesson"
                  onClick={() => previousId && setActiveId(previousId)}
                >
                  Previous lesson
                </Button>
                <Button
                  size="compact"
                  disabled={!nextId}
                  disabledReason="The next lesson is not published yet"
                  onClick={() => nextId && setActiveId(nextId)}
                >
                  Next lesson
                </Button>
              </div>
            </article>
          </div>
        </PageSections>
      </PageShell>
    </PreviewShell>
  );
}
