/**
 * Motion token source of truth. CSS custom properties in globals.css must match
 * these values. See docs/motion.md.
 *
 * Motion confirms interaction and state change. Content is static by default.
 */

export const duration = {
  /** Colour-only hover/active on dense rows. */
  instant: 80,
  /** Micro interaction: press, tooltip. */
  press: 120,
  /** Hover, focus, menus, popovers. */
  fast: 120,
  /** Exits: shorter than the matching enter. */
  exit: 100,
  /** Active navigation, selection, checkbox state. */
  selection: 180,
  /** Disclosure, dialog, sheet, localized row transitions. */
  disclosure: 200,
  /** Standard UI transition: progress, wizard step. */
  moderate: 180,
  /** Contextual transition ceiling. */
  slow: 260,
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
  /** Standard UI easing — entrances, state changes, exits. */
  standard: [0.2, 0, 0, 1] as const,
  /** Modals and emphasized surfaces only. */
  emphasized: [0.2, 0.8, 0.2, 1] as const,
  /** Legacy aliases kept for imports. */
  out: [0.2, 0, 0, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
  state: [0.2, 0, 0, 1] as const,
  linear: "linear" as const,
};

export const easeCss = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  out: "cubic-bezier(0.2, 0, 0, 1)",
  in: "cubic-bezier(0.7, 0, 0.84, 0)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  state: "cubic-bezier(0.2, 0, 0, 1)",
  linear: "linear",
} as const;

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

export const LOADING_THRESHOLD_MS = 300;
export const loadingThresholdCss = `${LOADING_THRESHOLD_MS}ms`;

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

/** Onboarding / wizard step change — opacity only. */
export function wizardSlideVariants(
  reduced: boolean,
): VariantSet & { transition: MotionTransition } {
  return {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
    transition: transition(reduced, duration.moderate, ease.standard),
  };
}

/** Height and opacity expansion for rows that reveal detail in place. */
export function disclosureTransition(reduced: boolean) {
  return transition(reduced, duration.disclosure, ease.standard);
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
  return transition(reduced, duration.selection, ease.standard);
}

/** Progress animates from its previous value, never from zero. */
export function progressTransition(reduced: boolean) {
  return transition(reduced, duration.moderate, ease.standard);
}

export function dialogTransition(reduced: boolean) {
  return transition(reduced, duration.disclosure, ease.emphasized);
}

export function menuContentTransition(reduced: boolean) {
  return transition(reduced, duration.fast, ease.standard);
}

export function menuExitTransition(reduced: boolean) {
  if (reduced) return { duration: duration.exit / 1000, ease: easeCss.linear };
  return { duration: duration.exit / 1000, ease: [...ease.exit] };
}

export function toastTransition(reduced: boolean) {
  return transition(reduced, duration.disclosure, ease.standard);
}
