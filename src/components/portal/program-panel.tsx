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
        "rounded-surface bg-surface-feature px-5 py-6 text-on-feature sm:px-8 sm:py-7",
        className,
      )}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10 lg:gap-12">
        <div className="min-w-0">
          <Eyebrow className="text-on-feature-muted">{label}</Eyebrow>
          <h2 className="mt-2 text-section-serif text-on-feature">{name}</h2>
          <p className="mt-2 measure text-body text-on-feature-muted">
            {proposition}
          </p>
        </div>
        <div className="w-full shrink-0 space-y-4 md:w-52 lg:w-64">
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
        <p className="mt-6 border-t border-on-feature-track pt-4 text-meta text-on-feature-muted">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
