"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageContentVariants } from "@/lib/motion";

/**
 * Main content settles in on navigation: a crossfade plus a short vertical
 * travel so the change of place is legible. Reduced motion keeps the opacity
 * change and drops the transform.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() ?? false;
  const variants = pageContentVariants(reduceMotion);

  return (
    <motion.div
      key={pathname}
      initial={variants.enter}
      animate={variants.center}
      transition={variants.transition}
    >
      {children}
    </motion.div>
  );
}
