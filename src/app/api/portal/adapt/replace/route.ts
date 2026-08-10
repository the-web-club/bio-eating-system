import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { FOOD_SLOTS } from "@/lib/nutrition/plan-engine";
import { replaceReasonSchema } from "@/lib/intake/schema";
import {
  loadProfileForEngine,
  regeneratePlan,
  replacementOptions,
} from "@/lib/portal/plan-regenerate";

export const runtime = "nodejs";

const bodySchema = z.object({
  slot: z.enum(FOOD_SLOTS),
  reason: replaceReasonSchema,
  replacementSlot: z.enum(FOOD_SLOTS).optional(),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  const { slot, reason, replacementSlot } = parsed.data;

  try {
    const { engineInput } = await loadProfileForEngine(session.user.id);
    const blocked = new Set([
      ...(engineInput.excludedSlots as typeof FOOD_SLOTS[number][]),
    ]);

    const swaps = [slot];
    if (replacementSlot) {
      await db.adaptationEvent.create({
        data: {
          userId: session.user.id,
          type: "replace",
          reason,
          context: { slot, replacementSlot },
        },
      });
    }

    await db.intakeProfile.update({
      where: { userId: session.user.id },
      data: {
        swapRequests: [
          ...new Set([...engineInput.swapRequests, ...swaps]),
        ],
      },
    });

    await regeneratePlan(session.user.id, swaps);

    return NextResponse.json({ ok: true, message: "Plan updated" });
  } catch {
    return NextResponse.json({ error: "replace_failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const slotParam = url.searchParams.get("slot");
  const slotParsed = z.enum(FOOD_SLOTS).safeParse(slotParam);
  if (!slotParsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 422 });
  }

  const { engineInput } = await loadProfileForEngine(session.user.id);
  const blocked = new Set(engineInput.excludedSlots);
  const options = replacementOptions(slotParsed.data, blocked);

  return NextResponse.json({ options });
}
