import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col justify-center gap-section px-gutter py-group sm:px-8">
      <div>
        <BrandSignature />
        <h1 className="mt-section text-editorial text-foreground">Sign in</h1>
        <p className="mt-2 measure text-body text-muted">
          Enter your email and we will send you a one-time link. Access is by
          purchase or invite.
        </p>
      </div>
      <SignInForm nextPath={params.next} linkError={params.error === "link"} />
    </main>
  );
}
