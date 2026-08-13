import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  BUNDLE_SLUGS,
  LEGACY_SKUS,
  PRODUCT_SLUGS,
} from "../src/lib/commerce/catalog";
import { legacySlugsFromAccessFlags } from "../src/lib/commerce/access";
import { importFoodSourceBundle } from "../src/lib/nutrition-data/import-pipeline";
import { parseFoodSourceBundle } from "../src/lib/nutrition-data/schema";
import { seedDataSourceRegistry } from "../src/lib/nutrition-data/seed-registry";
import {
  seedRequirementConflicts,
  seedRequirementSourcePolicies,
} from "../src/lib/nutrition-data/seed-requirement-policies";

function createSeedClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is required to run the seed script.");
  }
  const url = new URL(raw);
  const sslAccept = url.searchParams.get("sslaccept");
  const connectionLimitRaw = url.searchParams.get("connection_limit");
  const database = url.pathname.replace(/^\//, "");

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: database || undefined,
    connectionLimit: connectionLimitRaw ? Number(connectionLimitRaw) : 5,
    ssl:
      sslAccept === "strict"
        ? { rejectUnauthorized: true }
        : sslAccept === "accept_invalid_certs"
          ? { rejectUnauthorized: false }
          : undefined,
  });

  return new PrismaClient({ adapter });
}

const prisma = createSeedClient();

async function seedCatalog() {
  const products = [
    {
      slug: PRODUCT_SLUGS.biologicalOs,
      name: "Biological OS",
      description: "Personalised food system and daily plan.",
      kind: "one_time" as const,
      sortOrder: 10,
    },
    {
      slug: PRODUCT_SLUGS.weeklyEmail,
      name: "Weekly shopping list email",
      description: "Optional weekly email with your shopping list.",
      kind: "subscription" as const,
      sortOrder: 50,
    },
    {
      slug: PRODUCT_SLUGS.labReference,
      name: "Biomarker reference",
      description: "Read-only educational biomarker material.",
      kind: "one_time" as const,
      sortOrder: 60,
    },
    {
      slug: PRODUCT_SLUGS.vipCoaching,
      name: "Personal coaching",
      description: "30-day VIP implementation support.",
      kind: "coaching" as const,
      sortOrder: 40,
    },
    {
      slug: PRODUCT_SLUGS.offer2,
      name: "Offer 2",
      description: "Future product module.",
      kind: "one_time" as const,
      sortOrder: 20,
    },
    {
      slug: PRODUCT_SLUGS.offer3,
      name: "Offer 3",
      description: "Future product module.",
      kind: "one_time" as const,
      sortOrder: 30,
    },
    {
      slug: PRODUCT_SLUGS.hormoneModule,
      name: "Hormone module",
      description: "Reserved; not shipped.",
      kind: "one_time" as const,
      sortOrder: 70,
    },
    {
      slug: PRODUCT_SLUGS.nervousModule,
      name: "Nervous system module",
      description: "Reserved; not shipped.",
      kind: "one_time" as const,
      sortOrder: 80,
    },
  ];

  const bySlug = new Map<string, string>();

  for (const product of products) {
    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      create: product,
      update: {
        name: product.name,
        description: product.description,
        kind: product.kind,
        sortOrder: product.sortOrder,
        active: true,
      },
    });
    bySlug.set(product.slug, row.id);
  }

  const bundle = await prisma.bundle.upsert({
    where: { slug: BUNDLE_SLUGS.completeBiologicalSystem },
    create: {
      slug: BUNDLE_SLUGS.completeBiologicalSystem,
      name: "Complete Biological System",
      active: true,
    },
    update: { name: "Complete Biological System", active: true },
  });

  const bundleProductSlugs = [
    PRODUCT_SLUGS.biologicalOs,
    PRODUCT_SLUGS.weeklyEmail,
    PRODUCT_SLUGS.labReference,
  ];

  for (const slug of bundleProductSlugs) {
    const productId = bySlug.get(slug);
    if (!productId) continue;
    await prisma.bundleItem.upsert({
      where: {
        bundleId_productId: { bundleId: bundle.id, productId },
      },
      create: { bundleId: bundle.id, productId },
      update: {},
    });
  }

  const skuProductMaps: { sku: string; slug: string }[] = [
    { sku: LEGACY_SKUS.CORE_PLAN, slug: PRODUCT_SLUGS.biologicalOs },
    { sku: LEGACY_SKUS.WEEKLY_ROTATION, slug: PRODUCT_SLUGS.weeklyEmail },
    { sku: LEGACY_SKUS.LAB_REFERENCE, slug: PRODUCT_SLUGS.labReference },
  ];

  for (const map of skuProductMaps) {
    const productId = bySlug.get(map.slug)!;
    await prisma.skuProductMap.upsert({
      where: { sku: map.sku },
      create: { sku: map.sku, productId },
      update: { productId },
    });
  }

  await prisma.skuBundleMap.upsert({
    where: { sku: LEGACY_SKUS.CORE_PLAN_BUNDLE },
    create: { sku: LEGACY_SKUS.CORE_PLAN_BUNDLE, bundleId: bundle.id },
    update: { bundleId: bundle.id },
  });

  return bySlug;
}

async function upsertUser(args: {
  email: string;
  name: string;
  marketingOptIn?: boolean;
  entitlements?: {
    corePlan?: boolean;
    weeklyRotation?: boolean;
    labReference?: boolean;
    coaching?: boolean;
  };
  scheduleActive?: boolean;
  productIdsBySlug: Map<string, string>;
}) {
  const user = await prisma.user.upsert({
    where: { email: args.email },
    create: {
      email: args.email,
      name: args.name,
      emailVerified: true,
      locale: "EN",
      marketingOptIn: args.marketingOptIn ?? false,
    },
    update: {
      name: args.name,
      emailVerified: true,
      marketingOptIn: args.marketingOptIn ?? false,
      unsubscribedAt: args.marketingOptIn ? null : undefined,
    },
  });

  const flags = {
    corePlan: args.entitlements?.corePlan ?? false,
    weeklyRotation: args.entitlements?.weeklyRotation ?? false,
    labReference: args.entitlements?.labReference ?? false,
    coaching: args.entitlements?.coaching ?? false,
    hormoneModule: false,
    nervousModule: false,
  };

  if (args.entitlements) {
    await prisma.entitlement.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...flags },
      update: flags,
    });

    const slugs = legacySlugsFromAccessFlags(flags);
    for (const slug of slugs) {
      const productId = args.productIdsBySlug.get(slug);
      if (!productId) continue;
      const existing = await prisma.entitlementGrant.findFirst({
        where: { userId: user.id, productId, status: "active" },
      });
      if (!existing) {
        await prisma.entitlementGrant.create({
          data: { userId: user.id, productId, status: "active" },
        });
      }
    }
  } else {
    await prisma.entitlement.deleteMany({ where: { userId: user.id } });
    await prisma.entitlementGrant.updateMany({
      where: { userId: user.id, status: "active" },
      data: { status: "revoked", endsAt: new Date() },
    });
  }

  if (args.scheduleActive) {
    await prisma.rotationSchedule.upsert({
      where: { userId: user.id },
      create: { userId: user.id, currentWeek: 1, active: true },
      update: { currentWeek: 1, active: true },
    });
  }

  return user;
}

async function backfillGrantsFromLegacyEntitlements(productIdsBySlug: Map<string, string>) {
  const rows = await prisma.entitlement.findMany({
    select: {
      userId: true,
      corePlan: true,
      weeklyRotation: true,
      labReference: true,
      coaching: true,
      hormoneModule: true,
      nervousModule: true,
    },
  });

  for (const row of rows) {
    const slugs = legacySlugsFromAccessFlags(row);
    for (const slug of slugs) {
      const productId = productIdsBySlug.get(slug);
      if (!productId) continue;
      const existing = await prisma.entitlementGrant.findFirst({
        where: { userId: row.userId, productId, status: "active" },
      });
      if (!existing) {
        await prisma.entitlementGrant.create({
          data: { userId: row.userId, productId, status: "active" },
        });
      }
    }
  }
}

async function seedFixtureFoodData() {
  const fixturePath = path.join(
    process.cwd(),
    "content/fixtures/food-source-fixture-v1.json",
  );
  const bundle = parseFoodSourceBundle(JSON.parse(readFileSync(fixturePath, "utf8")));
  const result = await importFoodSourceBundle(prisma, bundle);
  return result;
}

async function main() {
  await seedDataSourceRegistry(prisma);
  await seedRequirementSourcePolicies(prisma);
  await seedRequirementConflicts(prisma);
  const productIdsBySlug = await seedCatalog();
  await backfillGrantsFromLegacyEntitlements(productIdsBySlug);
  const foodImport = await seedFixtureFoodData();

  const coreOnly = await upsertUser({
    email: "core-only@seed.the-web-club.test",
    name: "Seed Core",
    entitlements: { corePlan: true },
    productIdsBySlug,
  });

  const fullAccess = await upsertUser({
    email: "full-access@seed.the-web-club.test",
    name: "Seed Full",
    marketingOptIn: true,
    entitlements: {
      corePlan: true,
      weeklyRotation: true,
      labReference: true,
    },
    scheduleActive: true,
    productIdsBySlug,
  });

  const noEntitlements = await upsertUser({
    email: "no-access@seed.the-web-club.test",
    name: "Seed None",
    productIdsBySlug,
  });

  console.log("Seeded catalog, food fixture, and users:", {
    foodImport,
    coreOnly: coreOnly.email,
    fullAccess: fullAccess.email,
    noEntitlements: noEntitlements.email,
  });
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error instanceof Error ? error.message : "unknown");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
