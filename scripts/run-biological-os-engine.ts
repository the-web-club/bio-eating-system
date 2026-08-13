import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { biologicalOsEngineRunBodySchema } from "../src/lib/biological-os/schema";
import { runBiologicalOsEngineForUser } from "../src/lib/biological-os/run-engine";

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

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function main() {
  if (process.env.BIOLOGICAL_OS_ENGINE !== "true") {
    throw new Error("Set BIOLOGICAL_OS_ENGINE=true before running the internal engine script.");
  }

  const userId = readArg("userId");
  if (!userId) {
    throw new Error("Usage: pnpm run:biological-os-engine --userId=<uuid> [--age=30] [--sex=female] [--bodyWeightKg=65]");
  }

  const age = Number(readArg("age") ?? "30");
  const sex = (readArg("sex") ?? "female") as "female" | "male";
  const bodyWeightKg = Number(readArg("bodyWeightKg") ?? "65");

  const parsed = biologicalOsEngineRunBodySchema.safeParse({
    age,
    sex,
    bodyWeightKg,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join("; "));
  }

  const prisma = createClient();

  try {
    const result = await runBiologicalOsEngineForUser({
      db: prisma,
      userId,
      profile: {
        age: parsed.data.age,
        sex: parsed.data.sex,
        bodyWeightKg: parsed.data.bodyWeightKg,
      },
    });

    console.log(
      JSON.stringify(
        {
          matrixVersionId: result.matrixVersionId,
          version: result.version,
          optimizerStatus: result.pipeline.optimizer.status,
          infeasibleReason: result.pipeline.optimizer.infeasibleReason ?? null,
          itemCount: result.pipeline.optimizer.draft.items.length,
          redundancyProposalCount: result.pipeline.redundancyProposals.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
