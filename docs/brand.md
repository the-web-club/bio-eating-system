# Brand token reference

Product identity: **Well with Katarina**. Written as one signature in natural casing, never a stacked `KATARINA / Portal` pair.

## The mark

The wordmark is a supplied script drawing at `public/brand/well-with-katarina.png`, trimmed to its own edges (189×91, transparent) by `scripts/prepare-logo.mjs`.

It is rendered as an **alpha mask**, not an `<img>`: the `.brand-mark` utility paints `--brand-mark` through the artwork. That is what lets the mark carry the artwork's indigo on the light canvas and switch to the foreground ink on the dark one, from a token rather than a filter hack. Set a height on the element; the artwork's aspect ratio supplies the width, so the box is reserved before the mask loads.

`BrandSignature` is the only component allowed to draw it. It always ships an `sr-only` product name, because a masked span has no accessible text of its own.

The source artwork is 246 px wide, so the mark is soft above roughly 130 px on a 2× display. An SVG would remove that ceiling.

Tokens live in `src/app/globals.css` in three layers, and components reference layer 3 only. Adding a colour means adding a token.

| Layer | What it holds | Changes per theme |
|---|---|---|
| 1 primitives | `--paper-*`, `--stone-*`, `--ink-*`, `--mineral-*`, `--slate-*`, feedback scales. No meaning in the name. | no |
| 2 semantics | Role aliases: `--surface`, `--foreground-muted`, `--accent`, `--confirm-fill`. | yes, under `.dark` |
| 3 `@theme inline` | Binds semantics to Tailwind utilities: `bg-surface`, `text-muted`, `rounded-button`. | n/a |

Contrast is enforced by `src/lib/__tests__/palette-contrast.test.ts`, which parses this file, resolves the `var()` chain, composites translucent tokens over their backdrop and asserts **4.5:1** for text and **3:1** for marks and non-text UI in both themes. Change a colour and the test tells you whether it still holds - no table here needs manual upkeep.

## Palette direction

Warm, near-white canvas rather than cold dashboard grey. Deep warm ink for type. Stone for secondary surfaces and dividers. One mineral accent, derived from the original product blue but deepened and desaturated so it reads as considered rather than default SaaS.

| Family | Role |
|---|---|
| `--paper-*` | Canvas and object surfaces. `#FBFAF8` canvas, `#FFFFFF` objects. |
| `--stone-*` | Inset surfaces, progress tracks, dividers. |
| `--ink-*` | Type, and the light-mode feature panel fill. |
| `--mineral-*` | The single brand accent. Light uses `--mineral-700`, dark uses `--mineral-300`. `--mineral-950` is the dark-mode feature panel, tinted so the dominant surface still reads as emphasis rather than a lighter grey. |
| `--indigo-900` | Sampled from the wordmark artwork. Consumed only by `--brand-mark`. |
| `--slate-*` | Dark-mode neutrals. |
| green / red | Genuine semantic feedback only. Never decoration. |

The page must not look blue at rest. Accent is reserved for the active navigation rail, focus rings, selected controls, progress, the primary action and small moments of emphasis. Body links are not accent-coloured by default.

### Feedback: text, mark and fill are different roles

A colour that reads as body copy on the canvas is not the same colour that carries white text as a fill. They are separate tokens and must not be interchanged.

| Token | Measured against | Minimum |
|---|---|---|
| `--confirm`, `--danger` | the surface behind them | 4.5:1 |
| `--confirm-icon`, `--danger-icon` | the surface behind them | 3:1 |
| `--confirm-fill`, `--danger-fill` | `--on-fill` (white) | 4.5:1 |

## Elevation

Four levels. A level-2 object takes a hairline border **or** a minimal shadow, never both.

| Level | What | Treatment |
|---|---|---|
| 0 | Page canvas | No border, no shadow |
| 1 | Separated section | Spacing, a surface shift (`bg-surface-inset`), or one hairline |
| 2 | Interactive object | `Panel`, one border, or `shadow-object` |
| 3 | Floating interface | Menus, popovers, dialogs, sheets, `shadow-floating` / `shadow-modal` |

Target roughly 70-80% flat canvas, 15-20% differentiated surface, and at most one visually dominant elevated surface per viewport. The one dominant surface is `ProgramPanel`, on `--surface-feature`.

Borders are low contrast, communicate separation or interaction, and usually appear on a single edge or as a divider rather than enclosing a group.

## Shape

Restrained. Not every object is rounded, and pills are opt-in.

| Token | Value | Use |
|---|---|---|
| `rounded-badge` | 5px | Status indicators, checkbox |
| `rounded-control` | 6px | Small controls, menu items, nav items |
| `rounded-input` | 8px | Inputs, compact actions |
| `rounded-button` | 9px | Primary and secondary actions |
| `rounded-panel` | 11px | Large interactive panels, floating menus |
| `rounded-dialog` | 13px | Dialogs and sheets |
| `rounded-pill` | full | Compact filters, toggle groups, removable selections, progress lines, the appearance switch |

Pills are never the default shape for a primary action.

## Type

Inter via `next/font`, used as the primary hierarchy system. Sentence case throughout; bold is rationed.

| Token | Size | Use |
|---|---|---|
| `text-editorial` | 34px | Page title. Tight tracking, weight 500, not `text-4xl font-bold`. |
| `text-display` | 24px | Section-level or panel title |
| `text-section` | 17px | Section heading |
| `text-title` | 15px | Row title |
| `text-lead` | 15px | Page description, comfortable line height |
| `text-body` | 14px | Default copy and dense rows |
| `text-small` | 13px | Supporting copy, labels |
| `text-meta` | 12px | Structured values, with `font-meta` |
| `text-micro` | 11px | Eyebrows, with `.u-caps` |

Monospace (`font-meta`) is only for structured values: quantities, units, week indices. Never for labels, statuses or descriptions.

`.u-caps` is for headings, tab labels, badges and step counters, capped at about six words. Never a sentence, paragraph, error or input label. Catalogue and DOM text stay sentence case.

Educational reading columns use `.measure` (64ch) or `.measure-narrow` (52ch). Operational lists stay wide.

## Spacing rhythm

| Token | Value | Use |
|---|---|---|
| `spacing-tight` | 16px | Internal spacing of compact interactive elements |
| `spacing-group` | 28px | Between related content groups |
| `spacing-section` | 56px | Between major sections |
| `spacing-gutter` | 20px | Mobile page padding |
| `spacing-rail` | 240px | Product rail width |

Desktop page padding steps to 32px, then 40px at `xl`. `PageShell` is wide (76rem) by default and `reading` (52rem) only where the content is educational - a narrow centred column is not the default.

## Status without badges

State is read from the composition, not from a badge on every module. See `ModuleRow`.

| State | Treatment |
|---|---|
| Active | Strong title, primary action, progress. No "ACTIVE" pill, `ProgramPanel` hierarchy says it. |
| Included | Ordinary interactive row, quiet metadata such as "Available in your plan" |
| Locked | Lock icon, full text contrast, an explicit action such as "View upgrade" or "Explore biomarker support". Emphasis is reduced by hierarchy, never by opacity. |
| Coming soon | Editorial row, quiet metadata, no interactive affordance |
| Completed | Compact check plus context. Never a filled green container. |

Colour is never the only distinction.

## Related

- Motion / interaction matrix: [motion.md](./motion.md)
- Status colour hierarchy: [status-colour.md](./status-colour.md)
- Prompt pointer: [cursor-branding-tokens.md](./cursor-branding-tokens.md)
