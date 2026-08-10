import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Composition primitives. Structure comes from typography, spacing, alignment
 * and hairline rules - not from nested containers. A surface change or a border
 * is opt-in and only earned by genuinely interactive objects.
 */

/**
 * Page canvas. Owns horizontal gutters and the vertical rhythm between major
 * sections. Wide by default so desktop is composed rather than centred.
 */
export function PageShell({
  children,
  width = "wide",
  className,
}: {
  children: ReactNode;
  /** reading constrains educational content; wide keeps operational lists open. */
  width?: "wide" | "reading";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-gutter py-group sm:px-8 sm:py-group xl:px-10",
        width === "wide" ? "max-w-content" : "max-w-reading",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Vertical rhythm between major sections of a page. */
export function PageSections({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-section", className)}>{children}</div>;
}

/**
 * A major page section. Separated by spacing, with an optional single hairline
 * on the top edge - never enclosed in a container.
 */
export function Section({
  title,
  description,
  action,
  meta,
  children,
  ruled = false,
  as: Tag = "section",
  className,
  headingClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  /** Draw one hairline on the top edge to separate from the section above. */
  ruled?: boolean;
  as?: ElementType;
  className?: string;
  headingClassName?: string;
}) {
  const hasHeading = Boolean(title || description || action || meta);
  return (
    <Tag className={cn(ruled && "border-t border-hairline pt-group", className)}>
      {hasHeading ? (
        <div className="mb-tight flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            {title ? (
              <h2 className={cn("text-body-lg font-semibold text-foreground", headingClassName)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 measure text-body text-muted">{description}</p>
            ) : null}
          </div>
          {meta ? <div className="shrink-0">{meta}</div> : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </Tag>
  );
}

/**
 * Split composition. The information relationship justifies the asymmetry:
 * primary content leads, supporting context sits alongside it.
 */
export function Split({
  main,
  aside,
  className,
}: {
  main: ReactNode;
  aside: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-group md:grid-cols-[minmax(0,1.6fr)_minmax(14rem,1fr)] md:gap-10",
        "xl:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)] xl:gap-12",
        className,
      )}
    >
      <div className="min-w-0">{main}</div>
      {/* Stacked, the hairline runs across; split, it becomes the column rule. */}
      <div className="min-w-0 border-t border-hairline pt-group md:border-t-0 md:border-l md:pl-8 md:pt-0 xl:pl-10">
        {aside}
      </div>
    </div>
  );
}

/** Educational reading column, held at a comfortable measure. */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("measure space-y-3 text-body text-soft", className)}>
      {children}
    </div>
  );
}

/** Single hairline divider. Use instead of enclosing a group in a border. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-hairline", className)} />;
}

/**
 * Quiet supporting metadata. Sentence case, no badge chrome.
 * Mono is reserved for structured values, so this stays in the body face.
 */
export function Meta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-meta text-muted", className)}>{children}</span>;
}

/**
 * Uppercase eyebrow. Capped at a few words per the typographic rule - never a
 * sentence. Used for stable structural labels such as a program context.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("block text-label text-faint", className)}>
      {children}
    </span>
  );
}
