import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthScreenShell } from "@/components/auth/auth-screen-shell";
import { BrandSignature } from "@/components/portal/brand-signature";
import { SignInForm } from "@/components/auth/sign-in-form";
import { auth } from "@/lib/auth";

type HomePageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    redirect("/portal");
  }

  const params = await searchParams;

  return (
    <AuthScreenShell>
      <div className="flex flex-col gap-section">
        <div>
          <BrandSignature />
          <h1 className="mt-section text-display-serif text-foreground">Sign in</h1>
          <p className="mt-2 measure text-body text-muted">
            Enter your email and we will send you a one-time link. Access is by
            purchase or invite.
          </p>
        </div>
        <SignInForm nextPath={params.next} linkError={params.error === "link"} />
      </div>
    </AuthScreenShell>
  );
}
