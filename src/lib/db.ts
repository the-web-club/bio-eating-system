import { PrismaClient } from "@/generated/prisma/client";

/**
 * Serverless-safe singleton. Vercel reuses warm lambdas, so a new client per
 * request exhausts the MariaDB connection pool.
 *
 * Set connection_limit in DATABASE_URL, e.g. ?connection_limit=5
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Never "query" in production: query logs would contain Article 9 data.
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
