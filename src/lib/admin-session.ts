import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { auth } from "@/lib/auth";

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Page guard. Cookie presence is handled by middleware; this enforces the
 * staff email allowlist after the session is resolved.
 */
export async function requireAdminPage(nextPath = "/admin"): Promise<AdminSessionUser> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/?next=${encodeURIComponent(nextPath)}`);
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/portal");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

/** API guard. Returns 401 without a session, 403 for non-staff. */
export async function requireAdminApiSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return {
      admin: null as null,
      response: NextResponse.json({ error: "unauthenticated" }, { status: 401 }),
    };
  }
  if (!isAdminEmail(session.user.email)) {
    return {
      admin: null as null,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return {
    admin: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    } satisfies AdminSessionUser,
    response: null as null,
  };
}

export function adminActor(adminId: string): string {
  return `admin:${adminId}`;
}
