import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * One-click List-Unsubscribe-Post target (RFC 8058). Mail clients POST here
 * with body List-Unsubscribe=One-Click. The visible email link uses the HTML
 * page at /unsubscribe/[token] instead.
 */
export async function POST(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { token } = await context.params;
  await unsubscribeByToken(token);
  // RFC 8058: empty 200 is enough. Never echo the token or account state.
  return new NextResponse(null, { status: 200 });
}
