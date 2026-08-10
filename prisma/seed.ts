import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Test accounts only. Invented addresses on a non-production domain.
 * No biometric or health values on these rows — intake stays empty so the
 * portal empty states stay exercisable. full-access is marketing-ready so the
 * weekly-drop cron path can be exercised without inventing Article 9 data.
 */
const prisma = new PrismaClient();

async function upsertUser(args: {
  email: string;
  name: string;
  marketingOptIn?: boolean;
  entitlements?: {
    corePlan?: boolean;
    weeklyRotation?: boolean;
    labReference?: boolean;
  };
  scheduleActive?: boolean;
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

  if (args.entitlements) {
    await prisma.entitlement.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        corePlan: args.entitlements.corePlan ?? false,
        weeklyRotation: args.entitlements.weeklyRotation ?? false,
        labReference: args.entitlements.labReference ?? false,
      },
      update: {
        corePlan: args.entitlements.corePlan ?? false,
        weeklyRotation: args.entitlements.weeklyRotation ?? false,
        labReference: args.entitlements.labReference ?? false,
      },
    });
  } else {
    await prisma.entitlement.deleteMany({ where: { userId: user.id } });
  }

  if (args.scheduleActive) {
    await prisma.rotationSchedule.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        currentWeek: 1,
        active: true,
      },
      update: {
        currentWeek: 1,
        active: true,
      },
    });
  }

  return user;
}

async function main() {
  const coreOnly = await upsertUser({
    email: "core-only@seed.the-web-club.test",
    name: "Seed Core",
    entitlements: { corePlan: true },
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
  });

  const noEntitlements = await upsertUser({
    email: "no-access@seed.the-web-club.test",
    name: "Seed None",
  });

  // Field names only — never print secrets or health data.
  console.log("Seeded users:", {
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
