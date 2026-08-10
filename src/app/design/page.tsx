import { ProofShowcase } from "../proof-showcase";

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
  { name: "control · 2", className: "rounded-control" },
  { name: "surface · 2", className: "rounded-surface" },
  { name: "sheet · 12", className: "rounded-sheet" },
  { name: "pill · cap", className: "rounded-pill" },
] as const;

export default function DesignTokenPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[64rem] flex-col gap-section px-gutter py-group sm:px-10">
      <header className="border-b border-hairline pb-group">
        <p className="text-label text-faint">Tokens</p>
        <h1 className="mt-2 text-display-serif text-foreground">
          Colour, type and interaction
        </h1>
        <p className="mt-2 measure text-body-lg text-muted">
          Surfaces, status hierarchy and primitives with the full state matrix. Use
          the greyscale and reduced-motion toggles in the playground below.
        </p>
      </header>

      <section aria-labelledby="surfaces-heading">
        <h2 id="surfaces-heading" className="text-body-lg font-semibold text-foreground">
          Surfaces
        </h2>
        <ul className="mt-tight grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SURFACES.map((token) => (
            <li
              key={token.name}
              className={`rounded-surface px-4 py-6 text-body ${token.className}`}
            >
              {token.name}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="text-heading">
        <h2 id="text-heading" className="text-body-lg font-semibold text-foreground">
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
        <h2 id="type-heading" className="text-body-lg font-semibold text-foreground">
          Type roles
        </h2>
        <div className="mt-tight space-y-3 border-t border-hairline pt-tight">
          <p className="text-display-serif text-soft">Display</p>
          <p className="text-section-serif text-soft">Section</p>
          <p className="text-body-lg text-foreground">Body large for meal lines and intros.</p>
          <p className="text-body text-foreground">Body for dense UI rows.</p>
          <p className="text-meta text-muted">Meta for supporting copy.</p>
          <p className="text-meta tabular text-muted">Week 01 of 04</p>
          <p className="text-label text-muted">Label</p>
          <p className="text-control text-muted">Control</p>
        </div>
      </section>

      <section aria-labelledby="radius-heading">
        <h2 id="radius-heading" className="text-body-lg font-semibold text-foreground">
          Radius
        </h2>
        <ul className="mt-tight flex flex-wrap gap-3">
          {RADII.map((token) => (
            <li
              key={token.name}
              className={`border border-hairline px-4 py-3 text-meta text-muted ${token.className}`}
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
