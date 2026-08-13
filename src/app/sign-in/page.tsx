import { redirect } from "next/navigation";

type SignInRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Legacy path. Sign-in lives on `/` so production bookmarks and middleware
 * redirects that still use /sign-in keep working.
 */
export default async function SignInRedirectPage({
  searchParams,
}: SignInRedirectProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    }
  }
  const suffix = query.toString();
  redirect(suffix ? `/?${suffix}` : "/");
}
