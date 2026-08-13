"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Keeps the document scroll position stable when switching primary destinations. */
export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
