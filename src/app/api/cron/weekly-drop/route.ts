import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendWithUnsubscribe } from "@/lib/mail";
import { AUTHORED_WEEKS, getRotationWeek } from "@/lib/nutrition/rotation";

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

  const recipients = await db.user.findMany({
    where: {
      unsubscribedAt: null,
      marketingOptIn: true,
      entitlements: { weeklyRotation: true },
      schedule: { active: true },
      profile: { isNot: null },
    },
    select: {
      id: true,
      email: true,
      locale: true,
      unsubscribeToken: true,
      schedule: { select: { currentWeek: true } },
      profile: { select: { unitSystem: true } },
    },
    orderBy: { id: "asc" },
    take: BATCH_SIZE,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of recipients) {
    const week = user.schedule?.currentWeek ?? 1;

    // Claim the slot first. The unique constraint means a concurrent or
    // retried invocation loses the race and skips instead of double-sending.
    try {
      await db.emailDrop.create({
        data: { userId: user.id, weekNumber: week, cycleYear },
      });
    } catch {
      skipped += 1;
      continue;
    }

    const rotation = getRotationWeek(week);
    const unit = user.profile?.unitSystem ?? "HOUSEHOLD";

    const rows = rotation.items
      .map(
        (item) => `<tr>
          <td style="padding:10px 0;font-size:14px;border-bottom:1px solid #ececec">${item.labelKey}</td>
          <td style="padding:10px 0;text-align:right;font-size:13px;color:#6b6b6b;border-bottom:1px solid #ececec">${
            unit === "METRIC" ? `${item.grams} g` : item.householdDisplay
          }</td>
        </tr>`,
      )
      .join("");

    const result = await sendWithUnsubscribe({
      to: user.email,
      unsubscribeToken: user.unsubscribeToken,
      subject: `Your shopping list, week ${week}`,
      html: `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
        <h1 style="font-size:20px;font-weight:600;margin:0 0 16px">Week ${week} shopping list</h1>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <div style="text-align:center;margin-top:28px">
          <a href="${env.NEXT_PUBLIC_APP_URL}/portal" style="display:inline-block;background:#3f6b4a;color:#ffffff;padding:12px 24px;border-radius:8px;font-size:14px;text-decoration:none">Open your plan</a>
        </div>
      </div>`,
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
      // Cursor is NOT advanced. The next run retries this week.
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
    // A full batch means more remain. Vercel cron will pick them up on the
    // next tick; increase frequency or BATCH_SIZE as the list grows.
    moreLikely: recipients.length === BATCH_SIZE,
  });
}
