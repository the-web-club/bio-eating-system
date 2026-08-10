"use client";

import { useEffect, useState } from "react";

/**
 * Reads a media query once after mount. Returns `mounted: false` on the server
 * and on the first client render so floating surfaces can wait before choosing
 * popover vs sheet.
 */
export function useMountMediaQuery(query: string) {
  const [mounted, setMounted] = useState(false);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    setMatches(media.matches);

    function onChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return { mounted, matches };
}
