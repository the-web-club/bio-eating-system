"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { pageContentVariants } from "@/lib/motion";

/**
 * Main content crossfades on navigation. Vertical travel is omitted so the
 * fixed rail and document scroll position stay visually stable.
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
