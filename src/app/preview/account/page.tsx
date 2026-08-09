import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { PreviewShell } from "../preview-shell";

const ROWS = [
  { label: "Name", value: "Maya Example" },
  { label: "Email", value: "maya@example.com" },
];

export default function PreviewAccountPage() {
  return (
    <PreviewShell title="Account">
      <PageShell width="reading">
        <PageSections>
          <PageHeader
            title="Account"
            description="Who you are signed in as, and how to sign out."
          />

          <Section title="Signed in as">
            <dl className="divide-y divide-hairline border-t border-hairline">
              {ROWS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-4 py-3"
                >
                  <dt className="text-small text-muted">{row.label}</dt>
                  <dd className="min-w-0 break-words text-body text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section ruled title="Session">
            <Button
              variant="secondary"
              size="compact"
              disabled
              disabledReason="Sign out is inactive in the design preview"
            >
              Sign out
            </Button>
          </Section>
        </PageSections>
      </PageShell>
    </PreviewShell>
  );
}
