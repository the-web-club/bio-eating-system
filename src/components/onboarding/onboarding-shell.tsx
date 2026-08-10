import type { ReactNode } from "react";
import { BrandSignature } from "@/components/portal/brand-signature";

export function OnboardingShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col px-gutter py-s5 sm:px-8">
      <div className="mb-s6">
        <BrandSignature size="compact" />
        <p className="mt-s2 text-meta text-muted">
          Your plan starts with a short profile.
        </p>
      </div>
      <div className="flex-1">{children}</div>
      {footer ? (
        <div className="mt-s6 border-t border-hairline pt-s5">{footer}</div>
      ) : null}
    </div>
  );
}
