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
    <div className="mx-auto flex min-h-dvh w-full max-w-[34rem] flex-col px-gutter py-group sm:px-8">
      <div className="mb-section">
        <BrandSignature size="compact" />
        <p className="mt-1.5 text-small text-muted">
          Your plan starts with a short profile.
        </p>
      </div>
      <div className="flex-1">{children}</div>
      {footer ? (
        <div className="mt-section border-t border-hairline pt-group">{footer}</div>
      ) : null}
    </div>
  );
}
