import { ProgressLine } from "./progress-line";

/**
 * Identity strip for the product rail: program name, week in the authored
 * rotation, and a quiet progress reading. No product jargon about authorship.
 */
export function ProgramIdentity({
  programLabel,
  weekLabel,
  rotationPosition,
  authoredWeeks,
  className,
}: {
  programLabel?: string;
  weekLabel?: string;
  rotationPosition?: number;
  authoredWeeks?: number;
  className?: string;
}) {
  if (!programLabel && !weekLabel) return null;

  const hasRotation =
    rotationPosition != null &&
    authoredWeeks != null &&
    authoredWeeks > 0;

  const weekReading =
    weekLabel && hasRotation
      ? `${weekLabel} of ${String(authoredWeeks).padStart(2, "0")}`
      : weekLabel;

  return (
    <div className={className}>
      {programLabel ? (
        <p className="u-caps text-small text-soft">{programLabel}</p>
      ) : null}
      {weekReading ? (
        <p className="mt-0.5 font-meta text-meta tabular text-faint">
          {weekReading}
        </p>
      ) : null}
      {hasRotation ? (
        <div className="mt-3">
          <ProgressLine
            value={rotationPosition}
            max={authoredWeeks}
            label="Your rotation"
            reading={`${rotationPosition} of ${authoredWeeks}`}
          />
        </div>
      ) : null}
    </div>
  );
}
