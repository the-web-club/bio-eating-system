import Link from "next/link";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { BrandSignature } from "@/components/portal/brand-signature";

type SentPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function MagicLinkSentPage({ searchParams }: SentPageProps) {
  const params = await searchParams;
  const email = params.email?.trim();

  return (
    <AuthScreenShell className="max-w-[26rem]">
      <div className="flex flex-col gap-section">
        <div>
          <BrandSignature />
          <h1 className="mt-section text-display-serif text-foreground">Check your email</h1>
          <p className="mt-s1 text-body-lg text-muted">
            {email
              ? `We sent a sign-in link to ${email}. Open it on this device to continue.`
              : "We sent a sign-in link. Open it on this device to continue."}
          </p>
        </div>

        <div className="border-t border-hairline pt-s4">
          <p className="text-body text-muted">The link expires in 10 minutes.</p>
          <Link
            href="/"
            className="mt-s1 inline-block cursor-[var(--cursor-link)] rounded-control text-body text-accent-text underline-offset-4 hover:underline"
          >
            Use a different email
          </Link>
        </div>
      </div>
    </AuthScreenShell>
  );
}
