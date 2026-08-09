# Motion system

Engineering reference for interaction timing. Aesthetic stays blueprint (light, airy, pill). Standards borrow Linear’s restraint, not its look.

Source of truth: `src/lib/motion.ts`. CSS custom properties in `src/app/globals.css` must match.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--duration-instant` | 80ms | Hover, press colour, focus ring appear |
| `--duration-fast` | 140ms | Menu, tooltip, popover, toast enter |
| `--duration-exit` | 100ms | Matching exits (~60–70% of enter) |
| `--duration-moderate` | 240ms | Dialog, sheet, wizard step |
| `--duration-slow` | 360ms | Ceiling. Longer is a bug |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exits |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Reversible only |
| `--ease-linear` | `linear` | Opacity crossfade, progress |
| `--travel-hair` | 2px | Press depth |
| `--travel-close` | 4px | Menu / tooltip entry |
| `--travel-near` | 8px | Popover, toast, dialog |
| `--travel-far` | 80px | Wizard step slide |
| `--stagger` | 24ms | Cap at 8 items; beyond that fade the container |

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
| hover | 80ms colour/surface only. No movement on list rows |
| press | Scale 0.98 or 1px down, spring snappy, on `pointerdown` / `whileTap` |
| focus | `:focus-visible` only. 2px accent ring + 2px surface offset. Instant |
| loading | Nothing under 300ms. Over 300ms keep width, swap content, `aria-busy` |
| disabled | Reduced contrast, no hover/press, reason via `title` / `disabledReason` |
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
