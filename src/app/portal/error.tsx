"use client";

import { AppShell } from "@/components/portal/app-shell";
import { PortalErrorState } from "@/components/portal/error-state";
import { PageShell } from "@/components/portal/layout";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";

/**
 * Boundary for the portal segment. The underlying error is never surfaced: it
 * can carry health data, which must not reach the client or a log line.
 */
export default function PortalError({ reset }: { reset: () => void }) {
  return (
    <AppShell title="Something went wrong">
      <PageShell width="reading">
        <PageHeader title="Something went wrong" />
        <div className="mt-group">
          <PortalErrorState
            title="This page did not load"
            action={
              <Button variant="secondary" size="compact" onClick={reset}>
                Try again
              </Button>
            }
          >
            Your plan is safe. Try again, and if it keeps failing, sign out and back
            in.
          </PortalErrorState>
        </div>
      </PageShell>
    </AppShell>
  );
}
