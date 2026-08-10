import type { ReactNode } from "react";

/**
 * Main content is static on navigation. Motion is reserved for controls the
 * user interacts with, not for page-wide entrance.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return children;
}
