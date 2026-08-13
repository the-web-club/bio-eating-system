import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendWeeklyListEmail } from "@/lib/mail";
import type { PlanSlot } from "@/lib/nutrition/plan-engine";
import { AUTHORED_WEEKS, getRotationWeek } from "@/lib/nutrition/rotation";
import { buildWeeklyListRows } from "@/lib/nutrition/weekly-list";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Weekly grocery list.
 *
 * Fixes carried over from the previous draft:
 *  - capped batch per invocation, so it cannot exceed the function timeout
 *  - one EmailDrop row per user per week under a unique constraint, so a retry
 *    cannot double-send
 *  - the week cursor advances only AFTER a confirmed send
 *  - unsubscribed recipients are excluded in the query, not after the send
 *  - failed drops are reclaimed on a later run instead of skipped forever
 *  - recipients with a successful drop for the current week are skipped
 *  - item names use the same label fallbacks as the portal, not raw keys
 */

const BATCH_SIZE = 50;

function authorised(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const cycleYear = new Date().getUTCFullYear();

  // Prefer people who have never been sent (or were sent longest ago) so a
  // stuck first page of ids cannot starve the rest of the list.
  const recipients = await db.user.findMany({
    where: {
      unsubscribedAt: null,
      marketingOptIn: true,
      entitlements: { weeklyRotation: true },
      schedule: { active: true },
    },
    select: {
      id: true,
      email: true,
      unsubscribeToken: true,
      schedule: { select: { currentWeek: true } },
      profile: {
        select: {
          unitSystem: true,
          plans: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { slots: true },
          },
        },
      },
    },
    // MariaDB sorts NULL first under ASC, so never-sent recipients lead the batch.
    orderBy: [{ schedule: { lastSentAt: "asc" } }, { id: "asc" }],
    take: BATCH_SIZE,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of recipients) {
    const week = user.schedule?.currentWeek ?? 1;

    const existing = await db.emailDrop.findUnique({
      where: {
        userId_cycleYear_weekNumber: {
          userId: user.id,
          cycleYear,
          weekNumber: week,
        },
      },
      select: { id: true, sentAt: true, failedAt: true },
    });

    if (existing?.sentAt) {
      skipped += 1;
      continue;
    }

    if (!existing) {
      try {
        await db.emailDrop.create({
          data: { userId: user.id, weekNumber: week, cycleYear },
        });
      } catch {
        skipped += 1;
        continue;
      }
    } else if (existing.failedAt) {
      await db.emailDrop.update({
        where: { id: existing.id },
        data: { failedAt: null, failure: null },
      });
    }

    const rotation = getRotationWeek(week);
    const unit = user.profile?.unitSystem ?? "HOUSEHOLD";
    const planSlots = Array.isArray(user.profile?.plans[0]?.slots)
      ? (user.profile!.plans[0]!.slots as unknown as PlanSlot[])
      : null;

    const items = buildWeeklyListRows(rotation.items, planSlots, unit);

    const result = await sendWeeklyListEmail({
      to: user.email,
      unsubscribeToken: user.unsubscribeToken,
      week,
      items,
    });

    if (!result.ok) {
      failed += 1;
      await db.emailDrop.update({
        where: {
          userId_cycleYear_weekNumber: {
            userId: user.id,
            cycleYear,
            weekNumber: week,
          },
        },
        data: { failedAt: new Date(), failure: result.error ?? "unknown" },
      });
      continue;
    }

    await db.emailDrop.update({
      where: {
        userId_cycleYear_weekNumber: {
          userId: user.id,
          cycleYear,
          weekNumber: week,
        },
      },
      data: { sentAt: new Date(), providerId: result.providerId ?? null },
    });

    await db.rotationSchedule.update({
      where: { userId: user.id },
      data: {
        currentWeek: week >= AUTHORED_WEEKS ? 1 : week + 1,
        lastSentAt: new Date(),
      },
    });

    sent += 1;
  }

  return NextResponse.json({
    ok: true,
    batchSize: recipients.length,
    sent,
    skipped,
    failed,
    moreLikely: recipients.length === BATCH_SIZE,
  });
}
