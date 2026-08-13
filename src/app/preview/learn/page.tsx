"use client";

import { useState } from "react";
import { Eyebrow, PageSections, PageShell, Prose } from "@/components/portal/layout";
import {
  LessonNavigation,
  type LessonNavItem,
} from "@/components/portal/lesson-navigation";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";

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

/**
 * Layout placeholders only. Lesson bodies and practice lines are authored and
 * dietitian-reviewed in the content catalogue, so nothing here states guidance.
 */
const BODIES: Record<string, { title: string; body: string[]; action: string }> = {
  l1: {
    title: "Noticing hunger cues",
    body: [
      "Reviewed lesson text appears in this column once the catalogue entry is published. The measure is held at roughly seventy characters so a long lesson stays legible on a wide screen.",
      "A second paragraph shows the reading rhythm: the line height is looser than the operational lists, and the column does not stretch to the full width of the viewport.",
    ],
    action: "The reviewed practice for this lesson appears here.",
  },
  l2: {
    title: "Building a steady plate",
    body: [
      "Reviewed lesson text appears in this column once the catalogue entry is published. The lesson index stays beside the reading column on desktop and moves above it on smaller screens.",
      "Previous and next controls sit under one hairline at the end of the lesson, so the reader always finds them in the same place.",
    ],
    action: "The reviewed practice for this lesson appears here.",
  },
  l3: {
    title: "Planning around busy days",
    body: [
      "Reviewed lesson text appears in this column once the catalogue entry is published. This entry is available but has not been read yet, so the index shows it without a completion mark.",
    ],
    action: "The reviewed practice for this lesson appears here.",
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
    <PageShell>
      <PageSections>
        <PageHeader
          title="Lessons"
          description="Short lessons on eating practices, to read alongside your plan."
        />

        <div className="grid gap-group md:grid-cols-[16rem_minmax(0,1fr)] md:gap-s5 xl:gap-s6">
          <div className="min-w-0 md:order-first">
            <Eyebrow className="mb-s2">This course</Eyebrow>
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
            <h2 className="text-section-serif text-foreground">{lesson.title}</h2>
            <Prose className="mt-s4">
              {lesson.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Prose>

            <div className="mt-group border-l-2 border-accent pl-s4">
              <Eyebrow>This week’s practice</Eyebrow>
              <p className="mt-s2 measure text-body text-foreground">
                {lesson.action}
              </p>
            </div>

            <div className="mt-group flex flex-wrap gap-s2 border-t border-hairline pt-group">
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
  );
}
