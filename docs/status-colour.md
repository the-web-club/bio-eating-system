# Status colour

Colour is a signal carried by a small mark, not a tinted surface. Hierarchy starts at neutral and earns each step up.

## Hierarchy

| Role | When | Surface |
| --- | --- | --- |
| **neutral** | Default for almost everything: confirmations, completion, empty states, “here is what happened”, screening refusal, maintenance-only, allergen “left out” lists | No wash |
| **info** | Notice, no action required | Mark only (accent). No wash unless justified |
| **success** | Persistent state, not action ack. Saved forms stay neutral text + check | Mark only. No wash unless justified |
| **danger** | Blocks: destructive confirm, validation failure, hard stop | Only role allowed a wash |

## Product-critical rule

Screening refusal and maintenance-only are **not** errors. Style as **neutral**: foreground text, mono informational mark, generous spacing, no wash, no red, no warning triangle.

Same for “left out of your plan” allergen lists - confirmation, not warning.

## Tokens (four per role)

Mapped from primitives in `globals.css`. Never invent new primitive hues at the semantic layer.

### Light

| Role | text | mark | line | wash |
| --- | --- | --- | --- | --- |
| neutral | foreground | foreground-muted | hairline-strong | surface-inset |
| info | `--mineral-700` | `--mineral-500` | mark @ 24% | mark @ 5% |
| success | `#1D6F3F` | `#2E9B57` | mark @ 24% | mark @ 5% |
| danger | `#A62B21` | `#D93B2E` | mark @ 28% | mark @ 5% |

### Dark (lightened + desaturated)

| Role | text | mark | line | wash |
| --- | --- | --- | --- | --- |
| neutral | foreground | foreground-muted | hairline-strong | surface-inset |
| info | `#8AB4E8` | `#6BB3FF` | mark @ 28% | mark @ 6% |
| success | `#5DCAA0` | `#6BCB95` | mark @ 28% | mark @ 6% |
| danger | `#E07A72` | `#FF6B61` | mark @ 30% | mark @ 6% |

Targets: text ≥ 4.5:1, marks ≥ 3:1, on every surface the role can appear on. This is asserted in `src/lib/__tests__/palette-contrast.test.ts` against the real token values rather than recorded in a table here.

Filled destructive and confirm buttons do not use these text colours. They use `--danger-fill` / `--confirm-fill`, which are measured against white.

## Hard rules

1. Colour is never the only signal - icon + text. Greyscale playground must stay legible.
2. No full-width coloured banners. Status = icon + text + optional 1px left rule. Wash only for blocking danger.
3. No coloured input borders at rest. Error may take line colour on the input; never success colour on the input.
4. No green checkmarks decorating every row.
5. Destructive actions are text-and-icon by default. Filled red button only in the final confirmation step.
6. `Status` reports the outcome of an action or the state of a plan. Persistent guidance uses `InlineNote` instead, which has no rule and no wash.

## Component

`Status` in `src/components/ui/status.tsx` - `role: neutral | info | success | danger`, optional `wash` (honoured only for danger).
