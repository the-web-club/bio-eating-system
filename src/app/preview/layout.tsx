import type { ReactNode } from "react";
import { PreviewShell } from "./preview-shell";

export const metadata = {
  title: "Preview · Katarina portal shell",
  description: "Unauthenticated design preview with dummy content.",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <PreviewShell title="Preview">{children}</PreviewShell>;
}
