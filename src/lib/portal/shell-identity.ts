import { rotationPosition, weekLabel } from "@/lib/portal/format";
import { loadPortalData } from "@/lib/portal/load-portal-data";

export type PortalShellIdentity = {
  weekLabel?: string;
  programLabel?: string;
  rotationPosition?: number;
  authoredWeeks?: number;
};

/**
 * Identity props for the persistent portal shell. Loaded once in the segment
 * layout so the rail does not resize when individual pages mount.
 */
export async function loadPortalShellIdentity(): Promise<PortalShellIdentity> {
  try {
    const data = await loadPortalData();
    if (!data.entitlements.corePlan) {
      return {};
    }

    return {
      weekLabel: weekLabel(data.week),
      programLabel: "Core plan",
      rotationPosition: rotationPosition(data.week, data.authoredWeeks),
      authoredWeeks: data.authoredWeeks,
    };
  } catch {
    return {};
  }
}
