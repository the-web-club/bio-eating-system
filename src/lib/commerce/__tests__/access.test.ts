import { describe, expect, it } from "vitest";
import {
  activeSlugsFromGrants,
  isGrantActive,
  legacyFlagsFromActiveSlugs,
  legacySlugsFromAccessFlags,
  portalEntitlementsFromLegacy,
  portalProductAccessFromGrants,
} from "@/lib/commerce/access";
import { MASTER_PORTAL_CATALOG, PRODUCT_SLUGS } from "@/lib/commerce/catalog";

describe("commerce access", () => {
  it("maps active product slugs to legacy entitlement flags", () => {
    const flags = legacyFlagsFromActiveSlugs([
      PRODUCT_SLUGS.biologicalOs,
      PRODUCT_SLUGS.labReference,
    ]);
    expect(flags.corePlan).toBe(true);
    expect(flags.labReference).toBe(true);
    expect(flags.weeklyRotation).toBe(false);
    expect(flags.coaching).toBe(false);
  });

  it("derives portal entitlements from legacy flags", () => {
    expect(
      portalEntitlementsFromLegacy({
        corePlan: true,
        weeklyRotation: false,
        labReference: true,
        coaching: true,
        hormoneModule: false,
        nervousModule: false,
      }),
    ).toEqual({
      corePlan: true,
      weeklyRotation: false,
      labReference: true,
      coaching: true,
    });
  });

  it("respects grant end dates", () => {
    const now = new Date("2026-08-12T12:00:00Z");
    expect(
      isGrantActive({
        status: "active",
        startsAt: new Date("2026-08-01T00:00:00Z"),
        endsAt: new Date("2026-08-10T00:00:00Z"),
        now,
      }),
    ).toBe(false);
  });

  it("builds master portal access cards from grants", () => {
    const grants = [
      {
        status: "active",
        startsAt: new Date("2026-01-01T00:00:00Z"),
        endsAt: null,
        product: { slug: PRODUCT_SLUGS.biologicalOs },
      },
    ];
    const access = portalProductAccessFromGrants(
      grants,
      MASTER_PORTAL_CATALOG.map((p) => p.slug),
    );
    const bio = access.find((a) => a.slug === PRODUCT_SLUGS.biologicalOs);
    const offer2 = access.find((a) => a.slug === PRODUCT_SLUGS.offer2);
    expect(bio?.unlocked).toBe(true);
    expect(offer2?.unlocked).toBe(false);
  });

  it("isolates user A vs user B entitlement sets", () => {
    const userA = activeSlugsFromGrants([
      {
        status: "active",
        startsAt: new Date(0),
        endsAt: null,
        product: { slug: PRODUCT_SLUGS.biologicalOs },
      },
    ]);
    const userB = activeSlugsFromGrants([
      {
        status: "active",
        startsAt: new Date(0),
        endsAt: null,
        product: { slug: PRODUCT_SLUGS.biologicalOs },
      },
      {
        status: "active",
        startsAt: new Date(0),
        endsAt: null,
        product: { slug: PRODUCT_SLUGS.offer2 },
      },
    ]);
    expect(userA).toEqual([PRODUCT_SLUGS.biologicalOs]);
    expect(userB).toContain(PRODUCT_SLUGS.biologicalOs);
    expect(userB).toContain(PRODUCT_SLUGS.offer2);
    expect(userA).not.toContain(PRODUCT_SLUGS.offer2);
  });
});

describe("legacySlugsFromAccessFlags", () => {
  it("maps bundle-equivalent flags to multiple product slugs", () => {
    const slugs = legacySlugsFromAccessFlags({
      corePlan: true,
      weeklyRotation: true,
      labReference: true,
      coaching: false,
      hormoneModule: false,
      nervousModule: false,
    });
    expect(slugs.sort()).toEqual(
      [
        PRODUCT_SLUGS.biologicalOs,
        PRODUCT_SLUGS.weeklyEmail,
        PRODUCT_SLUGS.labReference,
      ].sort(),
    );
  });
});
