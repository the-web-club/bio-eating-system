export type CheckInPoint = {
  energy: number;
  hunger: number;
  satisfaction: number;
  adherence: number;
  weightKg: number | null;
  createdAt: string;
};

export function ProgressMetrics({
  currentWeight,
  checkIns,
}: {
  currentWeight: number | null;
  checkIns: CheckInPoint[];
}) {
  const latest = checkIns[0];
  const avg = (field: keyof Pick<CheckInPoint, "energy" | "hunger" | "satisfaction" | "adherence">) => {
    if (!checkIns.length) return null;
    return (
      Math.round(
        (checkIns.reduce((s, c) => s + c[field], 0) / checkIns.length) * 10,
      ) / 10
    );
  };

  return (
    <dl className="divide-y divide-hairline border-t border-hairline">
      <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s4">
        <dt className="text-meta text-muted">Weight trend</dt>
        <dd className="text-body text-foreground">
          {currentWeight != null ? `${currentWeight} kg` : "-"}
          {checkIns.length > 1 && checkIns[0]?.weightKg && checkIns[1]?.weightKg ? (
            <span className="ml-2 text-meta text-muted">
              (recent check-ins logged)
            </span>
          ) : null}
        </dd>
      </div>
      <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s4">
        <dt className="text-meta text-muted">Adherence</dt>
        <dd className="text-body text-foreground">{avg("adherence") ?? "-"} / 5</dd>
      </div>
      <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s4">
        <dt className="text-meta text-muted">Hunger</dt>
        <dd className="text-body text-foreground">{avg("hunger") ?? "-"} / 5</dd>
      </div>
      <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s4">
        <dt className="text-meta text-muted">Energy</dt>
        <dd className="text-body text-foreground">{avg("energy") ?? "-"} / 5</dd>
      </div>
      <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-s4 py-s4">
        <dt className="text-meta text-muted">Plan satisfaction</dt>
        <dd className="text-body text-foreground">
          {avg("satisfaction") ?? "-"} / 5
        </dd>
      </div>
      {!latest ? (
        <p className="py-3 text-meta text-muted">
          Complete a weekly check-in to populate these trends.
        </p>
      ) : null}
    </dl>
  );
}
