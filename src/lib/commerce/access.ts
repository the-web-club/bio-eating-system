import type { Prisma } from "@/generated/prisma/client";
import { PRODUCT_SLUGS, type ProductSlug } from "@/lib/commerce/catalog";

export type LegacyAccessFlags = {
  corePlan: boolean;
  weeklyRotation: boolean;
  labReference: boolean;
  coaching: boolean;
  hormoneModule: boolean;
  nervousModule: boolean;
};

export type PortalProductAccess = {
  slug: ProductSlug;
  unlocked: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

const SLUG_TO_LEGACY: Partial<Record<ProductSlug, keyof LegacyAccessFlags>> = {
  [PRODUCT_SLUGS.biologicalOs]: "corePlan",
  [PRODUCT_SLUGS.weeklyEmail]: "weeklyRotation",
  [PRODUCT_SLUGS.labReference]: "labReference",
  [PRODUCT_SLUGS.vipCoaching]: "coaching",
  [PRODUCT_SLUGS.hormoneModule]: "hormoneModule",
  [PRODUCT_SLUGS.nervousModule]: "nervousModule",
};

export function emptyLegacyAccessFlags(): LegacyAccessFlags {
  return {
    corePlan: false,
    weeklyRotation: false,
    labReference: false,
    coaching: false,
    hormoneModule: false,
    nervousModule: false,
  };
}

export function legacyFlagsFromActiveSlugs(slugs: readonly string[]): LegacyAccessFlags {
  const flags = emptyLegacyAccessFlags();
  const set = new Set(slugs);
  for (const [slug, key] of Object.entries(SLUG_TO_LEGACY) as [ProductSlug, keyof LegacyAccessFlags][]) {
    if (set.has(slug)) flags[key] = true;
  }
  return flags;
}

export type PortalEntitlements = {
  corePlan: boolean;
  weeklyRotation: boolean;
  labReference: boolean;
  coaching: boolean;
};

export function portalEntitlementsFromLegacy(flags: LegacyAccessFlags): PortalEntitlements {
  return {
    corePlan: flags.corePlan,
    weeklyRotation: flags.weeklyRotation,
    labReference: flags.labReference,
    coaching: flags.coaching,
  };
}

export function isGrantActive(args: {
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  now?: Date;
}): boolean {
  if (args.status !== "active") return false;
  const now = args.now ?? new Date();
  if (args.startsAt > now) return false;
  if (args.endsAt != null && args.endsAt <= now) return false;
  return true;
}

export function activeSlugsFromGrants(
  grants: readonly {
    status: string;
    startsAt: Date;
    endsAt: Date | null;
    product: { slug: string };
  }[],
  now?: Date,
): string[] {
  const active = grants.filter((g) =>
    isGrantActive({
      status: g.status,
      startsAt: g.startsAt,
      endsAt: g.endsAt,
      now,
    }),
  );
  return [...new Set(active.map((g) => g.product.slug))];
}

export function portalProductAccessFromGrants(
  grants: readonly {
    status: string;
    startsAt: Date;
    endsAt: Date | null;
    product: { slug: string };
  }[],
  catalogSlugs: readonly ProductSlug[],
  now?: Date,
): PortalProductAccess[] {
  const activeSet = new Set(activeSlugsFromGrants(grants, now));
  return catalogSlugs.map((slug) => {
    const match = grants.find(
      (g) =>
        g.product.slug === slug &&
        isGrantActive({
          status: g.status,
          startsAt: g.startsAt,
          endsAt: g.endsAt,
          now,
        }),
    );
    return {
      slug,
      unlocked: activeSet.has(slug),
      startsAt: match?.startsAt ?? null,
      endsAt: match?.endsAt ?? null,
    };
  });
}

export type CommerceTx = Prisma.TransactionClient;

export function legacySlugsFromAccessFlags(flags: LegacyAccessFlags): ProductSlug[] {
  const slugs: ProductSlug[] = [];
  if (flags.corePlan) slugs.push(PRODUCT_SLUGS.biologicalOs);
  if (flags.weeklyRotation) slugs.push(PRODUCT_SLUGS.weeklyEmail);
  if (flags.labReference) slugs.push(PRODUCT_SLUGS.labReference);
  if (flags.coaching) slugs.push(PRODUCT_SLUGS.vipCoaching);
  if (flags.hormoneModule) slugs.push(PRODUCT_SLUGS.hormoneModule);
  if (flags.nervousModule) slugs.push(PRODUCT_SLUGS.nervousModule);
  return slugs;
}

export function legacyFlagsToEntitlementUpdate(flags: LegacyAccessFlags) {
  return {
    corePlan: flags.corePlan,
    weeklyRotation: flags.weeklyRotation,
    labReference: flags.labReference,
    coaching: flags.coaching,
    hormoneModule: flags.hormoneModule,
    nervousModule: flags.nervousModule,
  };
}
