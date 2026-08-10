import Link from "next/link";
import { BrandSignature } from "@/components/portal/brand-signature";
import { unsubscribeByToken } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await unsubscribeByToken(token);

  const copy =
    result === "invalid"
      ? {
          title: "Link not valid",
          body: "This unsubscribe link is not valid. If weekly emails keep arriving, open the link from the latest message.",
        }
      : {
          title: "You are unsubscribed",
          body: "You will not receive weekly shopping list emails. Sign-in and account messages are unchanged.",
        };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col justify-center gap-section px-gutter py-group sm:px-8">
      <div>
        <BrandSignature />
        <h1 className="mt-section text-editorial text-foreground">{copy.title}</h1>
        <p className="mt-2 measure text-body text-muted">{copy.body}</p>
      </div>
      <p>
        <Link
          href="/"
          className="text-body text-accent-text underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}
