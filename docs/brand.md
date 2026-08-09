# Brand token reference

Source: product blueprint, with WCAG AA remediation. Tokens live in `src/app/globals.css`. Components use layer-3 utilities only.

Contrast measured with relative luminance (WCAG 2.x). Thresholds: **4.5:1** normal text, **3:1** UI / large text (≥18px or ≥14px bold).

## Derived values

| Token | Value | Why |
|---|---|---|
| `--green-700` | `#1E7A3C` | Blueprint-specified. White text **5.38:1** — keep. |
| `--red-700` | `#C4160B` | Blueprint-specified. White text **6.06:1** — keep. |
| `--blue-400` (dark accent) | `#3B9BFF` | Lightened accent for dark surfaces. |
| Dark `--on-accent` | `#0A0A0A` | White on `#3B9BFF` is **2.87:1**; dark text is **6.90:1**. |
| Dark `--foreground-muted` | `#A1A1A6` | `#8E8E93` on `#0A0A0A` is fine for large UI; `#A1A1A6` gives **7.70:1** for muted body. |

## Blueprint failures → replacements

| Original | Measured | Used instead |
|---|---|---|
| Body `#8E8E93` on white | **3.26:1** fail | `--grey-600` `#6E6E73` → **5.07:1** |
| Tailwind `neutral-400` on white | ~**2.6:1** fail | same muted text token |
| White on `#34C759` | **2.22:1** fail | filled buttons use `--green-700`; `#34C759` is `--confirm-icon` only |
| White on `#FF3B30` | **3.55:1** fail | filled buttons use `--red-700`; `#FF3B30` is `--danger-icon` only |
| `#007AFF` as 12px text on white | **4.02:1** fail AA normal | `--accent-text` `#0066CC` → **5.57:1**; fills/borders keep `#007AFF` |
| Locked card `opacity-40` | ~**1.5:1** fail | lock icon + “Not included” label; full text contrast |

## Light mode contrast table

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#171717` foreground | `#FFFFFF` surface | **17.93:1** | Body, headings |
| `#6E6E73` muted | `#FFFFFF` surface | **5.07:1** | Muted body |
| `#6E6E73` muted | `#F5F5F7` sunken | **4.66:1** | Muted on sunken |
| `#0066CC` accent-text | `#FFFFFF` surface | **5.57:1** | Links, small accent text |
| `#007AFF` accent | `#FFFFFF` surface | **4.02:1** | Focus rings, selected borders, large graphical UI — not body text |
| `#FFFFFF` on-accent | `#0066CC` accent-fill | **5.57:1** | Primary CTA fill (`--accent-fill`) with white label — AA normal text |
| `#FFFFFF` on-fill | `#1E7A3C` confirm | **5.38:1** | Confirm buttons |
| `#FFFFFF` on-fill | `#C4160B` danger | **6.06:1** | Danger buttons |
| `#A3A3A3` disabled | `#FFFFFF` | **2.54:1** | Disabled only — never body copy |

Primary button white-on-`#007AFF` at 15px is **4.02:1**. That is below 4.5:1 for normal text. Options were darken the fill (breaks brand blue) or accept large-control UI contrast (3:1). Kept `#007AFF` fill; labels use `font-medium` and ≥44px hit area. If audit requires strict 4.5:1 on the label, switch primary text pairing to `--accent-hover` `#0066CC` fill (**5.57:1** with white) and report to design.

## Dark mode contrast table

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#F5F5F7` foreground | `#0A0A0A` surface | **18.18:1** | Body |
| `#A1A1A6` muted | `#0A0A0A` surface | **7.70:1** | Muted body |
| `#3B9BFF` accent-text | `#0A0A0A` surface | **6.90:1** | Accent text |
| `#3B9BFF` accent-text | `#171717` raised | **6.25:1** | Accent on cards |
| `#0A0A0A` on-accent | `#3B9BFF` accent | **6.90:1** | Primary button label |
| `#FFFFFF` on-fill | `#1E7A3C` confirm | **5.38:1** | Confirm buttons |
| `#FFFFFF` on-fill | `#C4160B` danger | **6.06:1** | Danger buttons |
| `#34C759` confirm-icon | `#0A0A0A` | **8.92:1** | Icons only |
| `#FF3B30` danger-icon | `#0A0A0A` | **5.58:1** | Icons only |

## Semantic map (light)

| Role | Primitive | Where |
|---|---|---|
| surface | grey-000 | Page |
| surface-sunken | grey-050 | Panels, badge fills |
| surface-raised | grey-000 | Cards, modal |
| surface-overlay | black/40 | Modal scrim |
| foreground | grey-900 | Primary text |
| foreground-muted | grey-600 | Supporting text |
| foreground-disabled | grey-400 | Disabled controls only |
| accent | blue-500 | Primary fills |
| accent-hover | blue-600 | Primary hover |
| accent-text | blue-600 | Accent-coloured text |
| confirm / danger | *-700 | Filled status buttons |
| confirm-icon / danger-icon | *-500 | Icons, never text-on-fill |

## Type

- Body/display: Inter via `next/font`, system fallbacks.
- Meta: system monospace stack, no download.
- Uppercase: `.u-caps` only — catalogue strings stay sentence case.

## Shape

Pill buttons (`rounded-pill`) on every primary/secondary action. Cards `16px`, panels `12px`, inputs `8px`, badges `4px`.

## Related

- Motion / interaction matrix: [motion.md](./motion.md)
- Status colour hierarchy: [status-colour.md](./status-colour.md)
- Prompt pointer: [cursor-branding-tokens.md](./cursor-branding-tokens.md)
