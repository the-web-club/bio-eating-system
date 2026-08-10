import Link from "next/link";
import { BrandSignature } from "@/components/portal/brand-signature";

type SentPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function MagicLinkSentPage({ searchParams }: SentPageProps) {
  const params = await searchParams;
  const email = params.email?.trim();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col justify-center gap-section px-gutter py-group sm:px-8">
      <div>
        <BrandSignature />
        <h1 className="mt-section text-editorial text-foreground">Check your email</h1>
        <p className="mt-2 text-lead text-muted">
          {email
            ? `We sent a sign-in link to ${email}. Open it on this device to continue.`
            : "We sent a sign-in link. Open it on this device to continue."}
        </p>
      </div>

      <div className="border-t border-hairline pt-tight">
        <p className="text-body text-muted">The link expires in 10 minutes.</p>
        <Link
          href="/"
          className="mt-2 inline-block cursor-[var(--cursor-link)] rounded-control text-body text-accent-text underline-offset-4 hover:underline"
        >
          Use a different email
        </Link>
      </div>
    </main>
  );
}
