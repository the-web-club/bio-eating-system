import { PageHeader } from "@/components/portal/page-header";
import { Meta, PageSections, PageShell, Section } from "@/components/portal/layout";
import { loadDataSources } from "@/lib/admin/load-data-sources";

function formatWhen(date: Date | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatBool(value: boolean) {
  return value ? "yes" : "no";
}

export default async function AdminDataSourcesPage() {
  const data = await loadDataSources();

  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Data sources"
          description="Authoritative food and requirement source registry. Read-only."
        />

        <Section title="Production readiness">
          <p className="text-body text-foreground">{data.productionStatus.message}</p>
          <dl className="mt-s4 grid grid-cols-2 gap-x-s5 gap-y-s4 sm:grid-cols-3">
            <div>
              <dt className="text-meta text-muted">Approved food sources</dt>
              <dd className="mt-s1 text-body-lg tabular font-medium text-foreground">
                {data.productionStatus.approvedFoodSources}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-muted">Approved requirement sets</dt>
              <dd className="mt-s1 text-body-lg tabular font-medium text-foreground">
                {data.productionStatus.approvedRequirementSets}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-muted">Dev-only foods</dt>
              <dd className="mt-s1 text-body-lg tabular font-medium text-foreground">
                {data.productionStatus.devOnlyFoodCount}
              </dd>
            </div>
          </dl>
        </Section>

        <Section ruled title="Registered sources">
          {data.sources.length === 0 ? (
            <p className="text-body text-muted">No sources registered yet.</p>
          ) : (
            <div className="overflow-x-auto border-t border-hairline">
              <table className="w-full min-w-[960px] text-left text-body">
                <thead>
                  <tr className="border-b border-hairline text-meta text-muted">
                    <th className="py-s2 pr-s3 font-normal">Source</th>
                    <th className="py-s2 pr-s3 font-normal">Dataset</th>
                    <th className="py-s2 pr-s3 font-normal">Version</th>
                    <th className="py-s2 pr-s3 font-normal">License</th>
                    <th className="py-s2 pr-s3 font-normal">Commercial</th>
                    <th className="py-s2 pr-s3 font-normal">Storage</th>
                    <th className="py-s2 pr-s3 font-normal">Transform</th>
                    <th className="py-s2 pr-s3 font-normal">Display</th>
                    <th className="py-s2 pr-s3 font-normal">Redistribute</th>
                    <th className="py-s2 pr-s3 font-normal">Verified</th>
                    <th className="py-s2 pr-s3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {data.sources.map((source) => (
                    <tr key={source.id}>
                      <td className="py-s3 pr-s3 align-top text-foreground">
                        <p>{source.name}</p>
                        <p className="text-meta text-muted">{source.provider}</p>
                        <p className="text-meta text-muted">{source.sourceKey}</p>
                        {source.devOnly ? <Meta>DEV ONLY</Meta> : null}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">{source.datasetName}</td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        {source.datasetVersion ?? "-"}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        <p>{source.licenseName ?? source.license}</p>
                        {source.licenseUrl ? (
                          <a className="text-accent-text underline" href={source.licenseUrl}>
                            License URL
                          </a>
                        ) : null}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        {formatBool(source.commercialUseAllowed)}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        {formatBool(source.storageAllowed)}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        {formatBool(source.transformationAllowed)}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        {formatBool(source.customerDisplayAllowed)}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        {formatBool(source.redistributionAllowed)}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-muted">
                        <p>{formatWhen(source.termsVerifiedAt)}</p>
                        <p>{source.verificationMethod ?? "-"}</p>
                        {source.termsUrl ? (
                          <a className="text-accent-text underline" href={source.termsUrl}>
                            Terms URL
                          </a>
                        ) : null}
                      </td>
                      <td className="py-s3 pr-s3 align-top text-foreground">
                        <p>{source.status}</p>
                        <p className="text-meta text-muted">
                          Imported: {formatWhen(source.importedAt)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </PageSections>
    </PageShell>
  );
}
