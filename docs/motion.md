# Motion system

Engineering reference for interaction timing. Motion is immediate, precise, spatially coherent, interruptible and purposeful. It borrows Linear’s restraint, not its look.

Source of truth: `src/lib/motion.ts`. CSS custom properties in `src/app/globals.css` must match, and `src/lib/__tests__/motion-tokens.test.ts` fails the build if they drift.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--duration-instant` | 80ms | Colour-only hover on dense rows |
| `--duration-press` | 110ms | Press feedback |
| `--duration-fast` | 140ms | Hover, focus, menu, tooltip, popover, toast enter |
| `--duration-exit` | 100ms | Matching exits (~60–70% of enter) |
| `--duration-selection` | 170ms | Active-navigation indicator, selected controls, tab underline |
| `--duration-disclosure` | 200ms | Disclosure expand/collapse, dialog, sheet |
| `--duration-moderate` | 240ms | Main content transition, progress, wizard step |
| `--duration-slow` | 360ms | Ceiling. Longer is a bug |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Exits |
| `--ease-state` | `cubic-bezier(0.2, 0, 0, 1)` | State changes: selection, press, chevron |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Legacy exits |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Reversible only |
| `--ease-linear` | `linear` | Opacity crossfade, skeleton pulse |
| `--travel-hair` | 2px | Press depth |
| `--travel-close` | 4px | Menu / tooltip entry |
| `--travel-near` | 8px | Popover, toast, dialog, main content settle |
| `--travel-far` | 80px | Off-canvas sheet |
| `--stagger` | 24ms | Cap at 8 items; beyond that fade the container |

`pressScale` is `0.985`, shared by `Button` and interactive rows.

## Required behaviours

| Where | Behaviour | Helper |
| --- | --- | --- |
| Product rail, mobile tabs, lesson index | Shared active indicator that travels between items | `selectionTransition` + framer `layoutId` |
| Biomarker rationale, daily-plan detail | Height and opacity expansion in place | `disclosureVariants` / `disclosureTransition` |
| Main content on navigation | Crossfade plus 8px vertical settle | `pageContentVariants` |
| Dialog, sheet | 200ms in, 100ms out | `dialogTransition`, CSS keyframes |
| Progress | Animates from the previous value, never from zero | `progressTransition` + `initial={false}` |
| Buttons | `scale(0.985)` on press | `pressAnimation` / `pressTransition` |
| Interactive rows | Colour change on hover, 2px directional icon travel | Tailwind `group-hover:translate-x-0.5` |
| Loading | Skeleton dimensions match the resolved content, so nothing jumps | `PortalSkeleton` and friends |

Springs (JS only, framer-motion):

| Name | stiffness / damping / mass | Use |
| --- | --- | --- |
| `snappy` | 420 / 32 / 0.85 | Press, toggle, toast |
| `smooth` | 260 / 28 / 1 | Layout, tab underline |
| `gentle` | 180 / 26 / 1 | Large surfaces |

No visible overshoot on utility controls.

## Hard rules

1. Animate only `transform` and `opacity`.
2. Exits at ~60–70% of entrance duration.
3. Every animation is interruptible — no queues on double-click.
4. Never CSS keywords `ease` or `ease-in-out`.

## Interaction state matrix

Every interactive control implements all seven:

| State | Behaviour |
| --- | --- |
| rest | Default |
| hover | 140ms colour/surface only. No elevation change, no movement of the row itself |
| press | `scale(0.985)`, 110ms, `--ease-state`, via `whileTap` |
| focus | `:focus-visible` only. 2px accent ring + 2px offset, following the element's own radius. The ring must never redefine `border-radius` |
| loading | Nothing under 300ms. Over 300ms keep width, swap content, `aria-busy` |
| disabled | Fill drops rather than the label fading, so the text stays readable. Reason via `title` / `disabledReason` |
| error | Mark + text (see `docs/status-colour.md`). Space reserved; no jump |

## Reduced motion

First-class, not a downgrade. `useReducedMotion` (framer) and `usePrefersReducedMotion` handle JS because framer writes inline styles that ignore the CSS media query.

Under reduced motion: zero translation, zero scale, opacity only, durations clamped to ≤100ms (`duration.exit`).

OS setting must be verified visually.

## Focus restore (where focus lands)

| Close case | Focus returns to |
| --- | --- |
| Dialog / confirm | Trigger that opened it (Radix) |
| Select / dropdown / popover | Trigger |
| Command menu (⌘K) | Previously focused element / opener |
| Toast dismiss | No steal; leave focus where it was |
| Delete from menu → confirm | Confirm dialog; Cancel/Delete restore to menu trigger chain |

## Cursor decision

`--cursor-control: default` on buttons and menu items; `--cursor-link: pointer` on links. Chosen to match Linear / native apps rather than web-default hand cursor on every control.

## What not to build

Scroll reveals, parallax, blur-in text, animated gradients, page transition overlays, visible spring bounce on utility controls, long staggers, hover lift on list rows, motion on readable text, spinners under 300ms.
