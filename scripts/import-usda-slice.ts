#!/usr/bin/env tsx
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { importFoodSourceBundle } from "../src/lib/nutrition-data/import-pipeline";
import { seedDataSourceRegistry } from "../src/lib/nutrition-data/seed-registry";
import { createUsdaAdaptor, USDA_SLICE_VERSION } from "../src/lib/nutrition-data/sources/usda";

function createImportClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is required to import USDA food data.");
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

async function main() {
  const version = process.argv[2] ?? USDA_SLICE_VERSION;
  const prisma = createImportClient();

  try {
    await seedDataSourceRegistry(prisma);
    const adaptor = createUsdaAdaptor();
    const bundle = await adaptor.fetch(version);
    const result = await importFoodSourceBundle(prisma, bundle);
    console.log("USDA production slice import completed:", result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("USDA import failed:", error instanceof Error ? error.message : "unknown");
  process.exitCode = 1;
});
