import { db } from "@/lib/db";
import {
  activeSlugsFromGrants,
  legacyFlagsFromActiveSlugs,
  legacyFlagsToEntitlementUpdate,
  legacySlugsFromAccessFlags,
  portalEntitlementsFromLegacy,
  portalProductAccessFromGrants,
  type CommerceTx,
  type LegacyAccessFlags,
  type PortalProductAccess,
} from "@/lib/commerce/access";
import {
  ALL_CATALOG_PRODUCTS,
  MASTER_PORTAL_CATALOG,
  PRODUCT_SLUGS,
  type ProductSlug,
} from "@/lib/commerce/catalog";
import type { PortalEntitlements } from "@/lib/commerce/access";

const grantSelect = {
  status: true,
  startsAt: true,
  endsAt: true,
  product: { select: { slug: true, id: true, name: true } },
} as const;

export async function loadUserGrants(userId: string) {
  return db.entitlementGrant.findMany({
    where: { userId },
    select: grantSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function resolveLegacyAccessFlags(userId: string): Promise<LegacyAccessFlags> {
  const grants = await loadUserGrants(userId);
  return legacyFlagsFromActiveSlugs(activeSlugsFromGrants(grants));
}

export async function resolvePortalEntitlements(userId: string): Promise<PortalEntitlements> {
  const flags = await resolveLegacyAccessFlags(userId);
  return portalEntitlementsFromLegacy(flags);
}

export async function resolveMasterPortalAccess(userId: string): Promise<PortalProductAccess[]> {
  const grants = await loadUserGrants(userId);
  const slugs = MASTER_PORTAL_CATALOG.map((p) => p.slug);
  return portalProductAccessFromGrants(grants, slugs);
}

export async function resolveAllProductAccess(userId: string): Promise<PortalProductAccess[]> {
  const grants = await loadUserGrants(userId);
  const slugs = ALL_CATALOG_PRODUCTS.map((p) => p.slug);
  return portalProductAccessFromGrants(grants, slugs);
}

export async function userHasProduct(userId: string, slug: ProductSlug): Promise<boolean> {
  const grants = await loadUserGrants(userId);
  return activeSlugsFromGrants(grants).includes(slug);
}

/**
 * Keeps the legacy Entitlement row aligned with active grants during migration.
 */
export async function syncLegacyEntitlementFromGrants(
  userId: string,
  tx: CommerceTx = db,
) {
  const grants = await tx.entitlementGrant.findMany({
    where: { userId },
    select: grantSelect,
  });
  const flags = legacyFlagsFromActiveSlugs(activeSlugsFromGrants(grants));
  const data = legacyFlagsToEntitlementUpdate(flags);

  await tx.entitlement.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  if (flags.weeklyRotation) {
    await tx.rotationSchedule.upsert({
      where: { userId },
      create: { userId, active: true },
      update: { active: true },
    });
  } else {
    await tx.rotationSchedule.updateMany({
      where: { userId },
      data: { active: false },
    });
  }

  return flags;
}

async function productIdsBySlugs(slugs: ProductSlug[], tx: CommerceTx) {
  const products = await tx.product.findMany({
    where: { slug: { in: [...slugs] } },
    select: { id: true, slug: true },
  });
  const map = new Map(products.map((p) => [p.slug, p.id]));
  const missing = slugs.filter((slug) => !map.has(slug));
  if (missing.length) {
    throw new Error(`unknown_product:${missing.join(",")}`);
  }
  return map;
}

/**
 * Replace the user's active grant set with exactly `activeSlugs`.
 * Used by admin access editor.
 */
export async function setUserProductGrants(args: {
  userId: string;
  activeSlugs: ProductSlug[];
  purchaseId?: string;
  actor: string;
  note?: string | null;
  tx?: CommerceTx;
}) {
  const run = async (tx: CommerceTx) => {
    const before = legacyFlagsFromActiveSlugs(
      activeSlugsFromGrants(await tx.entitlementGrant.findMany({ where: { userId: args.userId }, select: grantSelect })),
    );

    const desired = new Set(args.activeSlugs);
    const idBySlug = await productIdsBySlugs(args.activeSlugs, tx);

    const existing = await tx.entitlementGrant.findMany({
      where: { userId: args.userId },
      select: {
        id: true,
        status: true,
        product: { select: { slug: true, id: true } },
      },
    });

    for (const grant of existing) {
      const slug = grant.product.slug as ProductSlug;
      const shouldBeActive = desired.has(slug);
      if (shouldBeActive && grant.status !== "active") {
        await tx.entitlementGrant.update({
          where: { id: grant.id },
          data: { status: "active", endsAt: null },
        });
      } else if (!shouldBeActive && grant.status === "active") {
        await tx.entitlementGrant.update({
          where: { id: grant.id },
          data: { status: "revoked", endsAt: new Date() },
        });
      }
    }

    for (const slug of args.activeSlugs) {
      const productId = idBySlug.get(slug)!;
      const hasActive = existing.some(
        (g) => g.product.id === productId && g.status === "active",
      );
      if (!hasActive) {
        await tx.entitlementGrant.create({
          data: {
            userId: args.userId,
            productId,
            purchaseId: args.purchaseId,
            status: "active",
          },
        });
      }
    }

    const after = await syncLegacyEntitlementFromGrants(args.userId, tx);

    await tx.auditEvent.create({
      data: {
        userId: args.userId,
        action: "grants.updated",
        actor: args.actor,
        detail: {
          before,
          after,
          slugs: args.activeSlugs,
          note: args.note ?? null,
        },
      },
    });

    return after;
  };

  if (args.tx) return run(args.tx);
  return db.$transaction(run);
}

/**
 * Add grants for a SKU without revoking existing products. Webhook path.
 */
export async function mergeProductGrantsForSku(args: {
  userId: string;
  sku: string;
  purchaseId?: string;
  actor: string;
}) {
  const bundleMap = await db.skuBundleMap.findUnique({
    where: { sku: args.sku },
    include: { bundle: { include: { items: { include: { product: true } } } } },
  });

  let incoming: ProductSlug[] = [];
  if (bundleMap) {
    incoming = bundleMap.bundle.items.map((i) => i.product.slug as ProductSlug);
  } else {
    const productMap = await db.skuProductMap.findUnique({
      where: { sku: args.sku },
      include: { product: true },
    });
    if (!productMap) {
      return { ok: false as const, error: "unmapped_sku" as const };
    }
    incoming = [productMap.product.slug as ProductSlug];
  }

  const current = activeSlugsFromGrants(await loadUserGrants(args.userId));
  const merged = [...new Set([...current, ...incoming])] as ProductSlug[];

  await db.$transaction(async (tx) => {
    const idBySlug = await productIdsBySlugs(merged, tx);
    for (const slug of incoming) {
      const productId = idBySlug.get(slug)!;
      const existingActive = await tx.entitlementGrant.findFirst({
        where: { userId: args.userId, productId, status: "active" },
      });
      if (!existingActive) {
        await tx.entitlementGrant.create({
          data: {
            userId: args.userId,
            productId,
            purchaseId: args.purchaseId,
            status: "active",
          },
        });
      }
    }
    await syncLegacyEntitlementFromGrants(args.userId, tx);
    await tx.auditEvent.create({
      data: {
        userId: args.userId,
        action: "entitlement.granted",
        actor: args.actor,
        detail: { sku: args.sku, slugs: incoming, purchaseId: args.purchaseId ?? null },
      },
    });
  });

  return { ok: true as const, slugs: merged };
}

export { legacySlugsFromAccessFlags } from "@/lib/commerce/access";

export function checkoutUrlForProduct(checkoutBase: string | undefined, slug: ProductSlug): string | null {
  if (!checkoutBase) return null;
  const url = new URL(checkoutBase);
  url.searchParams.set("product", slug);
  return url.toString();
}
