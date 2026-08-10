# Motion system

Engineering reference for interaction timing. Content is static by default. Motion confirms interaction, state change, hierarchy, loading, or feedback - it never decorates.

Source of truth: `src/lib/motion.ts`. CSS custom properties in `src/app/globals.css` must match, and `src/lib/__tests__/motion-tokens.test.ts` fails the build if they drift.

## Principles

1. **Page load:** almost no animation. The interface is immediately visible.
2. **Navigation:** subtle active-state transition on the rail only, no page-wide crossfade.
3. **Cards and sections:** static. No floating, scaling, or continuous motion.
4. **Buttons:** colour and an optional 1px hover lift. No scale on press.
5. **Modals / popovers / menus:** opacity plus a 4px vertical settle. No scale.
6. **Replace meal:** localized row dimming and panel fade within the affected row only.
7. **Shopping list:** checkbox and row opacity transition when an item is checked.
8. **Progress:** animates from the previous value when it actually changes.
9. **Skeleton:** only while genuinely loading.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--duration-instant` | 80ms | Colour-only hover on dense rows |
| `--duration-press` | 120ms | Legacy press alias |
| `--duration-fast` / `--motion-fast` | 120ms | Hover, focus, menus, tooltips |
| `--duration-exit` | 100ms | Matching exits (~60-70% of enter) |
| `--duration-selection` / `--motion-normal` | 180ms | Active navigation, checkbox, row state |
| `--duration-disclosure` | 200ms | Disclosure, replace panel, toast |
| `--duration-moderate` | 180ms | Wizard step, progress |
| `--duration-slow` / `--motion-slow` | 260ms | Ceiling. Longer is a bug |
| `--ease-standard` / `--ease-state` | `cubic-bezier(0.2, 0, 0, 1)` | Default UI easing |
| `--ease-emphasized` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Dialog entrance only |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Exits |
| `--travel-close` | 4px | Menu, tooltip, toast, dialog settle |
| `--loading-threshold` | 300ms | Show loading state only after this delay |

Shared CSS transition for controls:

```css
transition:
  opacity var(--motion-fast) var(--ease-standard),
  transform var(--motion-fast) var(--ease-standard),
  background-color var(--motion-fast) var(--ease-standard),
  border-color var(--motion-fast) var(--ease-standard);
```

## Required behaviours

| Where | Behaviour | Helper |
| --- | --- | --- |
| Product rail, mobile tabs, lesson index | Shared active indicator that travels between items | `selectionTransition` + framer `layoutId` |
| Biomarker rationale, daily-plan detail | Height and opacity expansion in place | `disclosureVariants` / `disclosureTransition` |
| Main content on navigation | Static, no entrance animation | `PageTransition` passthrough |
| Dialog, sheet, menu, popover | Opacity + 4px settle. Dialog uses emphasized easing | CSS keyframes |
| Progress | Animates from the previous value, never from zero | `progressTransition` + `initial={false}` |
| Buttons and action links | Colour + optional 1px hover lift | `actionClassName` |
| Replace meal | Row dims locally; panel fades in within the row | `MealListWithReplace` |
| Shopping list check | Row opacity on checked state | `WeeklyShopList` |
| Toast | Opacity + 4px settle. No spring, stack scale, or drag | `toastTransition` |
| Loading | Skeleton dimensions match resolved content | `PortalSkeleton` |

No springs on utility controls.

## Hard rules

1. Animate only `transform` and `opacity`, plus colour on interactive surfaces.
2. Exits at ~60-70% of entrance duration.
3. Every animation is interruptible, no queues on double-click.
4. Never CSS keywords `ease` or `ease-in-out` on product surfaces.

## Reduced motion

First-class, not a downgrade. `useReducedMotion` (framer) and `usePrefersReducedMotion` handle JS because framer writes inline styles that ignore the CSS media query.

Under reduced motion: zero translation, zero scale, opacity only, durations clamped to ≤100ms (`duration.exit`).

## What not to build

Scroll reveals, parallax, page-wide entrance fades, staggered text reveals, animated headings, animated cards, floating effects, perpetual/ambient animation, visible spring bounce, hover lift on list rows, motion on readable text by default, spinners under 300ms.

## Acceptance

If a user opens any page and does nothing, the interface feels essentially still. Animation becomes noticeable primarily because the user interacted with something.
