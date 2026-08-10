import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Full-viewport sign-in composition. The wellness photograph sits behind a
 * radial veil so the centred panel stays readable; visual interest stays at
 * the edges of the artwork.
 */
export function AuthScreenShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="auth-screen relative min-h-dvh">
      <div className="auth-bg" aria-hidden />
      <main
        className={cn(
          "relative z-10 mx-auto flex min-h-dvh w-full max-w-[30rem] flex-col justify-center px-gutter py-group sm:px-8",
          className,
        )}
      >
        <div className="auth-screen__panel w-full">{children}</div>
      </main>
    </div>
  );
}
