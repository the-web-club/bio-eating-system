import { z } from "zod";
import { db } from "@/lib/db";

const tokenSchema = z.string().uuid();

export type UnsubscribeResult = "unsubscribed" | "already" | "invalid";

/**
 * One-click and link-click unsubscribe. Idempotent: a second call for the same
 * token is a no-op success. Invalid or malformed tokens return "invalid"
 * without revealing whether an account exists beyond that.
 */
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success) return "invalid";

  const user = await db.user.findUnique({
    where: { unsubscribeToken: parsed.data },
    select: { id: true, unsubscribedAt: true },
  });

  if (!user) return "invalid";
  if (user.unsubscribedAt) return "already";

  await db.user.update({
    where: { id: user.id },
    data: {
      unsubscribedAt: new Date(),
      marketingOptIn: false,
    },
  });

  return "unsubscribed";
}
