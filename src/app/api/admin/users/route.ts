import { NextResponse } from "next/server";
import { z } from "zod";
import { accessFlagsSchema } from "@/lib/admin/access";
import { adminActor, requireAdminApiSession } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { displayNameFromEmail, normalizeEmail } from "@/lib/signup-allowlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().min(1).max(200).optional(),
  access: accessFlagsSchema.default({
    corePlan: true,
    weeklyRotation: true,
    labReference: true,
    coaching: false,
    hormoneModule: false,
    nervousModule: false,
  }),
});

/**
 * Staff directory. Search is email/name contains only — never returns biometric fields.
 */
export async function GET(request: Request) {
  const { admin, response } = await requireAdminApiSession(request);
  if (!admin) return response;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 200);
  const take = Math.min(Number(url.searchParams.get("limit") ?? 40) || 40, 100);

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      email: true,
      name: true,
      locale: true,
      createdAt: true,
      marketingOptIn: true,
      unsubscribedAt: true,
      entitlements: {
        select: {
          corePlan: true,
          weeklyRotation: true,
          labReference: true,
          coaching: true,
        },
      },
      schedule: { select: { active: true, currentWeek: true, lastSentAt: true } },
      profile: { select: { id: true } },
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      locale: user.locale,
      createdAt: user.createdAt.toISOString(),
      marketingOptIn: user.marketingOptIn,
      unsubscribed: Boolean(user.unsubscribedAt),
      hasIntake: Boolean(user.profile),
      access: {
        corePlan: user.entitlements?.corePlan ?? false,
        weeklyRotation: user.entitlements?.weeklyRotation ?? false,
        labReference: user.entitlements?.labReference ?? false,
        coaching: user.entitlements?.coaching ?? false,
      },
      schedule: user.schedule
        ? {
            active: user.schedule.active,
            currentWeek: user.schedule.currentWeek,
            lastSentAt: user.schedule.lastSentAt?.toISOString() ?? null,
          }
        : null,
    })),
  });
}

/** Create a member so they can receive a magic-link sign-in without a purchase. */
export async function POST(request: Request) {
  const { admin, response } = await requireAdminApiSession(request);
  if (!admin) return response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  const email = normalizeEmail(parsed.data.email);
  const name = parsed.data.name?.trim() || displayNameFromEmail(email);
  const access = parsed.data.access;

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "email_taken", id: existing.id }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      email,
      name,
      locale: "EN",
      entitlements: { create: access },
      schedule: { create: { active: access.weeklyRotation } },
    },
    select: { id: true, email: true, name: true },
  });

  await db.auditEvent.create({
    data: {
      userId: user.id,
      action: "account.admin_created",
      actor: adminActor(admin.id),
      detail: { email, access },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
}
