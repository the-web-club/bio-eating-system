/**
 * Product catalog slugs. Biological OS is product slug `biological-os`.
 * UI metadata lives here; grant state comes from the database.
 */

export const PRODUCT_SLUGS = {
  biologicalOs: "biological-os",
  weeklyEmail: "bio-weekly-email",
  labReference: "bio-lab-reference",
  vipCoaching: "vip-coaching-30d",
  offer2: "offer-2",
  offer3: "offer-3",
  hormoneModule: "hormone-module",
  nervousModule: "nervous-module",
} as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[keyof typeof PRODUCT_SLUGS];

export type CatalogProductDef = {
  slug: ProductSlug;
  name: string;
  description: string;
  kind: "one_time" | "subscription" | "coaching";
  sortOrder: number;
  /** Shown when the product is not yet available for purchase. */
  availability: "available" | "coming_soon" | "locked";
  homeHref?: string;
};

/** Master portal product cards in display order. */
export const MASTER_PORTAL_CATALOG: CatalogProductDef[] = [
  {
    slug: PRODUCT_SLUGS.biologicalOs,
    name: "Biological OS",
    description:
      "Your personalised food system: intake, daily plan, and optional weekly shopping support.",
    kind: "one_time",
    sortOrder: 10,
    availability: "available",
    homeHref: "/portal/plan",
  },
  {
    slug: PRODUCT_SLUGS.offer2,
    name: "Offer 2",
    description: "A future product module. Not available yet.",
    kind: "one_time",
    sortOrder: 20,
    availability: "locked",
  },
  {
    slug: PRODUCT_SLUGS.offer3,
    name: "Offer 3",
    description: "A future product module. Not available yet.",
    kind: "one_time",
    sortOrder: 30,
    availability: "locked",
  },
  {
    slug: PRODUCT_SLUGS.vipCoaching,
    name: "Personal coaching",
    description: "High-touch implementation support with a limited number of active places.",
    kind: "coaching",
    sortOrder: 40,
    availability: "available",
  },
];

export const SUPPORTING_PRODUCTS: CatalogProductDef[] = [
  {
    slug: PRODUCT_SLUGS.weeklyEmail,
    name: "Weekly shopping list email",
    description: "Optional weekly email with your shopping list when your schedule is active.",
    kind: "subscription",
    sortOrder: 50,
    availability: "available",
    homeHref: "/portal/weekly",
  },
  {
    slug: PRODUCT_SLUGS.labReference,
    name: "Biomarker reference",
    description: "Read-only educational lab reference material. Not a diagnosis.",
    kind: "one_time",
    sortOrder: 60,
    availability: "available",
    homeHref: "/portal/biomarkers",
  },
];

export const ALL_CATALOG_PRODUCTS: CatalogProductDef[] = [
  ...MASTER_PORTAL_CATALOG,
  ...SUPPORTING_PRODUCTS,
];

export function catalogProductBySlug(slug: string): CatalogProductDef | undefined {
  return ALL_CATALOG_PRODUCTS.find((p) => p.slug === slug);
}

/** Legacy SureCart SKU identifiers mapped in seed / SkuProductMap & SkuBundleMap. */
export const LEGACY_SKUS = {
  CORE_PLAN: "CORE_PLAN",
  CORE_PLAN_BUNDLE: "CORE_PLAN_BUNDLE",
  WEEKLY_ROTATION: "WEEKLY_ROTATION",
  LAB_REFERENCE: "LAB_REFERENCE",
} as const;

export const BUNDLE_SLUGS = {
  completeBiologicalSystem: "complete-biological-system",
} as const;
