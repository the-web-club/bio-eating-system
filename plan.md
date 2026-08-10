# plan.md - `bio-eating-system` MVP

Repo: `github.com/the-web-club/bio-eating-system`
Stack: Next.js App Router, TypeScript strict, Tailwind v4 tokens, Prisma on MariaDB Cloud Serverless, Better Auth, Resend, Vercel, pnpm.

Read `rules.md` first. It is binding and this plan assumes it.

---

## 0. What this is

A decoupled customer portal that sits next to the public WordPress site. A purchase on WordPress fires a signed webhook, which creates the account and grants entitlements. The customer completes an intake, receives a personalised plan, and, on the subscription tier, a weekly grocery list by email.

Three surfaces:

1. Intake, a short multi-step form.
2. Portal, showing the current plan and the weekly list.
3. Automation, webhook in and weekly email out.

## 1. Carried-over defects from the previous blueprint

These were found in the prior document and are already fixed or explicitly scheduled below. They are listed so nobody reintroduces them.

1. `@resend/node` is not a package. It is `resend`, class `Resend`.
2. `isPortalActive` was written and queried but absent from the schema.
3. The dashboard JSX was truncated and could not compile.
4. The translation map had one key, so localisation threw on every other slot.
5. The intake posted to a route that did not exist.
6. Free-text keyword scanning decided allergen exclusions. A person typing "shellfish allergy" still got shellfish. This was the most serious defect.
7. The webhook checked only that a signature header was present, so any anonymous POST could grant paid access.
8. There was no auth. The portal user was a hardcoded `useState`.
9. cPanel MariaDB behind Vercel serverless. Remote MySQL is normally firewalled there and connection churn exhausts the pool. Moved to MariaDB Cloud Serverless, matching the CRM.
10. The cron looped sends serially, advanced the schedule cursor before confirming delivery, had no idempotency, and had no unsubscribe link.
11. Swap reallocation was iteration-order dependent, so reallocated grams silently vanished, and swap notices rendered for foods that were kept.
12. Every colour was a hardcoded hex and the closing instruction pinned components to white and black, which is the opposite of a token system.

## 2. Non-negotiable gates before any paid traffic

None of these are engineering tasks and all of them block launch.

1. **Dietitian sign-off.** All slot science, preparation guidance, and lesson content must be authored or reviewed by a registered dietitian and stored in `content/`, versioned, with the reviewer and date recorded. The codebase renders content, it does not author it.
2. **Health-claim review.** Statements tying foods or nutrients to hormones, biomarkers, inflammation, skin, or fluid retention are unauthorised health claims under EU Regulation 1924/2006. Every user-facing sentence needs review against the EU register before it ships.
3. **GDPR groundwork.** Age, weight, height, allergens, and goals are Article 9 special category data. Needed: explicit granular consent at intake, a processing register, data processing agreements with Vercel, MariaDB Cloud and Resend, a documented retention period, and working export and erasure. Not a lawyer, so get one.
4. **Screening policy owned by a clinician, not by me.** The thresholds in `src/lib/nutrition/screening.ts` are placeholders with conservative defaults. A qualified professional signs off the final numbers before launch.
5. **Vulnerable-user policy.** A written decision on what happens when screening refuses a deficit: what the person sees, whether they are refunded, and who they are referred to.

## 3. Phases

Each phase ends with a green `pnpm build`, a deployed preview, and a manual walkthrough. Do not start a phase before the previous one is walked through.

### Phase 1 - Foundation
1. `create-next-app` with TypeScript strict, App Router, pnpm.
2. `src/app/globals.css` with the full three-layer token system. This lands before any component, so there is never a hex to migrate later.
3. Validated env module. Every secret required at boot, no silent fallbacks.
4. `src/lib/db.ts`, generated Prisma client, singleton.
5. ESLint rules that fail the build on raw hex in `.tsx` and on banned Tailwind palette utilities. The token rule has to be machine-enforced or it will erode.

Done when: an empty page renders from tokens only, dark mode flips with a class, and a deliberate `bg-[#007AFF]` fails lint.

### Phase 2 - Schema and auth
1. `prisma/schema.prisma` as supplied, reviewed, then `prisma migrate diff` to SQL, hand-reviewed, `prisma migrate deploy`.
2. Better Auth with email and magic link. No passwords for MVP, which removes a whole class of storage risk.
3. Route protection on `/portal/*` and `/api/portal/*`, server-side session resolution, 401 without one.
4. Seed script for a test account. Test data only, never production data locally.

Done when: an unauthenticated request to a portal route returns 401 and a magic link logs in.

### Phase 3 - Intake and plan engine
1. Zod schemas for the intake payload, shared client and server.
2. `POST /api/portal/biometrics`, session-guarded, validated, upserts the profile.
3. Multi-step intake form. Allergens and exclusions are checkbox enums covering the EU 14 plus the slot list. The free-text field is stored and shown to a human reviewer, and never parsed by code.
4. `screening.ts` gate, then `plan-engine.ts`. Two-pass swap resolution, deterministic output, unit tests with fixtures for: allergen hard-block, swap reallocation, screening refusal, under-18 refusal, unit conversion.

Done when: the fixtures pass, and a profile declaring a shellfish allergy provably cannot receive a bivalve slot in any code path.

### Phase 4 - Portal
1. Plan view, current week, per-slot portions.
2. Weekly list view.
3. Locked-tier states as real empty states, not `alert()`.
4. Biomarker reference view, read-only, no targets, professional-consultation notice. Ships only if Phase 2 of content review has cleared it.
5. Content-missing empty states everywhere, since content lands after code.

Done when: every entitlement combination renders without a crash, and a missing content key shows an empty state rather than throwing.

### Phase 5 - Automation
1. `POST /api/webhooks/surecart` with HMAC over raw body, timestamp window, event-id idempotency, entitlement mapping from SKU.
2. `src/lib/mail.ts`, the only Resend caller. Unsubscribe token in every marketing send, `List-Unsubscribe` headers.
3. `GET /api/cron/weekly-drop`, batched, capped per invocation, one `EmailDrop` row per user per week with a unique constraint, cursor advanced only after a confirmed send.
4. Vercel cron entry, `CRON_SECRET` set.

Done when: replaying a webhook is a no-op, an unsigned webhook is rejected, and a cron re-run sends zero duplicates.

### Phase 6 - Localisation
1. `next-intl`, message catalogues per locale, EN and FI.
2. Every string comes from a catalogue. A missing key falls back to EN and logs, it never renders `undefined`.

Done when: switching locale changes every visible string, and deleting an FI key degrades to EN without a crash.

## 4. Deliberately out of MVP scope

1. Core Offer 2 and 3. Ship the entitlement flags, not the modules.
2. Self-serve upgrades in-app. Upgrades happen on WordPress and arrive by webhook.
3. Intuitive-eating lessons. Blocked on dietitian authorship, see §2.
4. The 52-week rotation. Eight weeks are genuinely authored. The previous document generated the other 44 procedurally, which produced a repeating four-week cycle wearing a 52-week label. Ship eight authored weeks and cycle them honestly, and label it as such, until real content exists.
5. Hand-scale measurements. One unit system for MVP, either grams or household portions, chosen with the dietitian.

## 5. Environment

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
RESEND_API_KEY=
SURECART_WEBHOOK_SECRET=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

All required at boot via the env module. No defaults.

## 6. Open decisions needed from you

1. Which WordPress commerce plugin actually fires the webhook, and does it sign the body. If it cannot sign, we need a proxy that can, because unsigned entitlement grants are not shippable.
2. Grams or household portions for MVP.
3. Whether the biomarker view ships at all, given it is the highest-risk content surface.
4. Who the dietitian is and when they can start, since content is on the critical path for Phases 4 and 6.
