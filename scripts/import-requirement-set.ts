import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { importRequirementSetBundle, loadRequirementSetBundleFromFile } from "../src/lib/nutrition-data/requirements/importer";

function createClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is required");
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
  const fileArg = process.argv[2];
  if (!fileArg) {
    throw new Error("Usage: tsx scripts/import-requirement-set.ts <path-to-json>");
  }

  const prisma = createClient();
  const bundle = await loadRequirementSetBundleFromFile(path.resolve(fileArg));
  const result = await importRequirementSetBundle(prisma, bundle);
  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
