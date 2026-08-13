import { PageHeader } from "@/components/portal/page-header";
import { Meta, PageSections, PageShell, Section } from "@/components/portal/layout";
import { loadFoodImports } from "@/lib/admin/load-food-imports";

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminFoodImportsPage() {
  const data = await loadFoodImports();

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Food data"
          description="Import status and fixture source metadata. Read-only."
        />

        <Section title="Current dataset">
          <dl className="grid grid-cols-2 gap-x-s5 gap-y-s4 sm:grid-cols-3">
            <div>
              <dt className="text-meta text-muted">Active foods</dt>
              <dd className="mt-s1 text-body-lg tabular font-medium text-foreground">
                {data.foodCount}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-muted">Nutrients tracked</dt>
              <dd className="mt-s1 text-body-lg tabular font-medium text-foreground">
                {data.nutrientCount}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-muted">Requirement set</dt>
              <dd className="mt-s1 text-body text-foreground">
                {data.requirementSet?.version ?? "None imported"}
              </dd>
              {data.requirementSet ? (
                <p className="mt-s1 text-meta text-muted">
                  Status: {data.requirementSet.reviewStatus}
                  {data.requirementSet.devOnly ? " · DEV ONLY" : ""}
                  {data.requirementSet.reviewer
                    ? ` · Reviewer: ${data.requirementSet.reviewer}`
                    : ""}
                </p>
              ) : null}
            </div>
          </dl>
          <p className="mt-s4 text-meta text-muted">
            Fixture data only. Production nutrition values require dietitian review before launch.
          </p>
        </Section>

        <Section ruled title="Import runs">
          {data.imports.length === 0 ? (
            <p className="text-body text-muted">No imports recorded yet.</p>
          ) : (
            <ul className="divide-y divide-hairline border-t border-hairline">
              {data.imports.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-s4 gap-y-1 py-s2"
                >
                  <div className="min-w-0">
                    <p className="text-body text-foreground">
                      {entry.source} · {entry.sourceVersion}
                    </p>
                    <p className="text-meta text-muted">
                      {entry.status} · {entry.rowCount} rows
                    </p>
                    {entry.error ? (
                      <p className="mt-s1 text-meta text-danger">{entry.error}</p>
                    ) : null}
                  </div>
                  <Meta>{formatWhen(entry.importDate)}</Meta>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </PageSections>
    </PageShell>
  );
}
