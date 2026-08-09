import { ThemeControl } from "@/components/portal/theme-control";
import { ProofShowcase } from "./proof-showcase";

const SURFACES = [
  { name: "surface-canvas", className: "bg-surface-canvas border border-hairline" },
  { name: "surface", className: "bg-surface border border-hairline" },
  { name: "surface-inset", className: "bg-surface-inset" },
  { name: "surface-selected", className: "bg-surface-selected" },
  { name: "surface-feature", className: "bg-surface-feature text-on-feature" },
  { name: "accent-fill", className: "bg-accent-fill text-on-accent" },
  { name: "accent-subtle", className: "bg-accent-subtle text-foreground" },
  { name: "confirm-subtle", className: "bg-confirm-subtle text-foreground" },
  { name: "danger-subtle", className: "bg-danger-subtle text-foreground" },
] as const;

const TEXT_TOKENS = [
  { name: "foreground", className: "text-foreground" },
  { name: "soft", className: "text-soft" },
  { name: "muted", className: "text-muted" },
  { name: "faint", className: "text-faint" },
  { name: "disabled", className: "text-disabled" },
  { name: "accent-text", className: "text-accent-text" },
  { name: "confirm", className: "text-confirm" },
  { name: "danger", className: "text-danger" },
] as const;

const RADII = [
  { name: "control · 6", className: "rounded-control" },
  { name: "badge · 5", className: "rounded-badge" },
  { name: "input · 8", className: "rounded-input" },
  { name: "button · 9", className: "rounded-button" },
  { name: "panel · 11", className: "rounded-panel" },
  { name: "dialog · 13", className: "rounded-dialog" },
] as const;

export default function TokenProofPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[64rem] flex-col gap-section px-gutter py-group sm:px-10">
      <header className="flex flex-col gap-4 border-b border-hairline pb-group sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-micro text-faint u-caps">Tokens</p>
          <h1 className="mt-2 text-editorial text-foreground">
            Colour, type and interaction
          </h1>
          <p className="mt-2 measure text-lead text-muted">
            Surfaces, status hierarchy and primitives with the full state matrix. Use
            the greyscale and reduced-motion toggles in the playground below.
          </p>
        </div>
        <ThemeControl />
      </header>

      <section aria-labelledby="surfaces-heading">
        <h2 id="surfaces-heading" className="text-section text-foreground">
          Surfaces
        </h2>
        <ul className="mt-tight grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SURFACES.map((token) => (
            <li
              key={token.name}
              className={`rounded-panel px-4 py-6 text-body ${token.className}`}
            >
              {token.name}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="text-heading">
        <h2 id="text-heading" className="text-section text-foreground">
          Text colour
        </h2>
        <ul className="mt-tight divide-y divide-hairline border-t border-hairline">
          {TEXT_TOKENS.map((token) => (
            <li key={token.name} className={`py-2.5 text-body ${token.className}`}>
              {token.name}: the quick brown fox
            </li>
          ))}
        </ul>
        <p className="mt-tight flex items-center gap-2 text-body text-confirm">
          <span className="text-confirm-icon" aria-hidden="true">
            ●
          </span>
          Confirm state with label and icon
        </p>
        <p className="mt-1 flex items-center gap-2 text-body text-danger">
          <span className="text-danger-icon" aria-hidden="true">
            ●
          </span>
          Danger state with label and icon
        </p>
      </section>

      <section aria-labelledby="type-heading">
        <h2 id="type-heading" className="text-section text-foreground">
          Type scale
        </h2>
        <div className="mt-tight space-y-3 border-t border-hairline pt-tight">
          <p className="text-editorial text-foreground">Editorial thirty four</p>
          <p className="text-display text-foreground">Display twenty four</p>
          <p className="text-section text-foreground">Section seventeen</p>
          <p className="text-title text-foreground">Title fifteen</p>
          <p className="text-lead text-foreground">Lead fifteen for reading.</p>
          <p className="text-body text-foreground">Body fourteen for dense rows.</p>
          <p className="text-small text-foreground">Small thirteen for supporting copy.</p>
          <p className="font-meta text-meta tabular text-muted">1 850 kcal · 140 g</p>
          <p className="text-micro text-faint u-caps">Micro eleven eyebrow</p>
        </div>
      </section>

      <section aria-labelledby="radius-heading">
        <h2 id="radius-heading" className="text-section text-foreground">
          Radius
        </h2>
        <ul className="mt-tight flex flex-wrap gap-3">
          {RADII.map((token) => (
            <li
              key={token.name}
              className={`border border-hairline px-4 py-3 text-small text-muted ${token.className}`}
            >
              {token.name}
            </li>
          ))}
        </ul>
      </section>

      <ProofShowcase />
    </main>
  );
}
