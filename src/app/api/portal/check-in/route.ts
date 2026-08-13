import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { weeklyCheckInSchema } from "@/lib/intake/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = weeklyCheckInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  const schedule = await db.rotationSchedule.findUnique({
    where: { userId: session.user.id },
  });
  const weekNumber = schedule?.currentWeek ?? 1;
  const cycleYear = new Date().getFullYear();

  await db.weeklyCheckIn.upsert({
    where: {
      userId_cycleYear_weekNumber: {
        userId: session.user.id,
        cycleYear,
        weekNumber,
      },
    },
    create: {
      userId: session.user.id,
      weekNumber,
      cycleYear,
      ...parsed.data,
    },
    update: parsed.data,
  });

  if (parsed.data.weightKg != null) {
    await db.intakeProfile.update({
      where: { userId: session.user.id },
      data: { weightKg: parsed.data.weightKg },
    });
  }

  return NextResponse.json({ ok: true });
}
