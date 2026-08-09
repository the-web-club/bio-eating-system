# rules.md — Cursor operating rules for `bio-eating-system`

Repo: `github.com/the-web-club/bio-eating-system`
Also usable as `.cursor/rules/project.mdc` with `alwaysApply: true`.

These rules are binding. If a rule blocks the task, stop and report the conflict instead of working around it.

---

## 1. Working method

1. Audit before implement. Before editing, read every file you are about to touch and report what is actually there. Never assume a symbol, column, or route exists because a plan document mentions it.
2. Deliver complete files. When a file changes, output the entire final file, not a diff or a fragment. No `// ... rest unchanged`.
3. One concern per change. Do not refactor unrelated code in the same pass.
4. After any change touching Prisma, types, or tokens, run `pnpm build` and report the real output. Do not claim a build passes without running it.
5. If a requirement is ambiguous, ask. Do not invent business logic, portion sizes, medical thresholds, or copy.

## 2. Stack, pinned

1. Next.js App Router, React, TypeScript strict. Package manager is `pnpm`.
2. Tailwind CSS v4. Configuration lives in CSS via `@theme inline`, not in a `tailwind.config.js` theme block.
3. Prisma with the `prisma-client` generator and an explicit `output`. Import from the generated path, never from `@prisma/client`.
4. Database is MariaDB (MariaDB Cloud Serverless). Provider stays `mysql`.
5. Auth is Better Auth. There is no other session mechanism.
6. Transactional email is Resend, via `src/lib/mail.ts` only. No route calls the Resend SDK directly.
7. Hosting is Vercel. Every route must be serverless-safe: no long-lived connections, no in-process schedulers, no filesystem writes.

## 3. Design tokens — hard rule

1. No raw colour values in components. No hex, `rgb()`, `oklch()`, `hsl()`, or named colours in any `.tsx` file. Not in `className`, not in `style`, not in arbitrary values like `bg-[#007AFF]`.
2. No Tailwind palette utilities. `bg-white`, `text-black`, `bg-neutral-50`, `text-neutral-400`, `border-neutral-100`, and every `-500`/`-600` variant are banned. Use semantic utilities only: `bg-surface`, `bg-surface-raised`, `text-foreground`, `text-muted`, `border-hairline`, `bg-accent`, `text-on-accent`, `text-accent-text`, `bg-confirm`, `text-danger`, `text-confirm`.
3. Three-layer token flow, defined only in `src/app/globals.css`:
   - Layer 1, primitives: raw scale in `:root`, no meaning in the name.
   - Layer 2, semantics: aliases that map primitives to roles, overridable under `.dark`.
   - Layer 3, `@theme inline`: binds semantics to Tailwind utility names.
   Components may only reference layer 3. Adding a colour means adding a token, not a literal.
4. Radius, spacing, type scale, and shadow follow the same rule. Use `rounded-pill`, `rounded-card`, `text-display`, `text-lead`, `text-meta`. No `rounded-2xl`, no `text-[22px]`. See `docs/brand.md` for the full scale.
5. Dark mode is a token override, never a conditional in a component.
6. One exception: email HTML. Mail clients do not support custom properties, so inline hex is permitted inside `src/lib/mail.ts` and email templates only. Keep those values in a single exported constant per template so they stay auditable.

## 4. Data and safety rules — do not relax

1. **Allergens and exclusions are structured data only.** Exclusion is driven by the `declaredAllergens` enum and the `excludedSlots` enum. Free text is never parsed to decide what a person eats. Never reintroduce keyword or substring scanning of user text to drive a plan.
2. **The screening gate is not bypassable.** `src/lib/nutrition/screening.ts` decides whether an energy deficit may be generated at all. No route, component, or admin flag may override its result. If it returns a refusal, the plan is generated at maintenance and the refusal reason is surfaced to the user.
3. **No health claims in generated copy.** Do not write, restore, or extend text that says a food, nutrient, or portion prevents, treats, cures, or modifies a disease, hormone, biomarker, or body-fluid state. This is EU Regulation 1924/2006 territory and the constraint is legal, not stylistic. Descriptive claims must come from the approved-claims content table, authored outside the codebase and signed off.
4. **Lab reference ranges are never presented as targets.** Biomarker content is reference-only, read-only, and carries the professional-consultation notice. No "target" field, no pass/fail styling, no progress bars against a range.
5. **Nutrition and lesson content is not model-generated.** Slot science text, lesson bodies, and preparation guidance come from `content/` files reviewed by a registered dietitian. If a content key is missing, render the empty state. Never fill the gap with plausible text.
6. Biometric and health data is GDPR Article 9 special category data. Never log it, never put it in an error message, never send it to a third party outside the documented processors, never include it in analytics events.

## 5. Security rules

1. Every inbound webhook verifies an HMAC signature over the **raw** request body with `timingSafeEqual`, plus a timestamp freshness window. Presence of a header is not verification. Never `await request.json()` before capturing the raw text.
2. Every webhook is idempotent via a stored provider event id and a unique constraint. Replays must be no-ops.
3. Entitlements are set only by a verified webhook or an admin action recorded in the audit log. Never from a client request body.
4. Every `/portal/*` route and every `/api/portal/*` handler resolves the session server-side and returns 401 without one. There is no hardcoded or mocked user, in any environment.
5. All request bodies are validated with a Zod schema at the boundary. No `any`, no unchecked destructuring of a payload.
6. Cron routes check `Authorization: Bearer ${CRON_SECRET}` with a constant-time compare.
7. Secrets come from a validated env module. No `process.env.X || ''` fallbacks, which turn a missing secret into a silent open door.

## 6. Email rules

1. Every non-transactional email carries a working one-click unsubscribe link built from the recipient's `unsubscribeToken`, plus `List-Unsubscribe` headers.
2. Suppressed and unsubscribed recipients are filtered in the query, not after the send call.
3. Bulk sends are batched and idempotent. One row per user per drop, guarded by a unique constraint, so a retry cannot double-send. Never advance a user's schedule cursor before the send is confirmed.
4. No loop of individual `send` calls over an unbounded user list inside one request.

## 7. Database workflow

1. Never run `prisma migrate dev`, `prisma db push`, or `prisma migrate reset` against any environment.
2. Generate SQL with `prisma migrate diff`, review it by hand, apply with `prisma migrate deploy`.
3. Every schema change ships with its migration in the same commit.
4. No destructive migration without an explicit written go-ahead in the task.

## 8. Copy rules

1. UI copy is plain, second person, sentence case, active voice. Label what the person controls, not how the system works. Heading *case* (uppercase via `.u-caps`) is a typographic decision governed by `docs/brand.md`, not by typing shouted strings into catalogues. Catalogue and DOM text stay sentence case; apply `.u-caps` only to headings, tab labels, badges, and step counters, capped at roughly six words. Never uppercase a sentence, paragraph, error, or input label.
2. Banned vocabulary in user-facing strings: matrix, engine, protocol, calibrate, initialize, operating system, entitlement, slot (as a user-facing noun), execution, autopilot, blueprint, deploy.
3. A button and its result use the same verb. "Save plan" produces "Plan saved."
4. Errors say what happened and what to do next. They do not apologise and are never vague.
5. Client-facing Dutch output stays Dutch. Code, comments, commit messages, and these rules stay English.

## 9. What to do when a rule and a request collide

State the rule, state what the request would require, and propose the compliant alternative. Do not silently pick one.
