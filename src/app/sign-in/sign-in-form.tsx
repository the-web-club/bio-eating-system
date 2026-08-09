"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { Status } from "@/components/ui/status";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signInError } = await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL: "/portal",
      errorCallbackURL: "/sign-in?error=link",
    });

    setPending(false);

    if (signInError) {
      setError("We could not send the link. Check the email and try again.");
      return;
    }

    router.push(`/sign-in/sent?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-tight">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <div aria-live="polite">
        {error ? <Status role="danger">{error}</Status> : null}
      </div>

      <Button type="submit" loading={pending} className="w-full">
        Send sign-in link
      </Button>
    </form>
  );
}
