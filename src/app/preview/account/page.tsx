import { PageSections, PageShell, Section } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ROWS = [
  { label: "Name", value: "Maya Example" },
  { label: "Email", value: "maya@example.com" },
];

export default function PreviewAccountPage() {
  return (
    <PageShell width="reading">
      <PageSections>
        <PageHeader
          title="Account"
          description="Your sign-in details, email preferences and data rights."
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

        <Section ruled title="Privacy">
          <div className="space-y-group">
            <div className="space-y-3">
              <Checkbox
                id="preview-marketing"
                label="Send me the weekly shopping list by email."
                checked
                disabled
                disabledReason="Inactive in the design preview"
              />
              <p className="text-small text-faint">
                Health data consent health-data-consent-v1, recorded 1 Jan 2026.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="compact"
                disabled
                disabledReason="Inactive in the design preview"
              >
                Download my data
              </Button>
              <Button
                variant="danger"
                size="compact"
                disabled
                disabledReason="Inactive in the design preview"
              >
                Delete account
              </Button>
            </div>
          </div>
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
  );
}
