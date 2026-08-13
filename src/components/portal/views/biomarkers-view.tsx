import { DisclosureRow } from "../disclosure-row";
import { PortalEmptyState } from "../empty-state";
import { InlineNote } from "../inline-note";
import { Eyebrow, PageSections, PageShell, Section, Split } from "../layout";
import { PageHeader } from "../page-header";

export type BiomarkerEntry = {
  id: string;
  name: string;
  reference: string | null;
  why: string | null;
  rationale: string | null;
};

export const BIOMARKER_DISCLAIMER =
  "This reference is educational. It does not replace advice from a qualified clinician, and the ranges are context rather than personal targets.";

/**
 * Educational reference interface: one compact row per marker on hairlines, the
 * rationale expanding in place, and the clinician notice permanently readable
 * without shouting.
 */
export function BiomarkersViewContent({ markers }: { markers: BiomarkerEntry[] }) {
  return (
    <Split
      main={
        markers.length ? (
          <Section title="Marker index">
            <ul className="divide-y divide-hairline border-t border-hairline">
              {markers.map((marker) => (
                <DisclosureRow
                  key={marker.id}
                  title={marker.name}
                  detailLabel={`${marker.name} rationale`}
                  summary={
                    <>
                      {marker.why ??
                        "A short purpose appears here once the entry is published."}
                      {marker.reference ? (
                        <span className="mt-s1 block text-meta tabular text-faint sm:hidden">
                          {marker.reference}
                        </span>
                      ) : null}
                    </>
                  }
                  value={
                    marker.reference ? (
                      <span className="hidden text-meta tabular text-muted sm:inline">
                        {marker.reference}
                      </span>
                    ) : null
                  }
                >
                  {marker.rationale ? <p>{marker.rationale}</p> : null}
                </DisclosureRow>
              ))}
            </ul>
          </Section>
        ) : (
          <PortalEmptyState tone="default" title="No entries published yet">
            No biomarker entries are available on your account yet.
          </PortalEmptyState>
        )
      }
      aside={
        <div className="space-y-s5">
          <div>
            <Eyebrow>How to read this</Eyebrow>
            <p className="mt-s2 text-body text-soft">
              Entries are reference-only. There is no target, no score and no pass
              or fail, the context is there to help you have a better conversation
              with your clinician.
            </p>
          </div>
          <div className="border-t border-hairline pt-s4">
            <InlineNote>{BIOMARKER_DISCLAIMER}</InlineNote>
          </div>
        </div>
      }
    />
  );
}

export function BiomarkersView({ markers }: { markers: BiomarkerEntry[] }) {
  return (
    <PageShell>
      <PageSections>
        <PageHeader
          title="Biomarkers"
          description="What each marker describes, and the reference context around it."
        />
        <BiomarkersViewContent markers={markers} />
      </PageSections>
    </PageShell>
  );
}
