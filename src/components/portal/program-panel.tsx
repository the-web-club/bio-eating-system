import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./layout";
import { ProgressLine } from "./progress-line";

/**
 * The one visually dominant surface allowed per viewport: a high-contrast panel
 * for the program the reader is actually in. It replaces an "active" badge,
 * the hierarchy says which program is current.
 */
export function ProgramPanel({
  label = "Current program",
  name,
  proposition,
  progress,
  action,
  footnote,
  className,
}: {
  label?: string;
  name: string;
  proposition: string;
  progress?: { value: number; max: number; label: string; reading?: string };
  action?: ReactNode;
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-surface bg-surface-feature px-s4 py-s4 text-on-feature sm:px-s5 sm:py-s5",
        className,
      )}
    >
      <div className="flex flex-col gap-s4 md:flex-row md:items-end md:justify-between md:gap-s5 lg:gap-s6">
        <div className="min-w-0">
          <Eyebrow className="text-on-feature-muted">{label}</Eyebrow>
          <h2 className="mt-s1 text-section-serif text-on-feature">{name}</h2>
          <p className="mt-s1 measure text-body text-on-feature-muted">
            {proposition}
          </p>
        </div>
        <div className="w-full shrink-0 space-y-s4 md:w-52 lg:w-64">
          {progress ? (
            <ProgressLine
              tone="feature"
              value={progress.value}
              max={progress.max}
              label={progress.label}
              reading={progress.reading}
            />
          ) : null}
          {action}
        </div>
      </div>
      {footnote ? (
        <p className="mt-s4 border-t border-on-feature-track pt-s4 text-meta text-on-feature-muted">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
