/**
 * Motion token source of truth. CSS custom properties in globals.css must match
 * these values. See docs/motion.md.
 *
 * Motion is spatial and purposeful: it explains where content came from and
 * confirms that a control responded. It never decorates.
 */

export const duration = {
  /** Colour-only hover/active on dense rows. */
  instant: 80,
  /** Press feedback. */
  press: 110,
  /** Hover and focus treatments. */
  fast: 140,
  /** Exits: shorter than the matching enter. */
  exit: 100,
  /** Selected control and active-indicator changes. */
  selection: 170,
  /** Disclosure expand/collapse, dialogs and sheets. */
  disclosure: 200,
  /** Main content transitions. */
  moderate: 240,
  slow: 360,
} as const;

/** CSS string forms for style attributes and tests. */
export const durationCss = {
  instant: `${duration.instant}ms`,
  press: `${duration.press}ms`,
  fast: `${duration.fast}ms`,
  exit: `${duration.exit}ms`,
  selection: `${duration.selection}ms`,
  disclosure: `${duration.disclosure}ms`,
  moderate: `${duration.moderate}ms`,
  slow: `${duration.slow}ms`,
} as const;

export const ease = {
  /** Enter. */
  out: [0.16, 1, 0.3, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Exit. */
  exit: [0.4, 0, 1, 1] as const,
  /** State change. */
  state: [0.2, 0, 0, 1] as const,
  linear: "linear" as const,
};

export const easeCss = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  in: "cubic-bezier(0.7, 0, 0.84, 0)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  state: "cubic-bezier(0.2, 0, 0, 1)",
  linear: "linear",
} as const;

export const spring = {
  snappy: { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.85 },
  smooth: { type: "spring" as const, stiffness: 260, damping: 28, mass: 1 },
  gentle: { type: "spring" as const, stiffness: 180, damping: 26, mass: 1 },
};

export const travel = {
  hair: 2,
  close: 4,
  near: 8,
  far: 80,
} as const;

export const travelCss = {
  hair: `${travel.hair}px`,
  close: `${travel.close}px`,
  near: `${travel.near}px`,
  far: `${travel.far}px`,
} as const;

export const staggerMs = 24;
export const staggerCap = 8;

export const LOADING_THRESHOLD_MS = 300;
export const loadingThresholdCss = `${LOADING_THRESHOLD_MS}ms`;

/** Press response for buttons and interactive rows. */
export const pressScale = 0.985;

export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Subscribeable helper for client components. */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MotionTransition = {
  duration: number;
  ease: "linear" | readonly [number, number, number, number];
};

type VariantSet = {
  enter: Record<string, number>;
  center: Record<string, number>;
  exit: Record<string, number>;
};

function transition(
  reduced: boolean,
  ms: number,
  curve: readonly [number, number, number, number],
): MotionTransition {
  if (reduced) return { duration: duration.exit / 1000, ease: "linear" };
  return { duration: ms / 1000, ease: curve };
}

/**
 * Reduced motion drops spatial transforms and uses a near-instant opacity
 * change. It never disables the state change itself.
 */
export function motionSafe<T>(reduced: boolean, animated: T, staticVariant: T): T {
  return reduced ? staticVariant : animated;
}

/** Crossfade for main content. No vertical travel — it reads as bounce beside a fixed rail. */
export function pageContentTransition(reduced: boolean) {
  return transition(reduced, duration.moderate, ease.out);
}

export function pageContentVariants(reduced: boolean): VariantSet & {
  transition: MotionTransition;
} {
  return {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
    transition: reduced
      ? { duration: duration.exit / 1000, ease: "linear" }
      : { duration: duration.moderate / 1000, ease: ease.out },
  };
}

/** Onboarding / wizard step change. */
export function wizardSlideVariants(
  reduced: boolean,
): VariantSet & { transition: MotionTransition } {
  if (reduced) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: duration.exit / 1000, ease: "linear" },
    };
  }
  return {
    enter: { opacity: 0, y: travel.close },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -travel.hair },
    transition: { duration: duration.moderate / 1000, ease: ease.out },
  };
}

/** Height and opacity expansion for rows that reveal detail in place. */
export function disclosureTransition(reduced: boolean) {
  return transition(reduced, duration.disclosure, ease.out);
}

export function disclosureVariants(reduced: boolean) {
  if (reduced) {
    return {
      collapsed: { opacity: 0 },
      expanded: { opacity: 1 },
    };
  }
  return {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: "auto" as const },
  };
}

/** Shared active-navigation indicator and selected-control changes. */
export function selectionTransition(reduced: boolean) {
  return transition(reduced, duration.selection, ease.state);
}

/** Progress animates from its previous value, never from zero. */
export function progressTransition(reduced: boolean) {
  return transition(reduced, duration.moderate, ease.out);
}

export function dialogTransition(reduced: boolean) {
  return transition(reduced, duration.disclosure, ease.out);
}

export function menuContentTransition(reduced: boolean) {
  return transition(reduced, duration.fast, ease.out);
}

export function menuExitTransition(reduced: boolean) {
  if (reduced) return { duration: duration.exit / 1000, ease: easeCss.linear };
  return { duration: duration.exit / 1000, ease: [...ease.exit] };
}

/** Press feedback shared by buttons and interactive rows. */
export function pressAnimation(reduced: boolean, disabled = false) {
  if (reduced || disabled) return undefined;
  return { scale: pressScale };
}

export function pressTransition(reduced: boolean) {
  return transition(reduced, duration.press, ease.state);
}
