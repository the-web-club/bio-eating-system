import { SurfacesDemo } from "./surfaces-demo";

export default function SurfacesDevPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[64rem] flex-col px-gutter py-s5 sm:px-10">
      <header className="border-b border-hairline pb-s5">
        <p className="text-label text-faint">Dev</p>
        <h1 className="mt-s2 text-section-serif text-foreground">
          Surface elevation
        </h1>
        <p className="mt-s2 measure text-body text-muted">
          All levels, interactive states, meal variants and scroll rails from
          surfaces.css. Toggle reduced motion to compare transform behaviour.
        </p>
      </header>
      <div className="mt-s6">
        <SurfacesDemo />
      </div>
    </main>
  );
}
