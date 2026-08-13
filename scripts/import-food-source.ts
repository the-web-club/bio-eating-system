#!/usr/bin/env tsx
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  importFoodSourceBundle,
  loadFoodSourceBundleFromFile,
} from "../src/lib/nutrition-data/import-pipeline";

function createImportClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is required to import food data.");
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
  const fixturePath =
    process.argv[2] ??
    path.join(process.cwd(), "content/fixtures/food-source-fixture-v1.json");

  const bundle = await loadFoodSourceBundleFromFile(fixturePath);
  const prisma = createImportClient();

  try {
    const result = await importFoodSourceBundle(prisma, bundle);
    console.log("Food import completed:", result);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Food import failed:", error instanceof Error ? error.message : "unknown");
  process.exitCode = 1;
});
