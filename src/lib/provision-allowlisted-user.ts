import { PRODUCT_SLUGS } from "@/lib/commerce/catalog";
import { setUserProductGrants } from "@/lib/commerce/grants";
import { db } from "@/lib/db";
import {
  displayNameFromEmail,
  isSignupAllowlisted,
  normalizeEmail,
} from "@/lib/signup-allowlist";

const ALLOWLIST_PRODUCTS = [
  PRODUCT_SLUGS.biologicalOs,
  PRODUCT_SLUGS.weeklyEmail,
  PRODUCT_SLUGS.labReference,
] as const;

/**
 * Creates an allowlisted account with Biological OS entitlements so the person
 * can complete intake and walk the portal. Idempotent: a second call for an
 * existing email is a no-op.
 */
export async function provisionAllowlistedUser(
  email: string,
): Promise<"created" | "exists" | "rejected"> {
  const normalized = normalizeEmail(email);
  if (!isSignupAllowlisted(normalized)) return "rejected";

  const existing = await db.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  if (existing) return "exists";

  const user = await db.user.create({
    data: {
      email: normalized,
      name: displayNameFromEmail(normalized),
      locale: "EN",
      entitlements: {
        create: {
          corePlan: true,
          weeklyRotation: true,
          labReference: true,
        },
      },
      schedule: {
        create: { active: true },
      },
    },
    select: { id: true },
  });

  try {
    await setUserProductGrants({
      userId: user.id,
      activeSlugs: [...ALLOWLIST_PRODUCTS],
      actor: "auth:allowlist",
    });
  } catch {
    // Catalog may not be seeded yet; legacy Entitlement row still grants access.
  }

  await db.auditEvent.create({
    data: {
      userId: user.id,
      action: "account.allowlist_provisioned",
      actor: "auth:allowlist",
      detail: { email: normalized },
    },
  });

  return "created";
}
