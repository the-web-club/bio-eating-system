"use client";

import { useState } from "react";
import { Section } from "@/components/portal/layout";
import { ModuleRow, ModuleRows } from "@/components/portal/module-row";
import { UpgradeDialog } from "@/components/portal/upgrade-dialog";
import {
  MASTER_PORTAL_CATALOG,
  PRODUCT_SLUGS,
  catalogProductBySlug,
} from "@/lib/commerce/catalog";
import type { PortalProductAccess } from "@/lib/commerce/access";

type DialogProduct = (typeof MASTER_PORTAL_CATALOG)[number]["slug"] | null;

function accessFor(
  productAccess: PortalProductAccess[],
  slug: string,
): PortalProductAccess | undefined {
  return productAccess.find((p) => p.slug === slug);
}

function productHref(basePath: string, homeHref?: string): string {
  if (!homeHref) return `${basePath}/programs`;
  if (homeHref.startsWith(basePath)) return homeHref;
  return homeHref;
}

/**
 * Master Personal Portal product grid. Biological OS is Offer 1; future
 * products render locked or coming soon from catalog metadata.
 */
export function MasterPortalGrid({
  productAccess,
  hasPlan,
  basePath = "/portal",
}: {
  productAccess: PortalProductAccess[];
  hasPlan: boolean;
  basePath?: string;
}) {
  const [dialog, setDialog] = useState<DialogProduct>(null);
  const close = (open: boolean) => !open && setDialog(null);

  const biological = accessFor(productAccess, PRODUCT_SLUGS.biologicalOs);
  const coaching = accessFor(productAccess, PRODUCT_SLUGS.vipCoaching);

  const dialogProduct = dialog ? catalogProductBySlug(dialog) : null;

  return (
    <div className="space-y-s6">
      <Section
        title="Your products"
        description="What you own in the portal. Each product opens its own experience when unlocked."
      >
        <ModuleRows>
          {MASTER_PORTAL_CATALOG.map((product) => {
            const access = accessFor(productAccess, product.slug);
            const unlocked = access?.unlocked ?? false;
            const def = catalogProductBySlug(product.slug)!;

            if (unlocked && product.slug === PRODUCT_SLUGS.biologicalOs) {
              return (
                <ModuleRow
                  key={product.slug}
                  title={def.name}
                  description={def.description}
                  state="included"
                  hint={hasPlan ? "Active" : "Complete setup"}
                  href={hasPlan ? `${basePath}/plan` : `${basePath}/intake`}
                />
              );
            }

            if (unlocked && product.slug === PRODUCT_SLUGS.vipCoaching) {
              return (
                <ModuleRow
                  key={product.slug}
                  title={def.name}
                  description={def.description}
                  state="included"
                  hint="Coaching access"
                  href={`${basePath}/account`}
                />
              );
            }

            if (unlocked) {
              return (
                <ModuleRow
                  key={product.slug}
                  title={def.name}
                  description={def.description}
                  state="included"
                  hint="Unlocked"
                  href={productHref(basePath, def.homeHref)}
                />
              );
            }

            if (product.availability === "coming_soon") {
              return (
                <ModuleRow
                  key={product.slug}
                  title={def.name}
                  description={def.description}
                  state="soon"
                  hint="Coming soon"
                />
              );
            }

            return (
              <ModuleRow
                key={product.slug}
                title={def.name}
                description={def.description}
                state="locked"
                hint="Unlock access"
                onUnlock={() => setDialog(product.slug)}
              />
            );
          })}
        </ModuleRows>
      </Section>

      {!biological?.unlocked ? (
        <p className="text-meta text-muted">
          Biological OS unlocks after purchase on the website. Your daily plan and setup live
          inside that product.
        </p>
      ) : null}

      <UpgradeDialog
        open={dialog === PRODUCT_SLUGS.biologicalOs}
        onOpenChange={close}
        title="Biological OS"
        value="Personal food system, intake, daily plan, and optional weekly shopping support."
        includes={[
          "Structured onboarding",
          "Personal daily plan",
          "Screening safety limits",
        ]}
      />

      <UpgradeDialog
        open={dialog === PRODUCT_SLUGS.offer2 || dialog === PRODUCT_SLUGS.offer3}
        onOpenChange={close}
        title={dialogProduct?.name ?? "Product"}
        value="This offer is not available yet. It will appear here when it launches."
        includes={["Reserved place in the master portal", "No change to your current products"]}
      />

      <UpgradeDialog
        open={dialog === PRODUCT_SLUGS.vipCoaching}
        onOpenChange={close}
        title="Personal coaching"
        value="Limited 30-day implementation support. Places are capped."
        includes={[
          "Private coach review",
          "Plan adjustments during the engagement",
          "Your purchased products stay yours after coaching ends",
        ]}
      />

      {coaching?.unlocked ? null : (
        <p className="text-meta text-faint">
          Coaching is a separate product from Biological OS. Purchasing one does not automatically
          include the other.
        </p>
      )}
    </div>
  );
}
