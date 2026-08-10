/**
 * Expanded body for a portion disclosure. Catalogue guidance and swap
 * explanations are separate: missing guidance stays empty rather than invented.
 */
export function PortionDetail({
  why,
  adjustment,
}: {
  why: string | null;
  adjustment: string | null;
}) {
  if (!why && !adjustment) return null;

  return (
    <div className="space-y-3">
      {adjustment ? <p>{adjustment}</p> : null}
      {why ? <p>{why}</p> : null}
    </div>
  );
}

/** True when a row should expose a disclosure control. */
export function hasPortionDetail(
  why: string | null | undefined,
  adjustment: string | null | undefined,
): boolean {
  return Boolean(why || adjustment);
}
