import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * API portal guard. Returns 401 JSON without a session.
 * Page routes use middleware redirect instead.
 */
export async function requirePortalApiSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return {
      session: null as null,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  return { session, response: null as null };
}
