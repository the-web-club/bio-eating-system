import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Composition primitives. Structure comes from typography, spacing, alignment
 * and hairline rules - not from nested containers. A surface change or a border
 * is opt-in and only earned by genuinely interactive objects.
 */

/**
 * Page canvas. Owns horizontal gutters and the vertical rhythm between major
 * sections. The content pair is centred within the shell.
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
        "mx-auto w-full px-gutter py-s5 sm:px-8 sm:py-s5 xl:px-10",
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
  return <div className={cn("space-y-s6", className)}>{children}</div>;
}

/** Rhythm between blocks inside a route body or section. */
export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-s5", className)}>{children}</div>;
}

/** Body and meal prose. Nothing wider than a comfortable reading measure. */
export function ContentMeasure({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("measure max-w-full min-w-0", className)}>{children}</div>;
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
    <Tag className={cn(ruled && "border-t border-hairline pt-s5", className)}>
      {hasHeading ? (
        <div className="mb-s2 flex flex-wrap items-baseline justify-between gap-x-s4 gap-y-s2">
          <div className="min-w-0">
            {title ? (
              <h2 className={cn("text-body-lg font-semibold text-foreground", headingClassName)}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-s1 measure text-body text-muted">{description}</p>
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
 * Split composition. Primary content leads at reading measure; supporting
 * context sits alongside it on md+ and stacks below on narrow viewports.
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
        "grid gap-s5 md:grid-cols-[minmax(0,1.6fr)_minmax(14rem,1fr)] md:gap-s5",
        "xl:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]",
        className,
      )}
    >
      <div className="min-w-0">{main}</div>
      <div className="min-w-0 space-y-s5 border-t border-hairline pt-s5 md:border-t-0 md:border-l md:pl-s5 md:pt-0">
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
    <div className={cn("measure space-y-s4 text-body text-soft", className)}>
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
