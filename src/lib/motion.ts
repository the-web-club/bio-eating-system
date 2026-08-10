/**
 * Motion token source of truth. CSS custom properties in globals.css must match
 * duration and loading values here. See docs/motion.md and .cursor/rules/motion.mdc.
 *
 * Motion confirms interaction and state change. Content is static by default.
 * No component defines its own spring, duration, or easing array.
 */

import type { Transition, Variants } from "motion/react";

/** Springs. Chosen by surface size, not by taste. */
export const spring = {
  /** Small floating surfaces: popovers, menus, tooltips. */
  snap: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 },
  /** Modal dialogs and other mid-size surfaces. */
  modal: { type: "spring", stiffness: 380, damping: 34, mass: 0.9 },
  /** Bottom sheets and anything driven by a drag gesture. */
  sheet: { type: "spring", stiffness: 300, damping: 34, mass: 1 },
  /** Container resize under the `layout` prop. */
  resize: { type: "spring", stiffness: 350, damping: 35, mass: 1 },
  /** Large surfaces and route-level movement. */
  gentle: { type: "spring", stiffness: 260, damping: 30, mass: 1 },
} satisfies Record<string, Transition>;

/** Tweens. Only for opacity and colour, which gain nothing from a spring. */
export const tween = {
  fade: { duration: 0.12, ease: [0.2, 0.7, 0.2, 1] as const },
  crossfade: { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] as const },
  exit: { duration: 0.13, ease: [0.4, 0, 1, 1] as const },
  micro: { duration: 0.12, ease: [0.2, 0.7, 0.2, 1] as const },
  /** Step heading crossfade inside replace popover. */
  heading: { duration: 0.14, ease: [0.2, 0.7, 0.2, 1] as const },
  /** Outgoing chip collapse inside replace popover. */
  chipExit: { duration: 0.13, ease: [0.2, 0.7, 0.2, 1] as const },
  /** Sheet backdrop under reduced motion. */
  sheetReduced: { duration: 0.12, ease: [0.2, 0.7, 0.2, 1] as const },
  /** Optimistic meal text swap in the list row. */
  mealSwap: { duration: 0.2, ease: [0.2, 0.7, 0.2, 1] as const },
  /** Confirmation mark fade out. */
  confirmFade: { duration: 0.26, ease: [0.2, 0.7, 0.2, 1] as const },
  /** Sheet backdrop on enter. */
  sheetBackdrop: { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] as const },
} satisfies Record<string, Transition>;

/** Stagger. Never exceed 6 animated children or 150ms of total offset. */
export const stagger = {
  enter: 0.025,
  exit: 0.02,
  chipEnter: 0.025,
  chipExit: 0.02,
  max: 6,
} as const;

/** Loading. Below this threshold, show nothing at all. */
export const LOADING_THRESHOLD_MS = 400;

/** Gesture dismissal. Projection factor, distance ratio, escape velocity. */
export const dismiss = {
  projection: 0.2,
  ratio: 0.4,
  velocity: 700,
} as const;

/** Confirmation mark hold before fade. */
export const CONFIRM_HOLD_MS = 1400;

export const surfaceVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
} satisfies Variants;

export const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
} satisfies Variants;

/* ---------- Legacy duration tokens (CSS sync) ----------------------------- */

export const duration = {
  instant: 80,
  press: 120,
  fast: 120,
  exit: 100,
  selection: 180,
  disclosure: 200,
  moderate: 180,
  slow: 260,
} as const;

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
  standard: [0.2, 0, 0, 1] as const,
  emphasized: [0.2, 0.8, 0.2, 1] as const,
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

/**
 * Radix Select, DropdownMenu, Combobox, and Popover content panels.
 * Keyframes menu-in and menu-out live in globals.css and use --travel-close.
 * Class strings reference CSS duration and easing vars synced with durationCss
 * and easeCss above.
 */
export const menuSurfaceAnimationClasses =
  "data-[state=open]:animate-[menu-in_var(--duration-fast)_var(--ease-out)] data-[state=closed]:animate-[menu-out_var(--duration-exit)_var(--ease-exit)]" as const;

export function menuSurfaceReducedMotionStyle(
  reduceMotion: boolean | null | undefined,
): { animationDuration: string; animationTimingFunction: string } | undefined {
  if (!reduceMotion) return undefined;
  return {
    animationDuration: durationCss.exit,
    animationTimingFunction: easeCss.linear,
  };
}

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

export const loadingThresholdCss = `${LOADING_THRESHOLD_MS}ms`;

export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type MotionTransition = Transition;

/** Onboarding / wizard step change - opacity only. */
export function wizardSlideVariants(reduced: boolean): {
  variants: Variants;
  transition: MotionTransition;
} {
  return {
    variants: {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    },
    transition: legacyTransition(reduced, duration.moderate, ease.standard),
  };
}

function legacyTransition(
  reduced: boolean,
  ms: number,
  curve: readonly [number, number, number, number],
): MotionTransition {
  if (reduced) return { duration: duration.exit / 1000, ease: "linear" };
  return { duration: ms / 1000, ease: curve };
}

export function motionSafe<T>(reduced: boolean, animated: T, staticVariant: T): T {
  return reduced ? staticVariant : animated;
}

/** Opacity-only tween; 0ms under reduced motion. */
export function opacityTween(reduced: boolean, key: keyof typeof tween = "fade"): MotionTransition {
  if (reduced) return { duration: 0 };
  return tween[key];
}

/** Popover / menu surface enter and exit. */
export function floatingSurfaceVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }
  return surfaceVariants;
}

export function floatingSurfaceTransition(reduced: boolean): MotionTransition {
  return reduced ? { duration: 0 } : spring.snap;
}

/** Bottom sheet enter and exit. */
export function sheetSurfaceVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0, y: "100%" },
      visible: { opacity: 1, y: 0 },
    };
  }
  return sheetVariants;
}

export function sheetSurfaceTransition(reduced: boolean): MotionTransition {
  return reduced ? tween.sheetReduced : spring.sheet;
}

/** Replace popover step chip groups. */
export function replaceChipEnterVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }
  return {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  };
}

export function replaceChipExitVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }
  return {
    hidden: { opacity: 0, y: 4, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };
}

export function replaceChipEnterTransition(reduced: boolean): MotionTransition {
  return reduced ? { duration: 0 } : spring.snap;
}

export function replaceChipExitTransition(reduced: boolean): MotionTransition {
  return opacityTween(reduced, "chipExit");
}

/** Optimistic meal row text swap. */
export function mealSwapVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 3 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 3 },
  };
}

export function mealSwapTransition(reduced: boolean): MotionTransition {
  return opacityTween(reduced, "mealSwap");
}

/** Height and opacity expansion for rows that reveal detail in place. */
export function disclosureTransition(reduced: boolean) {
  return legacyTransition(reduced, duration.disclosure, ease.standard);
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

export function selectionTransition(reduced: boolean) {
  return legacyTransition(reduced, duration.selection, ease.standard);
}

export function progressTransition(reduced: boolean) {
  return legacyTransition(reduced, duration.moderate, ease.standard);
}

export function dialogTransition(reduced: boolean) {
  return legacyTransition(reduced, duration.disclosure, ease.emphasized);
}

export function menuContentTransition(reduced: boolean) {
  return legacyTransition(reduced, duration.fast, ease.standard);
}

export function menuExitTransition(reduced: boolean) {
  if (reduced) return { duration: duration.exit / 1000, ease: easeCss.linear };
  return { duration: duration.exit / 1000, ease: [...ease.exit] };
}

export function toastTransition(reduced: boolean) {
  return legacyTransition(reduced, duration.disclosure, ease.standard);
}
